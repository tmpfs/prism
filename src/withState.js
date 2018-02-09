export default (definition) => {
  const {Type} = definition
  const setState = Type.prototype.setState
  Type.prototype.setState = function (newState) {
    const {state} = this
    setState.call(this, newState)
    // Invalidate styles when setState() is called
    // on the underlying component
    const {invalidateStyles} = this.props
    if (this.shouldUpdateStyles(state, newState)) {
      invalidateStyles(newState)
    }
  }

  if (!Type.prototype.shouldUpdateStyles) {
    Type.prototype.shouldUpdateStyles =
      function (state, newState) {
        return true
    }
  }

  Type.prototype.setStateStyle = function () {
    const {state} = this
    const {invalidateStyles} = this.props
    if (this.shouldUpdateStyles(state, null)) {
      invalidateStyles(state)
    }
  }
}
