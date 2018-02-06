import React, {Component} from 'react'

import StyleRegistry from './StyleRegistry'
import {Rule, processor} from './Processor'

import Namespace from './Namespace'
import Plugin from './Plugin'
import classNamePlugin from './className'
import mapPropsToStylePlugin from './mapPropsToStyle'

import extendedPropertyPlugins from './extendedPropertyPlugins'
import experimentalPlugins from './experimentalPlugins'

import propTypes from './propTypes'
import withPrism from './withPrism'
import withContext from './withContext'
import util from './util'

import colorNames from './colorNames'
import tintColor from './tintColor'
import textTransform from './textTransform'

const STYLE = 'style'

const {
  isObject,
  isFunction,
  isString,
  isArray
  } = util

const Configuration = {
  plugins: null,
  processors: [],
  className: true,
  mapPropsToStyle: true,
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

const fnOrObj = {
  fn: (o) => isFunction(o) || isObject(o),
  type: 'function or object'
}

const mapPluginTypeTests = {
  mapPropsToStyle: fnOrObj,
  mapStyleToProps: fnOrObj
}

const mapPluginNames = Object.keys(mapPluginTypeTests)

const registerPlugins = (plugins) => {
  if (!Array.isArray(plugins)) {
    throw new Error('Prism plugins must be an array')
  }
  return plugins.reduce((list, plugin) => {
    list = list.concat(registerPlugin(plugin))
    return list
  }, [])
}

const registerPlugin = (plugin) => {
  // Named plugin as array
  if (Array.isArray(plugin)) {
    const isGlobal = plugin.length >=2 &&
      typeof(plugin[0]) === 'string' && isFunction(plugin[1])
    const isProperty = plugin.length === 2 &&
      isFunction(plugin[0]) && isObject(plugin[1])

    if (isGlobal) {
      return new Plugin(plugin[0], plugin[1], plugin[2], true, plugin[3])
    }

    if (isProperty) {
      const keys = Object.keys(plugin[1])
      if (!keys.length) {
        throw new Error('Prism plugin definition with no propType keys')
      }

      if (keys.length !== 1) {
        throw new Error(
          'Prism plugin definition propType keys must be of length one, ' +
          'use multiple plugins for multiple properties'
        )
      }

      return keys.map((propName) => {
        return new Plugin(propName, plugin[0], plugin[1][propName])
      })

      return new Plugin(name, plugin[1], plugin[2])
    }
  }
  throw new Error('Prism invalid plugin definition')
}

// Register a stylable component type.
//
// Likely the registry has not been set yet.
const Prism = (Type, namespace = '', requirements = null) => {
  const Name = Type.name

  let styleOptions = Type.styleOptions
  if (styleOptions && !isFunction(styleOptions)) {
    throw new Error(
      `Prism styleOptions for ${Name} must be a function`)
  }

  if (namespace && !isString(namespace)) {
    throw new Error(
      `Prism namespace for ${Name} is not a string, got type ${typeof(namespace)}`)
  }

  const definition = {Type, Name, styleOptions, namespace, requirements}
  const NewType = withPrism(Type, definition)
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
  const {Type, Name, styleOptions, requirements} = definition
  const {plugins} = config

  if (requirements && !isFunction(requirements)) {
    throw new Error('Prism component requirements must be a function')
  }

  let options = {}
  if (styleOptions) {
    options = styleOptions(registry)
  }

  // Merge component-specific style registries
  if ((options.registry instanceof StyleRegistry)) {
    registry.assign(options.registry)
  }

  // Allow declaring mapPropsToStyle etc. as static on the Type
  mapPluginNames.forEach((name) => {
    if (options[name] !== undefined && Type[name] !== undefined) {
      throw new Error(
        `Prism you declared ${name} as static on ${Name} and also in styleOptions. ` +
        `This is not allowed, choose one of the other declaration style.`)
    }

    if (Type[name] !== undefined) {
      options[name] = Type[name]
    }

    const test = mapPluginTypeTests[name]
    // Got a declaration, validate it
    if (options[name] !== undefined && !test.fn(options[name])) {
      throw new Error(
        `Prism you declared ${name} as an invalid type, expected ${test.type} ` +
        `but got ${typeof(options[name])}`
      )
    }
  })

  let {mapStyleToProps} = options
  let childComponentNames = []
  // User defined style property names
  if (mapStyleToProps !== undefined) {
    if (util.isFunction(mapStyleToProps)) {
      mapStyleToProps = mapStyleToProps(registry)
    }

    //if (mapStyleToProps.style !== undefined) {
      //if (!Array.isArray(mapStyleToProps.style)) {
        //throw new Error(
          //`Prism mappings for "style" in mapStyleToProps must be an array`)
      //}

      //// We expect the keys for mapStyleToProps to only refer
      //// to child styles so we extract `style` when given
      //options.styleForceInclusion = mapStyleToProps.style
      //delete mapStyleToProps.style
    //}

    let k, v
    for (k in mapStyleToProps) {
      v = mapStyleToProps[k]
      if (isObject(v)) {
        childComponentNames.push(k)
      }
    }
  }

  if (!options.styleForceInclusion) {
    options.styleForceInclusion = []
  }

  if (!mapStyleToProps) {
    mapStyleToProps = {}
  }

  // Default style property support
  options.mapStyleToProps = mapStyleToProps

  const allStyleObjectNames = [STYLE].concat(childComponentNames)
  options.childComponentNames = childComponentNames

  const globalPlugins = plugins
    .filter((plugin) => {
      return plugin.isGlobal && options.hasOwnProperty(plugin.name)
    })

  const propertyPlugins = plugins.filter(
    (plugin) => !plugin.isGlobal)

  options.plugins = {
    property: propertyPlugins,
    globals: globalPlugins
  }

  definition.options = options

  // Merge config propTypes into the Stylable propTypes.
  //
  // On collision the underlying component propTypes win.
  const systemPropTypes = {}
  plugins.forEach((plugin) => {
    if (plugin.propType && !plugin.isGlobal) {
      systemPropTypes[plugin.name] = plugin.propType
    }
  })
  const propertyTypes = Object.assign(
    {}, systemPropTypes, Type.propTypes)
  Type.propTypes = propertyTypes

  allStyleObjectNames.forEach((name) => {
    // Automatic propTypes for style, labelStyle, imageStyle etc.
    Type.propTypes[name] = propTypes.style
  })

  //console.log(Object.keys(Type.propTypes))

  definition.config = config
  definition.registry = registry

  Prism.defined.push(definition)
}

// This keeps track of components initialized before configure()
Prism.components = []
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

  let systemPlugins = []

  if (config.mapPropsToStyle) {
    systemPlugins = systemPlugins.concat(mapPropsToStylePlugin)
  }

  if (config.className) {
    systemPlugins = systemPlugins.concat(classNamePlugin)
  }

  if (config.extendedProperties) {
    systemPlugins = systemPlugins.concat(extendedPropertyPlugins)
  }
  if (config.experimentalPlugins) {
    systemPlugins = systemPlugins.concat(experimentalPlugins)
  }

  let plugins = Array.isArray(config.plugins) ?
    config.plugins : systemPlugins

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

  Prism.config = config

  // Ensure we use the computed plugins
  Prism.config.plugins = plugins

  // Components exported before the registry was configured
  Prism.components.forEach((definition) => {
    registerComponent(registry, definition, Prism.config)
  })

  const checkRequirements = (config, requirement, definition) => {
    const {registry} = definition
    const err = requirement({registry, config})
    if (err !== undefined) {
      if ((err instanceof Error)) {
        throw err
      } else if(isString(err)) {
        throw new Error(
          `Prism component requirements not met: ${err}`)
      }
    }
  }

  // Iterate all defined components
  Prism.defined.forEach((definition) => {
    const {requirements, Name, NewType} = definition
    if (isFunction(requirements)) {
      checkRequirements(config, requirements, definition)
    }
    if (config.debug) {
      console.log(
        `Prism using component ${Name} as ${NewType.displayName}`)
    }
    if (config.experimentalPlugins) {
      withContext(definition)
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

export {StyleRegistry, Prism}
