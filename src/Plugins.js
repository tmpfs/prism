import propTypes from './PropTypes'

export default [
  // Support for mapPropsToStyle
  [
    'mapPropsToStyle',
    (pluginOptions) => {
      const {props, definition} = pluginOptions
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

  // Color name handling
  [
    'colorNames',
    ({props, options, colors, config}) => {
      if (options.colorNames === true) {
        const {colorProperties} = config
        const sheets = []
        colorProperties.forEach((prop) => {
          let color = {}
          let value = props[prop]
          // Custom color names
          if (value) {
            if (colors[value]) {
              color[prop] = colors[value]
            } else {
              // Normal color references
              color[prop] = value
            }
          }
          sheets.push(color)
        })
        return sheets
      }
    }
  ],

  // Support for className
  [
    'className',
    ({props, styleSheet}) => {
      const {className} = props
      if (className) {

        const find = (list) => {
          return list
            .filter((nm) => styleSheet.hasOwnProperty(nm))
            .map((nm) => styleSheet[nm])
        }

        if (Array.isArray(className)) {
          return find(className)
        }

        return find(className.split(/\s+/))
      }
    },
    propTypes.className
  ]
]
