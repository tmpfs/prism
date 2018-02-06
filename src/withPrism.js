import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import propTypes from './propTypes'
import withContext from './withContext'

import {processor} from './Processor'

const computeStyles = (
  {
    definition,
    context,
    props,
    state,
    additionalProperties,
    attrName
  }) => {

  const style = props[attrName]
  const {config, registry, options, ns, Name} = definition
  const {plugins} = options
  const {styleSheet, colors, invariants} = registry
  const isPrimaryStyle = (attrName === 'style')

  let sheets = []

  let styleRuleName = ns.componentClassName

  if (!isPrimaryStyle) {
    // Add child class name style sheet
    styleRuleName = ns.getChildClassName(attrName)

    if (invariants[styleRuleName]) {
      sheets.push(invariants[styleRuleName])
    }
  }

  if (styleSheet[styleRuleName]) {
    sheets.push(styleSheet[styleRuleName])
  }

  let keys = config.availablePropertyNames.slice()
  const map = config.availablePropertyPlugins

  // Only run plugins when we have a defined property
  keys = keys.filter((propName) => {
    return (
      (props && props[propName] !== undefined) ||
      (context && context[propName] !== undefined)
    )
  })

  // Process plugins
  const pluginOptions = {
    context,
    props,
    state,
    ns,
    config,
    definition,
    registry,
    styleSheet,
    options,
    colors,
    isPrimaryStyle,
    attrName
  }

  const runGlobalPlugins = (globals) => {
    globals.forEach((plugin) => {
      pluginOptions.plugin = plugin
      const style = plugin.func(pluginOptions)
      if (style) {
        sheets = sheets.concat(style)
      }
    })
  }

  //console.log(`Compute ${definition.Name}: ${plugins.globals.length}`)

  // Run before global plugins
  runGlobalPlugins(plugins.globals)

  const runPropertyPlugins = (keys, props) => {
    // Run property plugins
    keys.forEach((propName) => {
      const plugin = map[propName]
      if (plugin) {
        pluginOptions.plugin = plugin
        pluginOptions.propName = propName
        pluginOptions.prop = props[propName]
        const style = plugin.func(pluginOptions)
        if (style) {
          sheets = sheets.concat(style)
        }
      }
    })
  }

  if (isPrimaryStyle) {
    runPropertyPlugins(keys, props)
  }

  // Add inline `style` property
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

    processStylePlugins (props) {
      const {registry, options} = definition
      const {state, context} = this
      const {allStyleObjectNames} = options
      let styleAttributes = {}
      allStyleObjectNames.forEach((name) => {
        styleAttributes[name] = []
      })

      const additionalProperties = {}

      // Compute style properties
      allStyleObjectNames.forEach((attrName) => {
        const computedStyle = computeStyles(
          {
            definition,
            context,
            props,
            state,
            attrName,
            additionalProperties
          })
        styleAttributes[attrName] = computedStyle
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
