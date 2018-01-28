import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Platform, StyleSheet} from 'react-native'
import StyleRegistry from './StyleRegistry'
import Plugins from './Plugins'

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
  background: colorType,
  border: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.shape({
      color: PropTypes.string,
      ...position
    })
  ]),
  radius: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      top: PropTypes.shape(sides),
      bottom: PropTypes.shape(sides)
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
  plugins: Plugins
}

const getStyleSheet = ({props, definition}) => {
  const {style} = props
  const {config, options, registry} = definition

  const {styleSheet, colors} = registry
  const defaultClassStyle = styleSheet[definition.Name] ?
    [styleSheet[definition.Name]] : []

  let {defaultStyles, inherit} = options

  if (defaultStyles && inherit) {
    defaultStyles = defaultStyles.concat(defaultClassStyle)
  }

  // Look up default styles by class name
  if (!defaultStyles) {
    defaultStyles = defaultClassStyle
  }

  let sheets = []

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

      constructor (props) {
        super(props)
        if (!definition.registry) {
          throw new Error(
            'No style registry configured, did you forget to call Prism.configure()?')
        }
        if (!definition.registry.styleSheet) {
          throw new Error(
            'No style sheet available, did you forget to call styleRegistry.addStyleSheet()?')
        }
      }

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

  const definition = {Type, Name, styleOptions, mapPropsToStyle}
  const NewType = Wrapped(Type, definition)
  definition.NewType = NewType

  if (!Prism.registry) {
    // Collect components before a registry is available,
    // these will be registered when Prism.configure() is called
    Prism.components.push(definition)
  } else {
    // Already configured so register directly
    registerComponent(Prism.registry, definition, Prism.config)
  }

  return NewType
}

const registerComponent = (registry, definition, config) => {
  const {Type, Name, styleOptions, mapPropsToStyle} = definition
  definition.options = {}
  if (styleOptions) {
    const options = styleOptions({...registry, compile})
    const {defaultStyles} = options
    if (defaultStyles && !Array.isArray(defaultStyles)) {
      throw new Error(
        'Default styles should be an array of objects')
    }

    definition.options = options
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

  // Merge config propTypes into the Stylable propTypes.
  //
  // On collision the underlying component propTypes win.
  const propertyTypes = Object.assign({}, config.propTypes, Type.propTypes)
  Type.propTypes = propertyTypes

  // TODO: support multiple registries
  // TODO: merge if we have an existing registry?
  definition.config = config
  definition.registry = registry
}

Prism.components = []
Prism.configure = (registry, config = {}) => {
  if (!(registry instanceof StyleRegistry)) {
    throw new Error('You must pass a StyleRegistry to configure')
  }

  Prism.config = Object.assign({}, Configuration, config)
  Prism.components.forEach((definition) => {
    registerComponent(registry, definition, Prism.config)
  })

  Prism.registry = registry
}

Prism.propTypes = propTypes

export {StyleRegistry, Prism}
