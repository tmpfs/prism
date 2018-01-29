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
    'background',
    ({props, styleSheet}) => {
      const {background} = props
      if (background) {
        return {backgroundColor: background}
      }
    },
    propTypes.background
  ],

  // Radius
  [
    'radius',
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
    propTypes.radius
  ],

  // Padding
  [
    'padding',
    ({props, styleSheet}) => {
      const {padding} = props
      if (padding) {
        return boxModel('padding', padding)
      }
    },
    propTypes.padding
  ],

  // Absolute positioning
  [
    'position',
    ({props, styleSheet}) => {
      const {position} = props
      if (position) {
        const {top, right, bottom, left} = position
        return {top, right, bottom, left, position: 'absolute'}
      }
    },
    propTypes.position
  ],

  // Margin
  [
    'margin',
    ({props, styleSheet}) => {
      const {margin} = props
      if (margin) {
        return boxModel('margin', margin)
      }
    },
    propTypes.margin
  ],

  // Border
  [
    'border',
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
          console.log(border)
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
    propTypes.border
  ],

  // Flex
  [
    'flex',
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
    propTypes.flex
  ],

  // Flex direction
  [
    'direction',
    ({props, styleSheet}) => {
      const {direction} = props
      if (direction) {
        return {flexDirection: direction}
      }
    },
    propTypes.direction
  ],

  // Flex wrap
  [
    'wrap',
    ({props, styleSheet}) => {
      const {wrap} = props
      if (wrap !== undefined) {
        return {flexWrap: wrap ? 'wrap' : 'nowrap'}
      }
    },
    propTypes.wrap
  ],

  // Padding
  [
    'padding',
    ({props, styleSheet}) => {
      if (props.padding > -1) {
        return {padding: props.padding}
      }
    },
    propTypes.padding
  ],

  // Justify
  [
    'justify',
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
    propTypes.justify
  ]
]
