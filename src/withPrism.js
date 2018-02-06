import React, {Component} from 'react'
import {StyleSheet} from 'react-native'
import propTypes from './propTypes'
import withContext from './withContext'
import {processor} from './Processor'

const computeStyles = (pluginOptions) => {
  const {
    definition,
    context,
    props,
    state,
    attrName,
    isPrimaryStyle,
    additionalProperties} = pluginOptions

  const {config, registry, options, ns} = definition
  const {plugins} = options

  let sheets = []

  // TODO: prepare this in processPlugins
  let keys = config.availablePropertyNames.slice()
  const map = config.availablePropertyPlugins
  // Only run plugins when we have a defined property
  keys = keys.filter((propName) => {
    return (
      (props && props[propName] !== undefined) ||
      (context && context[propName] !== undefined)
    )
  })

  plugins.globals.forEach((plugin) => {
    const style = plugin.func(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
    }
  })

  const runPropertyPlugins = (keys, props) => {
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
    runPropertyPlugins(keys, props)
  }

  // Add inline `style`, `labelStyle` etc.
  const style = props[attrName]
  if (style) {
    sheets = sheets.concat(style)
  }

  // NOTE: We only execute for the style attribute
  // NOTE: and assume that the child style objects
  // NOTE: will be passed to the `style` attribute
  // NOTE: of another `Prism` component for further
  // NOTE: processing.
  //
  // NOTE: If this were not the case invariants like
  // NOTE: textTransform would be applied to the parent
  // NOTE: component.
  if (processor.hasPreProcessors && isPrimaryStyle) {
    const flat = StyleSheet.flatten(sheets)
    const expansions = processor.process(flat, pluginOptions)
    const keys = Object.keys(expansions)
    if (keys.length) {
      for (let k in expansions) {
        additionalProperties[k] = expansions[k]
      }
      //runPropertyPlugins(keys, expansions)
    }
    return options.flat ? flat : [flat]
  }

  if (options.flat) {
    return StyleSheet.flatten(sheets)
  }

  return sheets
}

// High order component wrapper
const withPrism = (Stylable, definition) => {
  const {config} = definition
  class PrismComponent extends Component {
    state = {
      styleAttributes: {},
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
        config,
        definition,
        options,
        context,
        props,
        state,
        ns,
        registry,
        isPrimaryStyle,
        attrName,
        ...extras
      }
    }

    processStylePlugins (props) {
      const {registry, options} = definition
      const {state, context} = this
      const {allStyleObjectNames} = options
      let styleAttributes = {}
      allStyleObjectNames.forEach((name) => {
        styleAttributes[name] = []
      })

      // Allows property injection via the plugin system
      const additionalProperties = {}

      // Compute style properties
      allStyleObjectNames.forEach((attrName) => {
        const pluginOptions = this.getPluginOptions(
          attrName, props, {additionalProperties})
        styleAttributes[attrName] = computeStyles(pluginOptions)
      })

      // Update the state so styles are reactive
      this.setState({styleAttributes: styleAttributes, additionalProperties})
    }

    // So that changes to style properties are
    // reflected in the stylable component
    componentWillReceiveProps (props) {
      // TODO: proper invalidation
      this.processStylePlugins(props)
    }

    componentWillMount () {
      this.processStylePlugins(this.props)
    }

    render () {
      // Preferring children in the state lets children
      // be rewritten (textTransform support)
      const children = this.state.children || this.props.children
      return (
        <Stylable
          ref='stylable'
          {...this.props}
          {...this.state.additionalProperties}
          {...this.state.styleAttributes}>
          {children}
        </Stylable>
      )
    }
  }

  // So we can easily see the underlying component name in errors
  PrismComponent.displayName = `Prism(${definition.Name})`
  // Proxy propTypes
  PrismComponent.propTypes = Stylable.propTypes

  return PrismComponent
}

export default withPrism
