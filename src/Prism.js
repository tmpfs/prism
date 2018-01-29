import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import StyleRegistry from './StyleRegistry'
import Plugins from './Plugins'
import ExtendedPropertyPlugins from './ExtendedPropertyPlugins'
import propTypes from './PropTypes'

const compile = (decl) => {
  const sheet = {decl}
  const compiled = StyleSheet.create(sheet)
  return compiled.decl
}

const Configuration = {
  colorProperties: [
    'color',
    'backgroundColor',
    'borderColor',
    'background'
  ],
  propTypes: propTypes,
  plugins: null
}

// The actual final plugins
Object.defineProperty(Configuration, 'runtime', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: []
})

const registerPlugins = (plugins) => {
  if (!Array.isArray(plugins)) {
    throw new Error(`Plugins must be an array of plugin definitions`)
  }
  return plugins.map((plugin) => registerPlugin(plugin))
}

class Plugin  {
  constructor (name, func, propType = null) {
    this.name = name
    this.func = func
    this.propType = propType
  }
}

const registerPlugin = (plugin) => {
  // Named plugin as array
  if (Array.isArray(plugin)) {
    const valid = (plugin.length === 2 || plugin.length === 3) &&
      typeof(plugin[0] === 'string') && plugin[0] &&
      typeof(plugin[1] === 'function')
    if (valid) {
      const name = plugin[0]
      //console.log('Registering plugin with name: ' + name)
      // Prop type given
      if (plugin.length === 3 && typeof(plugin[2]) !== 'function') {
        throw new Error('Prism: function expected for plugin propType')
      }
      return new Plugin(name, plugin[1], plugin[2])
    }
  }
  throw new Error('Prism: invalid plugin definition')
}

const getStyleSheet = ({props, definition}) => {
  const {style} = props
  const {config, options, registry} = definition

  const {styleSheet, colors} = registry
  const defaultClassStyle = styleSheet[definition.Name] ?
    [styleSheet[definition.Name]] : []

  let {defaultStyles, inherit} = options

  if (defaultStyles && inherit) {
    defaultStyles = defaultStyles.concat(defaultClassStyle)
  }

  // Look up default styles by class name
  if (!defaultStyles) {
    defaultStyles = defaultClassStyle
  }

  let sheets = []

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

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

  const plugins = config.plugins || []
  plugins.forEach((plugin) => {
    const style = plugin.func(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
    }
  })

  return sheets
}

// Register a stylable component type.
//
// Likely the registry has not been set yet.
const Prism = (Type) => {
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
            'No style registry configured, did you forget to call Prism.configure()?')
        }
        if (!definition.registry.styleSheet) {
          throw new Error(
            'No style sheet available, did you forget to call styleRegistry.addStyleSheet()?')
        }
      }

      state = {
        style: []
      }

      setNativeProps (props) {
        const {stylable} = this.refs
        if (stylable.setNativeProps) {
          stylable.setNativeProps(props)
        }
      }

      // So that changes to `style` are
      // reflected in the stylable
      componentWillReceiveProps (props) {
        // TODO: proper invalidation
        if (props.style && this.props.style) {
          const style = getStyleSheet({props, definition})
          this.setState({style})
        }
      }

      componentWillMount () {
        const {props} = this
        const style = getStyleSheet({props, definition})
        this.setState({style})
      }

      render () {
        return (
          <Stylable
            ref='stylable'
            {...this.props}
            style={this.state.style}
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

  const definition = {Type, Name, styleOptions, mapPropsToStyle}
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
  definition.options = {}
  if (styleOptions) {
    const options = styleOptions({...registry, compile})
    const {defaultStyles} = options
    if (defaultStyles && !Array.isArray(defaultStyles)) {
      throw new Error(
        'Default styles should be an array of objects')
    }

    definition.options = options
  }

  // Validate mapPropsToStyle
  if (mapPropsToStyle) {
    if(mapPropsToStyle.toString() !== '[object Object]') {
      throw new Error(
        `Static mapPropsToStyle must be a plain object`)
    }
    for (let k in mapPropsToStyle) {
      if (!(mapPropsToStyle[k] instanceof Function)) {
        throw new Error(
          `Function for mapPropsToStyle field ${k} expected`)
      }
    }
  }

  // Merge config propTypes into the Stylable propTypes.
  //
  // On collision the underlying component propTypes win.
  const propertyTypes = Object.assign({}, config.propTypes, Type.propTypes)
  Type.propTypes = propertyTypes

  // TODO: support multiple registries
  // TODO: merge if we have an existing registry?
  definition.config = config
  definition.registry = registry
}

Prism.components = []
Prism.configure = (registry, config = {}) => {
  if (!(registry instanceof StyleRegistry)) {
    throw new Error('You must pass a StyleRegistry to configure')
  }

  let systemPlugins = !config.disabled ? Plugins : []
  if (config.extendedProperties) {
    systemPlugins = systemPlugins.concat(ExtendedPropertyPlugins)
  }

  let plugins = Array.isArray(config.plugins) ? config.plugins : systemPlugins

  // Register the default plugins
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
  console.log('Final plugins length: ' + plugins.length)

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
