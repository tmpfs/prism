import util from './util'

const {isString, isFunction} = util

class Plugin  {
  constructor (name, func, options = {}) {
    if (!isString(name)) {
      throw new Error('Prism plugin expects a string name')
    }
    if (!isFunction(func)) {
      throw new Error('Prism plugin expects a function handler')
    }
    this.name = name
    this.func = func
    this.propType = options.propType
    this.isGlobal = options.propType === undefined
    // Global plugin that only runs when a component
    // declares a corresponding configuration in the
    // object returned by styleOptions()
    this.requireOptions = options.requireOptions

    this.options = options
  }

  // Global plugins that run after property plugins
  get isAfter () {
    return this.options.after
  }

  get isFlat () {
    return this.options.flatStyles
  }
}

export default Plugin
