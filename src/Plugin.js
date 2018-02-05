class Plugin  {
  constructor (name, func, propType, isGlobal) {
    this.name = name
    this.func = func
    this.propType = propType
    this.isGlobal = isGlobal
    if (propType) {
      this.propNames = Object.keys(propType)
    }
  }
}

export default Plugin
