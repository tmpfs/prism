import React, {Component} from 'react'
import {StyleSheet} from 'react-native'
import propTypes from './propTypes'
import withContext from './withContext'
import {processor} from './Processor'

const computeStyles = (pluginOptions) => {
  const {
    definition,
    options,
    props,
    attrName,
    isPrimaryStyle,
    propertyPlugins,
    additionalProperties
  } = pluginOptions

  const {plugins} = options

  let sheets = []

  const runGlobalPlugins = (plugins, pluginOptions) => {
    plugins.forEach((plugin) => {
      const style = plugin.func(pluginOptions)
      if (style) {
        sheets = sheets.concat(style)
      }
    })
  }

  runGlobalPlugins(plugins.globals, pluginOptions)

  const runPropertyPlugins = (props, propertyPlugins) => {
    const {keys, map} = propertyPlugins
    // Run property plugins
    keys.forEach((propName) => {
      const plugin = map[propName]
      if (plugin) {
        const prop = props[propName]
        const style = plugin.func({...pluginOptions, prop, propName})
        if (style) {
          sheets = sheets.concat(style)
        }
      }
    })
  }

  if (isPrimaryStyle) {
    runPropertyPlugins(props, propertyPlugins)
  }

  runGlobalPlugins(plugins.after, pluginOptions)

  let flat
  if (isPrimaryStyle &&
    (plugins.flat.length || processor.hasPreProcessors)) {
    flat = StyleSheet.flatten(sheets)
    runGlobalPlugins(plugins.flat, {...pluginOptions, flat})

    // NOTE: We only execute for the style attribute
    // NOTE: and assume that the child style objects
    // NOTE: will be passed to the `style` attribute
    // NOTE: of another `Prism` component for further
    // NOTE: processing.
    //
    // NOTE: If this were not the case invariants like
    // NOTE: textTransform would be applied to the parent
    // NOTE: component.
    if (processor.hasPreProcessors) {
      processor.process(flat, pluginOptions)
    }

    sheets = [flat]
  }

  if (options.flat) {
    sheets = flat ? flat : StyleSheet.flatten(sheets)
  }

  return sheets
}

// High order component wrapper
const withPrism = (Stylable, definition) => {
  const {config} = definition

  class PrismComponent extends Component {
    state = {
      styleProperties: {},
      additionalProperties: {}
    }

    setNativeProps (props) {
      const {stylable} = this.refs
      if (stylable.setNativeProps) {
        stylable.setNativeProps(props)
      }
    }

    getPluginOptions (attrName, props, extras) {
      const {config, registry, options, ns} = definition
      const {state, context} = this
      const isPrimaryStyle = (attrName === 'style')
      return {
        ...registry,
        registry,
        config,
        definition,
        options,
        context,
        props,
        state,
        ns,
        isPrimaryStyle,
        attrName,
        ...extras
      }
    }

    getPropertyPlugins (props) {
      const {context} = this
      const {config} = definition
      // Filter property plugin execution to only
      // run for those properties that have been defined
      const map = config.availablePropertyPlugins
      const keys = config.availablePropertyNames.filter((propName) => {
        return (
          (props && props[propName] !== undefined) ||
          (context && context[propName] !== undefined)
        )
      })
      return {map, keys}
    }

    processStylePlugins (props) {
      const {registry, options} = definition
      const {state, context} = this
      const {allStyleObjectNames} = options

      const styleProperties = {}
      allStyleObjectNames.forEach((name) => {
        styleProperties[name] = []
      })

      // Allows property injection via the plugin system
      const additionalProperties = {}
      const propertyPlugins = this.getPropertyPlugins(props)

      // Compute style properties
      allStyleObjectNames.forEach((attrName) => {
        const pluginOptions = this.getPluginOptions(
          attrName, props, {additionalProperties, propertyPlugins})
        styleProperties[attrName] = computeStyles(pluginOptions)
      })

      // Update the state so styles are reactive
      this.setState({styleProperties, additionalProperties})
    }

    componentWillReceiveProps (props) {
      if (!this.pure) {
        // TODO: proper invalidation
        this.processStylePlugins(props)
      }
    }

    componentWillMount () {
      if (!this.pure) {
        this.processStylePlugins(this.props)
      }
    }

    render () {
      if (this.pure) {
        const {registry} = definition
        const {styleSheet} = registry
        return (
          <Stylable
            ref='stylable'
            {...this.props}
            styleSheet={styleSheet}
            styleRegistry={registry}>
            {this.props.children}
          </Stylable>
        )
      }

      // Preferring children in the state lets children
      // be rewritten (textTransform support)
      const children = this.state.children || this.props.children
      return (
        <Stylable
          ref='stylable'
          {...this.props}
          {...this.state.additionalProperties}
          {...this.state.styleProperties}>
          {children}
        </Stylable>
      )
    }
  }

  // So we can easily see the underlying component name in errors
  PrismComponent.displayName = `Prism(${definition.Name})`
  // Proxy propTypes
  PrismComponent.propTypes = Stylable.propTypes
  if (Stylable.defaultProps) {
    PrismComponent.inheritedDefaultProps = Object.assign({}, Stylable.defaultProps)
    PrismComponent.defaultProps = Stylable.defaultProps
    //console.log('Inheriting defaultProps')
    //console.log(PrismComponent.defaultProps)
  }

  return PrismComponent
}

export default withPrism
