import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Platform, StyleSheet} from 'react-native'

const position = {
  top: PropTypes.number,
  right: PropTypes.number,
  bottom: PropTypes.number,
  left: PropTypes.number
}

const compile = (decl) => {
  const sheet = {decl}
  const compiled = StyleSheet.create(sheet)
  return compiled.decl
}

const boxModelType = PropTypes.oneOfType([
  // All sides are equal
  PropTypes.number,

  // {top: 2, left: 4}
  PropTypes.shape(position),

  // Array is vertical/horizontal: [5, 10]
  PropTypes.arrayOf(PropTypes.number)
])

// TODO: find definition for react native color type
const colorType = PropTypes.string

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

const sides = {
  left: PropTypes.number,
  right: PropTypes.number
}

const propTypes = {
  style: PropTypes.oneOfType([
    // NOTE: we need number for compiled stylesheets
    PropTypes.number,
    PropTypes.array,
    PropTypes.object
  ]),
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  background: colorType,
  radius: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      top: PropTypes.shape(sides),
      bottom: PropTypes.shape(sides)
    })
  ]),
  flex: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.shape({
      row: PropTypes.bool,
      grow: PropTypes.number,
      wrap: PropTypes.bool
    })
  ]),
  direction: PropTypes.oneOf(['row', 'column']),
  wrap: PropTypes.bool,
  justify: PropTypes.oneOf([
    'center', 'start', 'end', 'between', 'around'
  ]),
  padding: boxModelType,
  margin: boxModelType,
  position: PropTypes.shape(position),
  border: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.shape({
      color: PropTypes.string,
      ...position
    })
  ])
}

const Configuration = {
  colorProperties: [
    'color',
    'backgroundColor',
    'borderColor',
    'background'
  ],
  propTypes: propTypes,
  plugins: [
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
}

class StyleRegistry {
  fonts = {}
  colors = {}
  colorNames = []
  colorProperties = []
  styles = {}
  styleSheet = null

  addColors (colors) {
    this.colors =
      Object.assign(this.colors, colors)
    this.colorNames = Object.keys(this.colors)
  }

  addFonts (map) {
    const ios = Platform.OS === 'ios'
    for (let k in map) {
      const fn = map[k]
      this.fonts[k] = fn(ios)
    }
  }

  addStyleSheet (styleSheet) {
    const {colors, fonts, colorNames, colorProperties} = this

    // styleSheet should be a function
    this.styles = Object.assign(
      {},
      styleSheet({colors, fonts, colorNames, colorProperties})
    )

    // Compile the raw styles
    this.styleSheet = StyleSheet.create(this.styles)
  }
}

const getStyleSheet = ({props, definition}) => {
  let {style} = props

  const {config, options, registry} = definition

  // No registry configured, just pass through the style
  if (!registry) {
    return style ? [style] : []
  }

  const {styleSheet, colors} = registry

  let {defaultStyles} = options

  // Look up default styles by class name
  if (!defaultStyles) {
    defaultStyles = styleSheet[definition.Name] ?
      [styleSheet[definition.Name]] : []
  }

  let sheets = []
  if (!Array.isArray(defaultStyles)) {
    defaultStyles = []
  }

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

  // Process plugins
  const pluginOptions = {
    config,
    definition,
    registry,
    props,
    styleSheet,
    options,
    colors
  }

  const plugins = config.plugins || []
  plugins.forEach((plugin) => {
    const style = plugin(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
    }
  })

  return sheets
}

// Register a stylable component type.
//
// Likely the registry has not been set yet.
const Prism = (Type) => {
  const Name = Type.name

  let styleOptions
  let mapPropsToStyle = Type.mapPropsToStyle

  if (Type.styleOptions instanceof Function) {
    styleOptions = Type.styleOptions
  }

  // High order component wrapper
  const Wrapped = (Stylable, definition) => {
    class PrismComponent extends Component {
      state = {
        style: []
      }

      setNativeProps (props) {
        const {stylable} = this.refs
        if (stylable.setNativeProps) {
          stylable.setNativeProps(props)
        }
      }

      // So that changes to `style` are
      // reflected in the stylable
      componentWillReceiveProps (props) {
        // TODO: proper invalidation
        if (props.style && this.props.style) {
          const style = getStyleSheet({props, definition})
          this.setState({style})
        }
      }

      componentWillMount () {
        const {props} = this
        const style = getStyleSheet({props, definition})
        this.setState({style})
      }

      render () {
        if (!definition.registry) {
          return (
            <Stylable
              ref='stylable'
              {...this.props}
              style={this.state.style} />
          )
        }

        return (
          <Stylable
            ref='stylable'
            {...this.props}
            style={this.state.style}
            styleRegistry={definition.registry}
            styleFlexRow={this.props.direction === 'row'}
            styleSheet={definition.registry.styleSheet} />
        )
      }
    }

    PrismComponent.propTypes = Stylable.propTypes
    PrismComponent.defaultProps = Stylable.defaultProps

    return PrismComponent
  }

  const Definition = {Type, Name, styleOptions, mapPropsToStyle}
  const NewType = Wrapped(Type, Definition)
  Definition.NewType = NewType

  // TODO: use Set/HashMap
  Prism.components.push(Definition)

  return NewType
}

Prism.components = []
Prism.configure = (registry, config = {}) => {
  if (registry) {
    config = Object.assign({}, Configuration, config)

    Prism.components.forEach((Definition) => {
      const {Type, Name, styleOptions, mapPropsToStyle} = Definition
      Definition.options = {}
      if (styleOptions) {
        Definition.options = styleOptions({...registry, compile})
      }

      // Validate mapPropsToStyle
      if (mapPropsToStyle) {
        if(mapPropsToStyle.toString() !== '[object Object]') {
          throw new Error(
            `Static mapPropsToStyle must be a plain object`)
        }
        for (let k in mapPropsToStyle) {
          if (!(mapPropsToStyle[k] instanceof Function)) {
            throw new Error(
              `Function for mapPropsToStyle field ${k} expected`)
          }
        }
      }

      // Merge config propTypes into the Stylable propTypes
      const propertyTypes = Object.assign({}, config.propTypes, Type.propTypes)
      Type.propTypes = propertyTypes

      // TODO: merge if we have an existing registry
      Definition.config = config
      Definition.registry = registry
    })
  }
}

Prism.propTypes = propTypes

export {StyleRegistry, Prism}
