export default [
  // Support for mapPropsToStyle
  (pluginOptions) => {
    const {props, definition} = pluginOptions
    const {mapPropsToStyle, Type} = definition
    if (mapPropsToStyle) {
      const sheets = []
      for (let k in mapPropsToStyle) {
        const prop = props[k]
        const hasOwn = props.hasOwnProperty(k)
        const mapOptions = {...pluginOptions, prop}
        if (hasOwn && prop !== undefined) {
          const fn = mapPropsToStyle[k]
          const sheet = fn(mapOptions)
          if (sheet !== undefined) {
            sheets.push(sheet)
          }
        }
      }
      return sheets
    }
  },

  // Support for className
  ({props, styleSheet}) => {
    const {className} = props
    if (className) {

      const find = (list) => {
        return list.filter((nm) => styleSheet.hasOwnProperty(nm))
          .map((nm) => styleSheet[nm])
      }

      if (Array.isArray(className)) {
        return find(className)
      }

      return find(className.split(/\s+/))
    }
  },

  // Background
  ({props, styleSheet}) => {
    const {background} = props
    if (background) {
      return {backgroundColor: background}
    }
  },

  // Radius
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

  // Padding
  ({props, styleSheet}) => {
    const {padding} = props
    if (padding) {
      return boxModel('padding', padding)
    }
  },

  // Absolute positioning
  ({props, styleSheet}) => {
    const {position} = props
    if (position) {
      const {top, right, bottom, left} = position
      return {top, right, bottom, left, position: 'absolute'}
    }
  },

  // Margin
  ({props, styleSheet}) => {
    const {margin} = props
    if (margin) {
      return boxModel('margin', margin)
    }
  },

  // Border
  ({props, styleSheet}) => {
    const {border} = props
    if (border) {
      if (Array.isArray(border)) {
        return {borderWidth: border[0], borderColor: border[1]}
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

  // Flex
  ({props, styleSheet}) => {
    let {flex} = props
    if (flex !== undefined) {
      if (typeof(flex) === 'boolean') {
        flex = Number(flex)
      }
      if (typeof(flex) === 'number') {
        return {flex}
      }
      // TODO: handle object values: {row: true, wrap: true, grow: .5}
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

  // Flex direction
  ({props, styleSheet}) => {
    const {direction} = props
    if (direction) {
      return {flexDirection: direction}
    }
  },

  // Flex wrap
  ({props, styleSheet}) => {
    const {wrap} = props
    if (wrap !== undefined) {
      return {flexWrap: wrap ? 'wrap' : 'nowrap'}
    }
  },

  // Padding
  ({props, styleSheet}) => {
    if (props.padding > -1) {
      return {padding: props.padding}
    }
  },

  // Justify
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

  // Color name handling
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
  },

]
