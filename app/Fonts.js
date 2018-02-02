export default {
  regular: (os) => {
    return os === 'ios' ? 'WorkSans-Regular' : 'worksans'
  },
  medium: (os) => {
    return os === 'ios' ? 'WorkSans-Medium' : 'worksans_medium'
  }
}
