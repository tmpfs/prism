import util from './util'
const {ucfirst} = util

class Namespace {
  constructor ({namespace, typeName}) {
    this.namespace = namespace || ''
    this.typeName = typeName
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
    const {namespace} = this
    return namespace ? `${namespace}.${className}` : className
  }
}

export default Namespace
