import Namespace from './Namespace'

import util from './util'
const {
  isFunction,
  isObject,
  isString
} = util

class ComponentDefinition {
  constructor (Type, initOptions = {}) {
    const Name = Type.displayName || Type.name

    let styleName = Type.styleName
    if (styleName === undefined && typeof(initOptions) === 'string') {
      styleName = initOptions
      initOptions = {}
    }

    if (styleName === undefined && initOptions.styleName) {
      styleName = initOptions.styleName
    }

    if (!styleName || typeof(styleName) !== 'string') {
      throw new Error(
        `Prism requires that styleName is defined so that production builds ` +
        `behave as expected for style name lookup, error in ${Name}`)
    }

    this.Type = Type
    this.Name = styleName

    const styleOptions = Type.styleOptions
    if (styleOptions && (!isFunction(styleOptions) && !isObject(styleOptions))) {
      throw new Error(
        `Prism styleOptions for ${Name} must be a function or object`)
    }
    this.styleOptions = styleOptions

    const {namespace, requirements} = initOptions
    if (namespace && !isString(namespace)) {
      throw new Error(
        `Prism namespace for ${Name} is not a string, got type ${typeof(namespace)}`)
    }

    this.ns = new Namespace({namespace, typeName: styleName})

    if (requirements && !isFunction(requirements)) {
      throw new Error(
        `Prism requirements for ${Name} must be a function`)
    }
    this.requirements = requirements

    this.initOptions = initOptions

    // This is the HOC wrapper, injected later
    this.NewType = null

    // Computed options for the component
    // injected after styleOptions() has been called
    this.options = null

    // Reference to the global style registry
    this.registry = null

    // Reference to the computed configuration
    this.config = null
  }

  checkRequirements () {
    const {config, registry, requirements} = this
    if (requirements) {
      const err = requirements({registry, config})
      if (err !== undefined) {
        if ((err instanceof Error)) {
          throw err
        } else if(isString(err)) {
          throw new Error(`Prism component requirements not met: ${err}`)
        }
      }
    }
  }

}

export default ComponentDefinition
