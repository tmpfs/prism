import React, {Component} from 'react'

import ComponentDefinition from './ComponentDefinition'
import StyleRegistry from './StyleRegistry'
import {Rule, processor} from './Processor'
import Namespace from './Namespace'
import Plugin from './Plugin'

import computeStyleOptions from './computeStyleOptions'
import defaultStyleRulePlugin from './defaultStyleRule'
import mapPropsToStylePlugin from './mapPropsToStyle'
import mapStyleToPropsPlugin from './mapStyleToProps'
import classNamePlugin from './className'
import extendedPropertyPlugins from './extendedPropertyPlugins'
import experimentalPlugins from './experimentalPlugins'
import propTypes from './propTypes'
import withPrism from './withPrism'
import withContext from './withContext'
import colorNames from './colorNames'
import textTransform from './textTransform'

// ANOMALY: should not be here
import tintColor from './tintColor'

import util from './util'

const {
  isObject,
  isFunction,
  isString} = util

const Configuration = {
  plugins: [],
  processors: [],
  className: true,
  defaultStyleRule: true,
  mapPropsToStyle: true,
  mapStyleToProps: true,
  colorNames: false,
  textTransform: false,
  sizes: {
    'xx-small': 12,
    'x-small': 13,
    'small': 14,
    'medium': 16,
    'large': 18,
    'x-large': 22,
    'xx-large': 26
  }
}

const registerPlugins = (plugins) => {
  return plugins.reduce((list, plugin) => {
    list = list.concat(registerPlugin(plugin))
    return list
  }, [])
}

const registerPlugin = (plugin) => {
  if (!(plugin instanceof Plugin)) {
    throw new Error('Prism plugin must be instance of Plugin')
  }
  return plugin
}

// Register a stylable component type
const Prism = (Type, namespace = '', requirements = null) => {
  if (Prism.registry) {
    throw new Error(
      `Prism you should not call Prism() once Prism.configure() has been called, ` +
      `sorry about that. Maybe later we will support this but for the moment ` +
      `the behaviour is undefined so register components first.`)
  }

  const definition = new ComponentDefinition(Type, {namespace, requirements})

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

  config = Object.assign({}, Configuration, config)

  let plugins = config.plugins.slice()

  if (config.className) {
    plugins.push(classNamePlugin)
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

  if (config.extendedProperties) {
    plugins = plugins.concat(extendedPropertyPlugins)
  }

  if (config.experimentalPlugins) {
    plugins = plugins.concat(experimentalPlugins)
  }

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

  if (config.colorNames) {
    config.processors.push(colorNames)
  }

  if (config.tintColor) {
    config.processors.push(tintColor)
  }

  if (config.textTransform) {
    if (!config.experimentalPlugins) {
      throw new Error(
        'Prism experimentalPlugins option is required to use textTransform')
    }
    config.processors.push(textTransform)
  }

  if (config.debug) {
    console.log(
      `Prism configured with ${plugins.length} plugins`)
    plugins.forEach((plugin) => {
      console.log(
        `Prism using plugin "${plugin.name}" ${plugin.isGlobal ? '(global)' : ''}`)
    })
  }

  // Ensure we use the computed plugins
  config.plugins = plugins

  const checkRequirements = (config, requirement, definition) => {
    const {registry} = definition
    const err = requirement({registry, config})
    if (err !== undefined) {
      if ((err instanceof Error)) {
        throw err
      } else if(isString(err)) {
        throw new Error(`Prism component requirements not met: ${err}`)
      }
    }
  }

  // Iterate all defined components
  Prism.defined.forEach((definition) => {
    definition.config = config
    definition.registry = registry

    // Compute the component options (styleOptions)
    definition.options = computeStyleOptions(registry, definition, config)

    // Check component requirements
    const {requirements} = definition
    if (requirements) {
      checkRequirements(config, requirements, definition)
    }

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
          console.log(` + plugin: "${p.name}"`)
        })
      }
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

Prism.propTypes = propTypes

export {Prism, StyleRegistry, Plugin, Rule}
