class Namespace {
  constructor ({namespace, typeName, className, childClassName}) {
    this.namespace = namespace || ''
    // Raw type class name when a component namespace
    this.typeName = typeName

    // Optional alternative className to use instead of typeName
    this.className = className

    // Optional name of a child component to append to the computed name
    this.childClassName = childClassName
  }

  getClassName () {
    return this.className || this.typeName
  }

  get componentClassName () {
    const className = this.getClassName()
    const {namespace, childClassName} = this
    let styleDeclName = namespace ? `${namespace}.${className}` : className
    // Passing style to nested child component
    if (childClassName) {
      styleDeclName += '.' + childClassName
    }
    return styleDeclName
  }
}

    //typeName: Name,
    //className,
    //componentClassName,
    //childClassName,
    //namespace

export default Namespace
