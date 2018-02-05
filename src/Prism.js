import React, {Component} from 'react'

import StyleRegistry from './StyleRegistry'
import Namespace from './Namespace'
import Plugin from './Plugin'
import Plugins from './DefaultPlugins'
import ExtendedPropertyPlugins from './ExtendedPropertyPlugins'
import ExperimentalPlugins from './ExperimentalPlugins'
import PropProcessor from './PropProcessor'

import propTypes from './propTypes'
import withPrism from './withPrism'
import withContext from './withContext'
import util from './util'

const STYLE = 'style'

const {
  isObject,
  isFunction,
  isString,
  isArray,
  isNumber,
  lcfirst} = util

const Configuration = {
  plugins: null,
  defaultFontSize: 16,
  processors: [
    new PropProcessor(({propName, propValue, colors}) => {
      return colors[propValue]
    }, 'color')
  ],
  sizes: {
    'xx-small': 12,
    'x-small': 13,
    'small': 14,
    'medium': 16,
    'large': 18,
    'x-large': 22,
    'xx-large': 26
  },
  invariants: [
    {
      stylePropName: 'textTransform',
      plugin: ({value, values, options, ns}) => {
        let propName = 'text'
        // Rewrite to child component prefix, eg: headerText
        if (ns.childClassName) {
          // TODO: lcfirst
          //propName = ns.childClassName.charAt(0).toLowerCase() +
            //ns.childClassName.substr(1) +
            //'Text'
          propName = lcfirst(ns.childClassName) + 'Text'
        }
        values[propName] = values[propName] || {}
        values[propName].transform = value
      }
    }
  ]
}

const func = {
  fn: (o) => isFunction(o),
  type: 'function'
}

const fnOrObj = {
  fn: (o) => isFunction(o) || isObject(o),
  type: 'function or object'
}

const obj = {
  fn: (o) => isObject(o),
  type: 'object'
}

const mapPluginTypeTests = {
  mapPropsToStyle: fnOrObj,
  mapPropsToStyleState: func,
  mapStyleToComponent: fnOrObj,
  mapStyleToProp: obj
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

  if (requirements) {
    Prism.requirements.push(requirements)
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

  let {mapStyleToComponent} = options
  // User defined style property names
  if (mapStyleToComponent !== undefined) {
    if (util.isFunction(mapStyleToComponent)) {
      mapStyleToComponent = mapStyleToComponent(registry)
    }

    if (mapStyleToComponent.style !== undefined) {
      if (!Array.isArray(mapStyleToComponent.style)) {
        throw new Error(
          `Prism mappings for "style" in mapStyleToComponent must be an array`)
      }

      // We expect the keys for mapStyleToComponent to only refer
      // to child styles so we extract `style` when given
      options.styleForceInclusion = mapStyleToComponent.style
      delete mapStyleToComponent.style

      //throw new Error(
        //`Prism do not configure mappings for "style" in mapStyleToComponent. ` +
        //`It is an anti-pattern, use mapPropsToStyle instead.`)
    }

  }

  if (!options.styleForceInclusion) {
    options.styleForceInclusion = []
  }

  if (!mapStyleToComponent) {
    mapStyleToComponent = {}
  }

  // Default style property support
  //mapStyleToComponent.style = true
  options.mapStyleToComponent = mapStyleToComponent
  options.childComponentNames = Object.keys(mapStyleToComponent)

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

  // Automatic propTypes for style, labelStyle, imageStyle etc.
  definition.initialStyles = {}
  const childComponentNames = [STYLE].concat(options.childComponentNames)
  childComponentNames.forEach((name) => {
    Type.propTypes[name] = propTypes.style

    // Configure initial styles per attribute
    // from defaultProps and cleanup so they
    // don't mess with our inheritance
    const list = []
    if (Type.defaultProps &&
      Type.defaultProps[name]) {
      list.push(Type.defaultProps[name])
      delete Type.defaultProps[name]
    }
    definition.initialStyles[name] = list
  })

  //console.log(Object.keys(Type.propTypes))

  // TODO: support multiple registries
  // TODO: merge if we have an existing registry?
  definition.config = config
  definition.registry = registry

  Prism.defined.push(definition)
}

// This keeps track of components initialized before configure()
Prism.components = []
// Components with requirements that need to be enforced
Prism.requirements = []
// All registered components definitions
Prism.defined = []

Prism.configure = (registry, config = {}) => {
  if (!(registry instanceof StyleRegistry)) {
    throw new Error('Prism expects a StyleRegistry for configure()')
  }

  let systemPlugins = Plugins

  if (config.experimentalPlugins) {
    systemPlugins = systemPlugins.concat(ExperimentalPlugins)
  }

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

  config = Object.assign({}, Configuration, config)
  Prism.config = config

  if (config.debug) {
    console.log(`Prism configured with ${plugins.length} plugins`)
    plugins.forEach((plugin) => {
      console.log(`Prism using plugin "${plugin.name}" (global: ${plugin.isGlobal})`)
    })
  }

  // Ensure we use the computed plugins
  Prism.config.plugins = plugins

  if (!Array.isArray(Prism.config.plugins)) {
    throw new Error('Prism array expected for plugins list')
  }

  // Components exported before the registry was configured
  Prism.components.forEach((definition) => {
    registerComponent(registry, definition, Prism.config)
  })

  Prism.requirements.forEach((requirement) => {
    const err = requirement({registry, config})
    if (err !== undefined) {
      if ((err instanceof Error)) {
        throw err
      } else if(isString(err)) {
        throw new Error(
          `Prism component requirements not met: ${err}`)
      }
    }
  })

  if (config.experimentalPlugins) {
    Prism.defined.forEach((definition) => {
      withContext(definition)
    })
  }

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

  PropProcessor.collate(config)

  registry.compile({config})

  Prism.registry = registry
}

Prism.propTypes = propTypes

export {StyleRegistry, Prism}
