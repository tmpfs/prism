import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import StyleRegistry from './StyleRegistry'
import Plugins from './Plugins'
import ExtendedPropertyPlugins from './ExtendedPropertyPlugins'
import propTypes from './PropTypes'

const STYLE = 'style'

const isObject = (o) => {
  return o && o.toString() === '[object Object]'
}

const isFunction = (fn) => (fn instanceof Function)

const compile = (decl) => {
  const sheet = {decl}
  const compiled = StyleSheet.create(sheet)
  return compiled.decl
}

const Configuration = {
  plugins: null
}

class Plugin  {
  constructor (name, func, propType = null) {
    this.name = name
    this.func = func
    this.propType = propType
  }
}

const registerPlugins = (plugins) => {
  if (!Array.isArray(plugins)) {
    throw new Error('Prism: plugins must be an array')
  }
  return plugins.reduce((list, plugin) => {
    list = list.concat(registerPlugin(plugin))
    return list
  }, [])
}

const registerPlugin = (plugin) => {
  // Named plugin as array
  if (Array.isArray(plugin)) {
    const isGlobal = plugin.length === 2 &&
      typeof(plugin[0]) === 'string' && isFunction(plugin[1])
    const isProperty = plugin.length === 2 &&
      isFunction(plugin[0]) && isObject(plugin[1])

    if (isGlobal) {
      return new Plugin(plugin[0], plugin[1])
    }

    if (isProperty) {
      const keys = Object.keys(plugin[1])
      if (!keys.length) {
        throw new Error('Prism plugin definition with no propType keys')
      }
      return keys.map((propName) => {
        return new Plugin(propName, plugin[0], plugin[1][propName])
      })

      return new Plugin(name, plugin[1], plugin[2])
    }
  }
  throw new Error('Prism: invalid plugin definition')
}

const getStyleSheet = ({props, definition, attrName, plugins}) => {
  const style = props[attrName]

  const {config, options, registry, namespace} = definition
  const {styleSheet, colors} = registry

  let componentClassName = namespace ?
    `${namespace}.${definition.Name}` : definition.Name

  // Passing style to nested child component
  if (attrName && attrName !== STYLE) {
    const childClassName = attrName.charAt(0).toUpperCase() +
      attrName.slice(1)
    componentClassName += '.' + childClassName
  }

  const defaultClassStyle = styleSheet[componentClassName] ?
    [styleSheet[componentClassName]] : []

  let {defaultStyles, inherit} = options

  if (defaultStyles && inherit) {
    defaultStyles = defaultStyles.concat(defaultClassStyle)
  }

  // Use default component class style
  if (!defaultStyles) {
    defaultStyles = defaultClassStyle
  }

  let sheets = []

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  // Process plugins
  const pluginOptions = {
    config,
    definition,
    registry,
    props,
    styleSheet,
    options,
    colors
  }

  plugins.globals.forEach((plugin) => {
    const style = plugin.func(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
    }
  })

  const {keys, map} = plugins.property
  keys.forEach((propName) => {
    const plugin = map[propName]
    pluginOptions.propName = propName
    pluginOptions.prop = props[propName]
    const style = plugin.func(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
    }
  })

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

  return sheets
}

// Register a stylable component type.
//
// Likely the registry has not been set yet.
const Prism = (Type, namespace = '') => {
  const Name = Type.name

  let styleOptions
  let mapPropsToStyle = Type.mapPropsToStyle
  if (Type.styleOptions instanceof Function) {
    styleOptions = Type.styleOptions
  }

  // High order component wrapper
  const Wrapped = (Stylable, definition) => {
    class PrismComponent extends Component {

      constructor (props) {
        super(props)
        if (!definition.registry) {
          throw new Error(
            'Prism: no style registry configured, ' +
            'did you forget to call Prism.configure()?')
        }
        if (!definition.registry.styleSheet) {
          throw new Error(
            'Prism: no style sheet available, ' +
            'did you forget to call styleRegistry.addStyleSheet()?')
        }
        // Class level processing options
        const {options} = definition
        const state = {
          styleValues: {}
        }

        // Initialize empty styles, following the convention
        options.stylePropertyNames.forEach((name) => {
          name = this.getStylePropertyName(name)
          state.styleValues[name] = []
        })
        this.state = state
      }

      getStylePropertyName (name) {
        if (name !== STYLE && !/Style$/.test(name)) {
          name += 'Style'
        }
        return name
      }

      setNativeProps (props) {
        const {stylable} = this.refs
        if (stylable.setNativeProps) {
          stylable.setNativeProps(props)
        }
      }

      processStylePlugins (props, testFunc = () => true) {
        const {options} = definition
        const {stylePropertyNames, styleProperties} = options
        const {globals, property} = options.plugins
        const {styleValues} = this.state
        let mutableStyleValues = Object.assign({}, styleValues)
        stylePropertyNames.forEach((attrName) => {
          if (testFunc({props, attrName})) {
            const fullPropertyName = this.getStylePropertyName(attrName)
            const availableProperties = styleProperties[attrName]

            // TODO: only run global plugins once!

            // Filter to properties available for this property attribute
            // Eg: style, labelStyle, imageStyle etc
            let propertyMap = {}
            let propertyPlugins = property.reduce((list, plugin) => {
              if (~availableProperties.indexOf(plugin.name)) {
                propertyMap[plugin.name] = plugin
                list.push(plugin.name)
              }
              return list
            }, [])
            const plugins = {
              globals: globals,
              property: {
                keys: propertyPlugins,
                map: propertyMap
              }
            }
            const computedStyle = getStyleSheet({props, definition, attrName, plugins})
            mutableStyleValues[fullPropertyName] = computedStyle
          }
        })
        this.setState({styleValues: mutableStyleValues})
      }

      // So that changes to style properties are
      // reflected in the stylable component
      componentWillReceiveProps (props) {
        this.processStylePlugins(props, ({attrName}) => {
          // TODO: proper invalidation
          return props[attrName] && this.props[attrName]
        })
      }

      componentWillMount () {
        this.processStylePlugins(this.props)
      }

      render () {
        return (
          <Stylable
            ref='stylable'
            {...this.props}
            {...this.state.styleValues}
            //style={this.state.style}
            styleRegistry={definition.registry}
            styleFlexRow={this.props.direction === 'row'}
            styleSheet={definition.registry.styleSheet} />
        )
      }
    }

    PrismComponent.propTypes = Stylable.propTypes
    PrismComponent.defaultProps = Stylable.defaultProps

    return PrismComponent
  }

  const definition = {Type, Name, styleOptions, mapPropsToStyle, namespace}
  const NewType = Wrapped(Type, definition)
  definition.NewType = NewType

  if (!Prism.registry) {
    // Collect components before a registry is available,
    // these will be registered when Prism.configure() is called
    Prism.components.push(definition)
  } else {
    // Already configured so register directly
    registerComponent(Prism.registry, definition, Prism.config)
  }

  return NewType
}

const registerComponent = (registry, definition, config) => {
  const {Type, Name, styleOptions, mapPropsToStyle} = definition
  const {plugins} = config
  //definition.options = {}
  let options = {}
  if (styleOptions) {
    options = styleOptions({...registry, compile})
    const {defaultStyles} = options
    if (defaultStyles && !Array.isArray(defaultStyles)) {
      throw new Error(
        'Prism: default styles should be an array of objects')
    }
  }

  const availablePropertyNames = config.plugins
    .filter((plugin) => plugin.propType)
    .map((plugin) => plugin.name)

  let {styleProperties} = options
  // User defined style property names
  if (styleProperties !== undefined) {
    if (!isObject(styleProperties)) {
      throw new Error(
        'Prism: styleProperties should be a plain object')
    }

    const assignedPropertyNames = Object.keys(styleProperties)
      .reduce((list, propName) => {
        list = list.concat(styleProperties[propName])
        return list
      }, [])

    // Configure handling for style property
    // when not explicitly specified
    if (!styleProperties.style) {
      styleProperties.style = availablePropertyNames
        .filter((propName) => !~assignedPropertyNames.indexOf(propName))
    }
  }

  // Default style property support, all
  // names are mapped to the default style object
  if (!styleProperties) {
    styleProperties = {
      style: availablePropertyNames
    }
  }

  options.styleProperties = styleProperties
  options.stylePropertyNames = Object.keys(styleProperties)

  const globalPlugins = plugins.filter((plugin) => !plugin.propType)
  const propertyPlugins = plugins.filter((plugin) => plugin.propType)

  //console.log('Assigning component options, split plugins' + globalPlugins.length)
  //console.log('Assigning component options, split plugins' + propertyPlugins.length)

  options.plugins = {
    property: propertyPlugins,
    globals: globalPlugins
  }

  definition.options = options

  // Validate mapPropsToStyle
  if (mapPropsToStyle) {
    if(!isObject(mapPropsToStyle)) {
      throw new Error(
        'Prism: static mapPropsToStyle must be a plain object')
    }
    for (let k in mapPropsToStyle) {
      if (!(mapPropsToStyle[k] instanceof Function)) {
        throw new Error(
          `Prism: function for mapPropsToStyle field ${k} expected`)
      }
    }
  }

  // Merge config propTypes into the Stylable propTypes.
  //
  // On collision the underlying component propTypes win.
  const systemPropTypes = {}
  plugins.forEach((plugin) => {
    if (plugin.propType) {
      systemPropTypes[plugin.name] = plugin.propType
    }
  })
  const propertyTypes = Object.assign({}, systemPropTypes, Type.propTypes)
  Type.propTypes = propertyTypes

  // TODO: support multiple registries
  // TODO: merge if we have an existing registry?
  definition.config = config
  definition.registry = registry
}

Prism.components = []
Prism.configure = (registry, config = {}) => {
  if (!(registry instanceof StyleRegistry)) {
    throw new Error('Prism: you must pass a StyleRegistry to configure')
  }

  let systemPlugins = Plugins
  if (config.extendedProperties) {
    systemPlugins = systemPlugins.concat(ExtendedPropertyPlugins)
  }

  let plugins = Array.isArray(config.plugins) ? config.plugins : systemPlugins

  // Register the plugins
  plugins = registerPlugins(plugins)

  if (Array.isArray(config.additionalPlugins)) {
    plugins = plugins.concat(
      registerPlugins(config.additionalPlugins))
  }

  // Process flags that disable plugins
  if (Array.isArray(config.disabledPlugins)) {
    plugins = plugins.filter((plugin) => {
      return !~config.disabledPlugins.indexOf(plugin.name)
    })
  }

  Prism.config = Object.assign({}, Configuration, config)

  if (config.debug) {
    console.log(`Prism configured with ${plugins.length} plugins`)
    plugins.forEach((plugin) => {
      console.log(`Prism using plugin "${plugin.name}"`)
    })
  }

  // Ensure we use the computed plugins
  Prism.config.plugins = plugins

  if (!Array.isArray(Prism.config.plugins)) {
    throw new Error('Prism: array expected for plugins list')
  }

  // Components exported before the registry was configured
  Prism.components.forEach((definition) => {
    registerComponent(registry, definition, Prism.config)
  })

  Prism.registry = registry
}

Prism.propTypes = propTypes

export {StyleRegistry, Prism}
