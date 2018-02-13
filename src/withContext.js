import propTypes from './propTypes'
import util from './util'
const {isObject} = util

const childContextTypes = {
  font: propTypes.fontPropType,
  textTransform: propTypes.textTransform
}

const contextTypes = {
  font: propTypes.fontPropType,
  textTransform: propTypes.textTransform
}

export default (definition) => {
  const {Type, NewType} = definition
  NewType.childContextTypes = childContextTypes
  NewType.contextTypes = contextTypes

  // Inject font contextType
  Type.contextTypes = Type.contextTypes || {}
  Type.childContextTypes = Type.childContextTypes || {}

  Type.contextTypes.font = propTypes.fontPropType
  Type.childContextTypes.font = propTypes.fontPropType
  Type.contextTypes.textTransform = propTypes.textTransform
  Type.childContextTypes.textTransform = propTypes.textTransform

  if (Type.prototype.getChildContext) {
    Type.prototype._getChildContext = Type.prototype.getChildContext
  }

  NewType.prototype.getChildContext = function() {
    const {options} = definition
    const {props} = this
    const context = {}
    // NOTE: we only propagate to children
    // NOTE: until a component that supportsText
    // NOTE: is found
    if (!options.supportsText) {
      if (props.font) {
        context.font = props.font
      }
      if (props.textTransform) {
        context.textTransform = props.textTransform
      }
    }
    return context
  }

  Type.prototype.getChildContext = function () {
    let context = NewType.prototype.getChildContext.call(this)

    // Call original getChildContext which wins over our
    // pre-defined child context so if there is a collision
    // I sure hope you know what you are doing
    if (this._getChildContext) {
      // NOTE: it's important we always have a context so guard
      // NOTE: against an implementation not returning an object
      const originalContext = this._getChildContext()
      context = Object.assign(context, isObject(originalContext) ? originalContext : {})
    }
    return context
  }
}
