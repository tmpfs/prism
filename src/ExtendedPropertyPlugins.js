import propTypes from './PropTypes'

const boxModel = (key, value) => {
  const out = {}
  if (typeof(value) === 'number') {
    out[key] = value
  } else if (Array.isArray(value)) {
    out[key + 'Vertical'] = value[0]
    out[key + 'Horizontal'] = value[1]
  } else {
    out[key + 'Top'] = value.top
    out[key + 'Right'] = value.right
    out[key + 'Bottom'] = value.bottom
    out[key + 'Left'] = value.left
  }
  return out
}

const fontShapeColors = propTypes.fontShapeColors
const fontShapeMap = propTypes.fontShapeMap

export default [
  // Background
  [
    ({prop, styleSheet, colors}) => {
      return {backgroundColor: colors[prop] || prop}
    },
    {background: propTypes.background}
  ],

  // Color
  [
    ({prop, styleSheet, colors, options}) => {
      if (options.supportsText) {
        return {color: colors[prop] || prop}
      }
    },
    {color: propTypes.color}
  ],

  // Font
  [
    ({prop, styleSheet, colors, sizes, config, options}) => {
      if (options.supportsText) {
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
          const sizes = options.sizes || sizes || config.sizes || {}
          const fontSize = sizes[style.fontSize] || config.defaultFontSize
          style.fontSize = fontSize
        }

        return style
      }
    },
    {font: propTypes.font}
  ],

  // Radius
  [
    ({props, styleSheet}) => {
      const {radius} = props
      if (typeof(radius) === 'number') {
        return {borderRadius: radius}
      }
      let {top, bottom} = radius
      top = top || {}
      bottom = bottom || {}
      return {
        borderTopLeftRadius: top.left || 0,
        borderTopRightRadius: top.right || 0,
        borderBottomLeftRadius: bottom.left || 0,
        borderBottomRightRadius: bottom.right || 0
      }
    },
    {radius: propTypes.radius}
  ],

  // Padding
  [
    ({props, styleSheet}) => {
      const {padding} = props
      return boxModel('padding', padding)
    },
    {padding: propTypes.padding}
  ],

  // Absolute positioning
  [
    ({props, styleSheet}) => {
      const {position} = props
      const {top, right, bottom, left} = position
      return {top, right, bottom, left, position: 'absolute'}
    },
    {position: propTypes.position}
  ],

  // Margin
  [
    ({props, styleSheet}) => {
      const {margin} = props
      return boxModel('margin', margin)
    },
    {margin: propTypes.margin}
  ],

  // Border
  [
    ({prop, styleSheet, colors}) => {
      const border = prop
      if (Array.isArray(border)) {
        return {
          borderWidth: border[0],
          borderColor: colors[border[1]] || border[1]}
      } else if (typeof(border) === 'string') {
        return {borderWidth: 1, borderColor: colors[border] || border}
      } else {
        return {
          borderColor: colors[border.color] || border.color,
          borderTopWidth: border.top,
          borderRightWidth: border.right,
          borderBottomWidth: border.bottom,
          borderLeftWidth: border.left
        }
      }
    },
    {border: propTypes.border}
  ],

  // Flex
  [
    ({props, styleSheet}) => {
      let {flex} = props
      if (typeof(flex) === 'boolean') {
        flex = Number(flex)
      }
      if (typeof(flex) === 'number') {
        return {flex}
      }

      const out = {
        flexDirection: flex.row ? 'row' : 'column',
        flexWrap: flex.wrap ? 'wrap' : 'nowrap'
      }
      if (flex.grow !== undefined) {
        out.flex = flex.grow
      }
      return out
    },
    {flex: propTypes.flex}
  ],

  // Flex direction
  [
    ({props, styleSheet}) => {
      const {direction} = props
      return {flexDirection: direction}
    },
    {direction: propTypes.direction}
  ],

  // Flex wrap
  [
    ({props, styleSheet}) => {
      const {wrap} = props
      return {flexWrap: wrap ? 'wrap' : 'nowrap'}
    },
    {wrap: propTypes.wrap}
  ],

  // Justify
  [
    ({props}) => {
      const {justify} = props
      switch (justify) {
        case 'center':
          return {justifyContent: 'center'}
        case 'start':
          return {justifyContent: 'flex-start'}
        case 'end':
          return {justifyContent: 'flex-end'}
        case 'between':
          return {justifyContent: 'space-between'}
        case 'around':
          return {justifyContent: 'space-around'}
      }
    },
    {justify: propTypes.justify}
  ]
]
