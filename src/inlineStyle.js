import propTypes from './propTypes'
import Plugin from './Plugin'

export default new Plugin(
  'style',
  ({props, attrName}) => {
    // Add inline `style`, `labelStyle` etc.
    const style = props[attrName]
    if (style) {
      return style
    }
  },
  {after: true}
)
