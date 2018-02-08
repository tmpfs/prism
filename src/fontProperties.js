import PropTypes from 'prop-types'
import Plugin from './Plugin'
import propTypes from './propTypes'

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
    ({context, prop, colors, sizes, config, options}) => {
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

        // Handle string type - named font size
        if (style.fontSize && typeof(style.fontSize) === 'string') {
          // TODO: throw error on missing size or fall through to style validation?
          const sizes = options.sizes || sizes || config.sizes || {}
          const fontSize = sizes[style.fontSize] || 16
          style.fontSize = fontSize
        }
        return style
      }
    },
    {propType: propTypes.font}
  )
]
