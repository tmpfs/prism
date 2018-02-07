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
    this.Type = Type
    this.Name = Name

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

    this.ns = new Namespace({namespace, typeName: Name})

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
