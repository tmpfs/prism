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

const compile = (decl) => {
  const sheet = {decl}
  const compiled = StyleSheet.create(sheet)
  return compiled.decl
}

const Configuration = {
  // TODO: document this config option
  colorProperties: [
    'color',
    'backgroundColor',
    'borderColor',
    'background'
  ],
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
  return plugins.map((plugin) => registerPlugin(plugin))
}

const registerPlugin = (plugin) => {
  // Named plugin as array
  if (Array.isArray(plugin)) {
    const valid = (plugin.length === 2 || plugin.length === 3) &&
      typeof(plugin[0] === 'string') && plugin[0] &&
      typeof(plugin[1] === 'function')
    if (valid) {
      const name = plugin[0]
      // Prop type given
      if (plugin.length === 3 && typeof(plugin[2]) !== 'function') {
        throw new Error('Prism: function expected for plugin propType')
      }
      return new Plugin(name, plugin[1], plugin[2])
    }
  }
  throw new Error('Prism: invalid plugin definition')
}

const getStyleSheet = ({props, definition, propertyName, plugins}) => {
  const style = props[propertyName]

  const {config, options, registry, namespace} = definition
  const {styleSheet, colors} = registry

  let componentClassName = namespace ?
    `${namespace}.${definition.Name}` : definition.Name

  // Passing style to nested child component
  if (propertyName && propertyName !== STYLE) {
    const childClassName = propertyName.charAt(0).toUpperCase() +
      propertyName.slice(1)
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

  //const plugins = config.plugins || []
  plugins.forEach((plugin) => {
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
        stylePropertyNames.forEach((propertyName) => {
          if (testFunc({props, propertyName})) {
            const fullPropertyName = this.getStylePropertyName(propertyName)
            const availableProperties = styleProperties[propertyName]
            // TODO: only run global plugins once?
            let stylePlugins = globals.slice()
            let propertyPlugins = property.filter((plugin) => {
              const ind = availableProperties.indexOf(plugin.name)
              const matched = ind > -1
              if (matched) {
                availableProperties.splice(ind, 1)
              }
              return matched
            })
            const plugins = stylePlugins.concat(propertyPlugins)
            const computedStyle = getStyleSheet({props, definition, propertyName, plugins})
            // Some declared properties did not match
            // a plugin so we pass them through verbatim
            if (availableProperties.length) {
              const verbatim = {}
              availableProperties.forEach((name) => {
                verbatim[name] = props[name]
              })
              console.log(verbatim)
              computedStyle.push(verbatim)
            }
            mutableStyleValues[fullPropertyName] = computedStyle
          }
        })
        this.setState({styleValues: mutableStyleValues})
      }

      // So that changes to style properties are
      // reflected in the stylable component
      componentWillReceiveProps (props) {
        this.processStylePlugins(props, ({propertyName}) => {
          // TODO: proper invalidation
          return props[propertyName] && this.props[propertyName]
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
