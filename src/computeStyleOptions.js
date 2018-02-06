import propTypes from './propTypes'
import util from './util'
const {isFunction, isObject} = util

const STYLE = 'style'

const mergeStyleRegistry = (registry, options) => {
  if (options.registry && !(options.registry instanceof StyleRegistry)) {
    throw new Error('Prism expects the registry option to be a StyleRegistry')
  }
  // Merge component-specific style registries
  if (options.registry) {
    registry.assign(options.registry)
  }
}

const computeStyleNames = (registry, definition, options) => {
  const {Type, Name} = definition
  let {mapStyleToProps} = options
  let childComponentNames = []
  // User defined style property names
  if (mapStyleToProps !== undefined) {
    // Extract child component styles when a key is an object
    let k, v
    for (k in mapStyleToProps) {
      v = mapStyleToProps[k]
      if (isObject(v)) {
        childComponentNames.push(k)
      }
    }
  }

  options.allStyleObjectNames = [STYLE].concat(childComponentNames)
  options.childComponentNames = childComponentNames
}

const mergePropTypes = (definition, plugins, allStyleObjectNames) => {
  const {Type} = definition
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
}

const mergeStatic = (definition, plugins, options) => {
  const {Type} = definition
  // Plugins have not been split yet
  plugins.forEach((plugin) => {
    if (plugin.isGlobal) {
      const {name} = plugin
      if (options[name] !== undefined && Type[name] !== undefined) {
        throw new Error(
          `Prism you declared ${name} as static on ${Name} and also in styleOptions. ` +
          `This is not allowed, choose one of the other declaration style.`)
      }

      // Get from static props
      if (Type[name] !== undefined) {
        options[name] = Type[name]
        // Moving into the options, so clean up
        delete Type[name]
      }

      // Call as function, supports a static declaration
      // that can reference the styleSheet etc
      if (isFunction(options[name])) {
        options[name] = options[name](registry)
      }

      // Got a declaration allow plugins to validate it
      // after getting a return type when declared as a function
      const validator = plugin.options.validator
      if (options[name] !== undefined && isFunction(validator)) {
        validator(options[name])
      }
    }
  })
}

const splitPlugins = (definition, plugins, options) => {
  const globalPlugins = plugins
    .filter((plugin) => {
      if (plugin.isGlobal) {
        // Global plugins that always execute
        if (!plugin.requireOptions) {
          return plugin
        }

        //console.log('plugin name: ' + plugin.name)
        //console.log('plugin name: ' + options.hasOwnProperty(plugin.name))
        //console.log(Object.keys(options))

        // Plugin requires a corresponding option
        // in the target component options
        if (plugin.requireOptions && options.hasOwnProperty(plugin.name)) {
          return plugin
        }
      }
    })

  console.log(`Adding global plugins (${definition.Name}) with length ${globalPlugins.length}`)

  // TODO: allow options to disable plugins for the component?
  const propertyPlugins = plugins.filter((plugin) => plugin.propType !== undefined)
  return {
    property: propertyPlugins,
    globals: globalPlugins
  }
}

const computeStyleOptions = (registry, definition, config) => {
  const {Type, Name, styleOptions} = definition
  const {plugins} = config
  let options = {}

  if (styleOptions) {
    // Get options for the component
    options = styleOptions(registry)
  }

  mergeStyleRegistry(registry, options)
  mergeStatic(definition, plugins, options)

  // Split plugins and filter global plugins
  // to those where the options have the corresponding
  // configuration option
  options.plugins = splitPlugins(definition, plugins, options)

  computeStyleNames(registry, definition, options)

  // computeStyleNames must be called first
  // so we have allStyleObjectNames
  mergePropTypes(definition, plugins, options.allStyleObjectNames)

  return options
}

export default computeStyleOptions
