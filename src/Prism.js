import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import StyleRegistry from './StyleRegistry'
import Plugins from './Plugins'
import ExtendedPropertyPlugins from './ExtendedPropertyPlugins'
import ExperimentalPlugins from './ExperimentalPlugins'
import propTypes from './PropTypes'
import withPrism from './withPrism'

const STYLE = 'style'

const isObject = (o) => o && o.toString() === '[object Object]'
const isString = (o) => o && typeof(o) === 'string'
const isNumber = (o) => typeof(o) === 'number'
const isFunction = (fn) => (fn instanceof Function)
const isArray = Array.isArray
const ucfirst = (s) => {
  if (s && s.length) {
    return s.charAt(0).toUpperCase() + s.substr(1)
  }
  return s
}
// FIXME: naive implementation
const ucword = (s) => {
  if (s) {
    return s.split(' ').map((word) => {
      return ucfirst(word)
    }).join(' ')
  }
  return s
}
const util = {isObject, isFunction, isString, isArray, isNumber, ucfirst, ucword}

const compile = (decl) => {
  const sheet = {decl}
  const compiled = StyleSheet.create(sheet)
  return compiled.decl
}

const getStylePropertyName = (name) => {
  if (name !== STYLE && !/Style$/.test(name)) {
    name += 'Style'
  }
  return name
}

const Configuration = {
  plugins: null,
  defaultFontSize: 16,
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
        //console.log('invariant plugin running: ' + value)
        //console.log('invariant plugin running: ' + values)
        let propName = 'text'
        if (ns.childClassName) {
          propName = ns.childClassName.charAt(0).toLowerCase() +
            ns.childClassName.substr(1) +
            'Text'
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

const mapPluginTypeTests = {
  mapPropsToStyleObject: fnOrObj,
  mapPropsToStyleState: func,
  mapPropsToStyle: fnOrObj
}

const mapPluginNames = Object.keys(mapPluginTypeTests)

class Plugin  {
  constructor (name, func, propType = null, isGlobal = false) {
    this.name = name
    this.func = func
    this.propType = propType
    this.isGlobal = isGlobal
    if (propType) {
      this.propNames = Object.keys(propType)
    }
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
    const isGlobal = plugin.length >=2 &&
      typeof(plugin[0]) === 'string' && isFunction(plugin[1])
    const isProperty = plugin.length === 2 &&
      isFunction(plugin[0]) && isObject(plugin[1])

    if (isGlobal) {
      return new Plugin(plugin[0], plugin[1], plugin[2], true)
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
  console.log(plugin)
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
  const NewType = withPrism(
    Type, definition, {getStylePropertyName, ...util})
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

    options = styleOptions({...registry, compile})
    const {defaultStyles} = options
    if (defaultStyles && !Array.isArray(defaultStyles)) {
      throw new Error(
        'Prism default styles should be an array of objects')
    }
  }

  if (isObject(options.colors)) {
    registry.mergeColors(options.colors)
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

  const availablePropertyNames = config.plugins
    .filter((plugin) => plugin.propType)
    .map((plugin) => plugin.name)

  let {mapPropsToStyleObject} = options
  // User defined style property names
  if (mapPropsToStyleObject !== undefined) {
    if (util.isFunction(mapPropsToStyleObject)) {
      mapPropsToStyleObject = mapPropsToStyleObject(registry)
    }

    const assignedPropertyNames = Object.keys(mapPropsToStyleObject)
      .reduce((list, propName) => {
        list = list.concat(mapPropsToStyleObject[propName])
        return list
      }, [])

    if (mapPropsToStyleObject.style !== undefined) {
      throw new Error(
        `Prism do not configure mappings for "style" in mapPropsToStyleObject. ` +
        `It is an anti-pattern, use mapPropsToStyleProp or mapPropsToStyle instead.`)
    }

    // Configure handling for style property
    // when not explicitly specified
    mapPropsToStyleObject.style = availablePropertyNames
      .filter((propName) => !~assignedPropertyNames.indexOf(propName))
  }

  // Default style property support, all
  // names are mapped to the default style object
  if (!mapPropsToStyleObject) {
    mapPropsToStyleObject = {
      style: availablePropertyNames
    }
  }

  options.mapPropsToStyleObject = mapPropsToStyleObject
  options.stylePropertyNames = Object.keys(mapPropsToStyleObject)

  const globalPlugins = plugins
    .filter((plugin) => {
      return plugin.isGlobal
        && (options.hasOwnProperty(plugin.name) || plugin.name === 'mapStyleToProps')
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
  Type.initialStyles = {}
  options.stylePropertyNames.forEach((name) => {
    name = getStylePropertyName(name)
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
    Type.initialStyles[name] = list
  })

  //console.log(Object.keys(Type.propTypes))

  // TODO: support multiple registries
  // TODO: merge if we have an existing registry?
  definition.config = config
  definition.registry = registry
}

Prism.components = []
Prism.requirements = []

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
    throw new Error('Prism: array expected for plugins list')
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

  registry.compile({config})

  Prism.registry = registry
}

Prism.propTypes = propTypes

export {StyleRegistry, Prism}
