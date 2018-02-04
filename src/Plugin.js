class Plugin  {
  constructor (name, func, propType, isGlobal, isAfter) {
    this.name = name
    this.func = func
    this.propType = propType
    this.isGlobal = isGlobal
    this.isAfter = isAfter
    if (propType) {
      this.propNames = Object.keys(propType)
    }
  }
}

export default Plugin
