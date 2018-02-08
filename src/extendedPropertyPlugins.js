import Plugin from './Plugin'
import propTypes from './propTypes'

// Shared by margin and padding
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
  new Plugin(
    'background',
    ({prop}) => {
      return {backgroundColor: prop}
    },
    {propType: propTypes.background}
  ),
  new Plugin(
    'width',
    ({prop, options}) => {
      if (options.supportsDimension) {
        return {width: prop}
      }
    },
    {propType: propTypes.width}
  ),
  new Plugin(
    'height',
    ({prop, options}) => {
      if (options.supportsDimension) {
        return {height: prop}
      }
    },
    {propType: propTypes.height}
  ),
  new Plugin(
    'radius',
    ({props}) => {
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
    {propType: propTypes.radius}
  ),
  new Plugin(
    'padding',
    ({props}) => {
      const {padding} = props
      return boxModel('padding', padding)
    },
    {propType: propTypes.padding}
  ),
  new Plugin(
    'margin',
    ({props}) => {
      const {margin} = props
      return boxModel('margin', margin)
    },
    {propType: propTypes.margin}
  ),
  new Plugin(
    'position',
    ({props}) => {
      const {position} = props
      const {top, right, bottom, left} = position
      return {top, right, bottom, left, position: 'absolute'}
    },
    {propType: propTypes.position}
  ),
  new Plugin(
    'border',
    ({prop, colors}) => {
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
    {propType: propTypes.border}
  ),

  // Flex
  new Plugin(
    'flex',
    ({props}) => {
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
    {propType: propTypes.flex}
  ),
  new Plugin(
    'row',
    ({props}) => {
      const {row} = props
      if (row === true) {
        return {flexDirection: 'row'}
      }
    },
    {propType: propTypes.row}
  ),
  new Plugin(
    'wrap',
    ({props}) => {
      const {wrap} = props
      return {flexWrap: wrap ? 'wrap' : 'nowrap'}
    },
    {propType: propTypes.wrap}
  ),
  new Plugin(
    'justify',
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
    {propType: propTypes.justify}
  )
]
