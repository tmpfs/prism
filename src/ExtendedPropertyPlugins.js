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

export default [
  // Background
  [
    ({props, styleSheet}) => {
      const {background} = props
      if (background) {
        return {backgroundColor: background}
      }
    },
    {background: propTypes.background}
  ],

  // Radius
  [
    ({props, styleSheet}) => {
      const {radius} = props
      if (radius !== undefined) {
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
      }
    },
    {radius: propTypes.radius}
  ],

  // Padding
  [
    ({props, styleSheet}) => {
      const {padding} = props
      if (padding) {
        return boxModel('padding', padding)
      }
    },
    {padding: propTypes.padding}
  ],

  // Absolute positioning
  [
    ({props, styleSheet}) => {
      const {position} = props
      if (position) {
        const {top, right, bottom, left} = position
        return {top, right, bottom, left, position: 'absolute'}
      }
    },
    {position: propTypes.position}
  ],

  // Margin
  [
    ({props, styleSheet}) => {
      const {margin} = props
      if (margin) {
        return boxModel('margin', margin)
      }
    },
    {margin: propTypes.margin}
  ],

  // Border
  [
    ({props, styleSheet}) => {
      const {border} = props
      if (border) {
        if (Array.isArray(border)) {
          return {
            borderWidth: border[0],
            borderColor: border[1]}
        } else if (typeof(border) === 'string') {
          return {borderWidth: 1, borderColor: border}
        } else {
          return {
            borderColor: border.color,
            borderTopWidth: border.top,
            borderRightWidth: border.right,
            borderBottomWidth: border.bottom,
            borderLeftWidth: border.left
          }
        }
      }
    },
    {border: propTypes.border}
  ],

  // Flex
  [
    ({props, styleSheet}) => {
      let {flex} = props
      if (flex !== undefined) {
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
      }
    },
    {flex: propTypes.flex}
  ],

  // Flex direction
  [
    ({props, styleSheet}) => {
      const {direction} = props
      if (direction) {
        return {flexDirection: direction}
      }
    },
    {direction: propTypes.direction}
  ],

  // Flex wrap
  [
    ({props, styleSheet}) => {
      const {wrap} = props
      if (wrap !== undefined) {
        return {flexWrap: wrap ? 'wrap' : 'nowrap'}
      }
    },
    {wrap: propTypes.wrap}
  ],

  // Justify
  [
    ({props}) => {
      // Some handy property shortcuts
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
