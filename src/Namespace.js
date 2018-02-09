class Namespace {
  constructor ({namespace, typeName}) {
    this.namespace = namespace || ''
    this.typeName = typeName
  }

  getClassName (name) {
    const {namespace, typeName} = this
    name = name || typeName
    return namespace ? `${namespace}.${name}` : name
  }
}

export default Namespace
