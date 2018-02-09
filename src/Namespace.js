class Namespace {
  constructor ({namespace, typeName}) {
    this.namespace = namespace || ''
    this.typeName = typeName
  }

  getClassName () {
    return this.className || this.typeName
  }

  get componentClassName () {
    const className = this.getClassName()
    const {namespace} = this
    return namespace ? `${namespace}.${className}` : className
  }
}

export default Namespace
