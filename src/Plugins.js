import PropTypes from 'prop-types'
import propTypes from './PropTypes'

export default [
  // Support for mapPropsToStyle
  [
    'mapPropsToStyle',
    ({props, definition}) => {
      const {mapPropsToStyle, Type} = definition
      if (mapPropsToStyle) {
        const sheets = []
        for (let k in mapPropsToStyle) {
          const prop = props[k]
          const mapOptions = {...pluginOptions, prop}
          if (props.hasOwnProperty(k) && prop !== undefined) {
            const fn = mapPropsToStyle[k]
            const sheet = fn(mapOptions)
            if (sheet !== undefined) {
              sheets.push(sheet)
            }
          }
        }
        return sheets
      }
    }
  ],

  // Support for className
  [
    ({prop, styleSheet}) => {
      const className = prop
      const find = (list) => {
        return list
          .filter((nm) => styleSheet.hasOwnProperty(nm))
          .map((nm) => styleSheet[nm])
      }

      if (Array.isArray(className)) {
        return find(className)
      }

      return find(className.split(/\s+/))
    },
    {className: propTypes.className}
  ],

  // Color name handling
  [
    ({propName, prop, colors}) => {
      if (prop) {
        const colorValue = {}
        if (colors[prop]) {
          prop = colors[prop]
        }
        colorValue[propName] = prop
        return colorValue
      }
    },
    propTypes.colorNames
  ]
]
