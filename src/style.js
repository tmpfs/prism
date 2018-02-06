import propTypes from './propTypes'
import Plugin from './Plugin'

export default new Plugin(
  'style',
  ({props, attrName}) => {
    // Add inline `style`, `labelStyle` etc.
    const style = props[attrName]
    if (style) {
      console.log('Got inline prop style from plugin')
      //sheets = sheets.concat(style)
    }
  },
  {propType: propTypes.style}
)
