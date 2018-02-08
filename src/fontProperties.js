import PropTypes from 'prop-types'
import Plugin from './Plugin'
import propTypes from './propTypes'

const getFontSize = (fontSize, {options, registry, config}) => {
  if (fontSize && typeof(fontSize) === 'string') {
    // TODO: throw error on missing size or fall through to style validation?
    const sizes = options.sizes || registry.sizes || config.sizes || {}
    fontSize = sizes[fontSize] || 16
  }
  return fontSize
}

export default [
  new Plugin(
    'color',
    ({prop, options}) => {
      if (options.supportsText) {
        return {color: prop}
      }
    },
    {propType: propTypes.color}
  ),
  new Plugin(
    'size',
    ({prop, options, registry, config}) => {
      if (options.supportsText) {
        return {fontSize: getFontSize(prop, {options, registry, config})}
      }
    },
    {propType: propTypes.fontSize}
  ),
  new Plugin(
    'align',
    ({options, prop}) => {
      if (options.supportsText) {
        return {textAlign: prop}
      }
    },
    {propType: PropTypes.oneOf(['left', 'center', 'right'])}
  ),
  // Bold, does not currently support multiple weight, boolean only
  new Plugin(
    'bold',
    ({options, registry, propName}) => {
      if (options.supportsText) {
        if (registry.has(propName)) {
          return registry.resolve(propName)
        }
        return {fontWeight: 'bold'}
      }
    },
    {propType: PropTypes.bool}
  ),

  // Font object support
  new Plugin(
    'font',
    ({context, prop, colors, sizes, options, registry, config}) => {
      if (options.supportsText) {
        const fontShapeColors = propTypes.fontShapeColors
        const fontShapeMap = propTypes.fontShapeMap
        // Inherited from the parent context
        if (!prop && context) {
          prop = context.font
        } else {
          prop = Object.assign({}, context.font, prop)
        }
        const style = {}
        for (let k in prop) {
          if (prop[k] !== undefined) {
            let val = prop[k]
            if (~fontShapeColors.indexOf(k)) {
              val = colors[val] || val
            }
            style[fontShapeMap[k]] = val
          }
        }

        if (style.fontSize) {
          style.fontSize = getFontSize(style.fontSize, {options, registry, config})
        }
        return style
      }
    },
    {propType: propTypes.font}
  )
]
