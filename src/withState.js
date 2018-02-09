export default (definition) => {
  const {Type} = definition
  const setState = Type.prototype.setState
  Type.prototype.setState = function (newState) {
    setState.call(this, newState)
    // Invalidate styles when setState() is called
    // on the underlying component
    const {setStyleState} = this.props
    setStyleState(newState)
  }
}
