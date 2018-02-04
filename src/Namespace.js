import util from './util'

const {ucfirst} = util

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

  getStateClassName (state) {
    return this.componentClassName + ':' + state
  }

  getChildStateClassName (child, state) {
    return this.getChildClassName(child) + ':' + state
  }

  getClassName () {
    return this.className || this.typeName
  }

  getChildClassName (childClassName) {
    childClassName = childClassName.replace(/Style$/, '')
    childClassName = ucfirst(childClassName)
    return this.componentClassName + '.' + childClassName
  }

  get componentClassName () {
    const className = this.getClassName()
    const {namespace, childClassName} = this
    let styleDeclName = namespace ? `${namespace}.${className}` : className
    return styleDeclName
  }
}

export default Namespace
