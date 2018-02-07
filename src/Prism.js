import React, {Component} from 'react'

import ComponentDefinition from './ComponentDefinition'
import StyleRegistry from './StyleRegistry'
import {Rule, processor} from './Processor'
import Namespace from './Namespace'
import Plugin from './Plugin'

import configuration from './configuration'
import computeStyleOptions from './computeStyleOptions'
import defaultPropsPlugin from './defaultProps'
import defaultStyleRulePlugin from './defaultStyleRule'
import mapPropsToStylePlugin from './mapPropsToStyle'
import mapStyleToPropsPlugin from './mapStyleToProps'
import classNamePlugin from './className'
import inlineStylePlugin  from './inlineStyle'
import extendedPropertyPlugins from './extendedPropertyPlugins'
import experimentalPlugins from './experimentalPlugins'
import propTypes from './propTypes'
import withPrism from './withPrism'
import withContext from './withContext'
import colorNames from './colorNames'
import invariants from './invariants'

// Register a stylable component type
const Prism = (Type, initOptions = {}) => {
  if (Prism.registry) {
    throw new Error(
      `Prism you should not call Prism() once Prism.configure() has been called, ` +
      `sorry about that. Maybe later we will support this but for the moment ` +
      `the behaviour is undefined so register components first.`)
  }

  const definition = new ComponentDefinition(Type, initOptions)

  // Create the HOC wrapper
  definition.NewType = withPrism(Type, definition)

  // Collect components before a registry is available,
  // these will be registered later
  Prism.defined.push(definition)
  return definition.NewType
}

// All registered component definitions
Prism.defined = []

Prism.configure = (registry, config = {}) => {
  if (!(registry instanceof StyleRegistry)) {
    throw new Error(
      'Prism expects a StyleRegistry for configure()')
  }

  if (config.plugins !== undefined &&
      !Array.isArray(config.plugins)) {
    throw new Error(
      'Prism expects an array for configuration plugins')
  }

  if (config.processors !== undefined &&
      !Array.isArray(config.processors)) {
    throw new Error(
      'Prism expects an array for configuration processors')
  }

  config = Object.assign({}, configuration, config)

  let plugins = config.plugins.slice()

  if (config.defaultProps) {
    plugins.push(defaultPropsPlugin)
  }

  if (config.defaultStyleRule) {
    plugins.push(defaultStyleRulePlugin)
  }

  if (config.mapPropsToStyle) {
    plugins.push(mapPropsToStylePlugin)
  }

  if (config.mapStyleToProps) {
    plugins.push(mapStyleToPropsPlugin)
  }

  if (config.inlineStyle) {
    plugins.push(inlineStylePlugin)
  }

  if (config.className) {
    plugins.push(classNamePlugin)
  }

  if (config.extendedProperties) {
    plugins = plugins.concat(extendedPropertyPlugins)
  }

  if (config.experimentalPlugins) {
    plugins = plugins.concat(experimentalPlugins)
  }

  if (Array.isArray(config.additionalPlugins)) {
    plugins = plugins.concat(config.additionalPlugins)
  }

  // Process flags that disable plugins
  if (Array.isArray(config.disabledPlugins)) {
    plugins = plugins.filter((plugin) => {
      return !~config.disabledPlugins.indexOf(plugin.name)
    })
  }

  // Validate plugin types are correct
  plugins.forEach((plugin) => {
    if (!(plugin instanceof Plugin)) {
      throw new Error('Prism plugin must be instance of Plugin')
    }
  })

  if (config.colorNames) {
    config.processors.push(colorNames)
  }

  // Configure invariants behind flags
  if (config.textTransform) {
    if (!config.experimentalPlugins) {
      throw new Error(
        'Prism experimentalPlugins option is required to use textTransform')
    }

    // Need to ensure this style property
    // never ends up in the computed style sheet
    config.invariants.push('textTransform')
  }

  // Configure invariant processors that will remove
  // invariants from the final computed style sheet
  invariants(config)

  if (config.debug) {
    console.log(
      `Prism configured with ${plugins.length} plugins`)
    plugins.forEach((plugin) => {
      console.log(
        `Prism plugin "${plugin.name}" ${plugin.isGlobal ? '(global)' : ''}`)
    })
  }

  // Ensure we use the computed plugins
  config.plugins = plugins

  // Iterate all defined components
  Prism.defined.forEach((definition) => {
    definition.config = config
    definition.registry = registry
    // Compute the component options (styleOptions)
    definition.options = computeStyleOptions(registry, definition, config)

    // Check component requirements
    definition.checkRequirements()

    // Experimental plugins require withContext
    if (config.experimentalPlugins) {
      withContext(definition)
    }

    if (config.debug) {
      const {Name, NewType} = definition
      console.log(`${NewType.displayName} from ${Name}`)
      const {plugins} = definition.options
      // Global plugins are only enabled when the component
      // specifies a corresponding configuration so it's useful
      // to see which are enabled
      if (plugins.globals.length) {
        plugins.globals.forEach((p) => {
          console.log(` | plugin: "${p.name}"`)
        })
      }
      const {allStyleObjectNames} = definition.options
      allStyleObjectNames.forEach((name) => {
        console.log(` | prop: "${name}"`)
      })
    }
  })

  const availablePropertyNames = []
  const availablePropertyPlugins = {}
  config.plugins.forEach((plugin) => {
    if (!plugin.isGlobal && plugin.propType) {
      availablePropertyNames.push(plugin.name)
      availablePropertyPlugins[plugin.name] = plugin
    }
  })

  config.availablePropertyNames = availablePropertyNames
  config.availablePropertyPlugins = availablePropertyPlugins

  config.registry = registry

  processor.collate(config)
  registry.compile({config})

  Prism.registry = registry
}

Prism.fix = (Base, style, props = {}) => {
  class FixedComponent extends Component {
    static styleOptions = {
      fixed: true,
      supportsDimension: true
    }
    render () {
      const {style} = this.props
      return (
        <Base {...this.props} style={style}>
          {this.props.children}
        </Base>
      )
    }
  }

  FixedComponent.defaultProps = Object.assign({}, props)
  FixedComponent.defaultProps.style = style

  return Prism(FixedComponent)
}

Prism.propTypes = propTypes

export {Prism, StyleRegistry, Plugin, Rule}
