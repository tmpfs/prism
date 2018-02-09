export default (definition) => {

  const {Type, NewType} = definition
  const {options} = definition
  const setState = Type.prototype.setState
  Type.prototype.setState = function (newState) {
    const {state} = this
    setState.call(this, newState)
    // Invalidate styles when setState() is called
    // on the underlying component
    const {invalidateStyles} = this.props
    if (this.shouldStyleUpdate(state, newState)) {
      invalidateStyles(newState)
    }
  }

  if (Type.prototype.styleWillMount) {
    NewType.prototype.styleWillMount = true
  }

  if (!Type.prototype.shouldStyleUpdate) {
    Type.prototype.shouldStyleUpdate =
      function (state, newState) {
        return true
    }
  }

  if (options.mountStateStyle) {
    Type.prototype._componentWillMount = Type.prototype.componentWillMount
    Type.prototype.componentWillMount = function () {
      const {state} = this
      const {invalidateStyles} = this.props
      if (this.shouldStyleUpdate(state, null)) {
        invalidateStyles(state)
      }
      if (this._componentWillMount) {
        this._componentWillMount()
      }
    }
  }
}
