import util from './util'

const {isString, isFunction} = util

class Plugin  {
  constructor (name, func, propType, isGlobal) {
    if (!isString(name)) {
      throw new Error('Prism plugin expects a string name')
    }
    if (!isFunction(func)) {
      throw new Error('Prism plugin expects a function handler')
    }
    this.name = name
    this.func = func
    this.propType = propType
    this.isGlobal = isGlobal
    //if (propType) {
      //this.propNames = Object.keys(propType)
    //}
  }
}

export default Plugin
