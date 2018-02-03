import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import propTypes from './PropTypes'

const getStyleSheet = (
  {
    context,
    props,
    state,
    sheets,
    definition,
    util,
    mutableStyleValues,
    attrName,
    fullAttrName,
    plugins}) => {

  const style = props[fullAttrName]
  const {config, options, registry, namespace, Name, Type} = definition
  const {styleSheet, colors} = registry

  let childClassName
  let className = options.className || Name
  let componentClassName = namespace ? `${namespace}.${className}` : className

  // Passing style to nested child component
  if (attrName && attrName !== 'style') {
    childClassName = attrName.charAt(0).toUpperCase() +
      attrName.substr(1)
    componentClassName += '.' + childClassName
  }

  const ns = {
    typeName: Name,
    className,
    componentClassName,
    childClassName,
    namespace
  }

  const defaultClassStyle = styleSheet[componentClassName] ?
    [styleSheet[componentClassName]] : []

  let {defaultStyles} = options

  if (Array.isArray(defaultStyles)) {
    defaultStyles = defaultStyles.concat(defaultClassStyle)
  }

  // Use default component class style
  if (!defaultStyles) {
    defaultStyles = defaultClassStyle
  }

  const invariant = registry.styleInvariants[componentClassName]
  if (invariant) {
    const {value} = invariant
    const values = mutableStyleValues
    console.log('got style invariant for class name')
    invariant.plugin({value, values})
  }

  //let sheets = []

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  // Process plugins
  const pluginOptions = {
    context,
    props,
    state,
    util,
    ns,
    config,
    definition,
    sheets,
    registry,
    styleSheet,
    options,
    colors,
    mutableStyleValues
  }

  plugins.globals.forEach((plugin) => {
    pluginOptions.plugin = plugin
    const style = plugin.func(pluginOptions)
    if (style) {
      if (!style.overwrite) {
        sheets = sheets.concat(style)
      // Global plugins can rewrite the entire list of styles
      } else {
        delete style.overwrite
        sheets = Array.isArray(style) ? style : [style]
      }
    }
  })

  const {keys, map} = plugins.property
  keys.forEach((propName) => {
    if ((props && props[propName] !== undefined)
        || (context && context[propName] !== undefined)) {
      const plugin = map[propName]
      pluginOptions.plugin = plugin
      pluginOptions.propName = propName
      pluginOptions.prop = props[propName]
      const style = plugin.func(pluginOptions)
      if (style) {
        sheets = sheets.concat(style)
      }
    }
  })

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

  if (options.flat) {
    return StyleSheet.flatten(sheets)
  }

  return sheets
}


// High order component wrapper
const withPrism = (Stylable, definition, util) => {
  const {
    getStylePropertyName,
    isObject,
    isString
  } = util
  class PrismComponent extends Component {

    constructor (props) {
      super(props)
      if (!definition.registry) {
        throw new Error(
          'Prism: no style registry configured, ' +
          'did you forget to call Prism.configure()?')
      }
      if (!definition.registry.styleSheet) {
        throw new Error(
          'Prism: no style sheet available, ' +
          'did you forget to call styleRegistry.addStyleSheet()?')
      }
      // Class level processing options
      const {options} = definition
      const state = {
        styleValues: {}
      }

      // Initialize empty styles, following the convention
      options.stylePropertyNames.forEach((name) => {
        name = getStylePropertyName(name)
        // Use initialStyles set by defaultProps
        state.styleValues[name] = definition.Type.initialStyles[name].slice()
      })
      this.state = state
    }

    setNativeProps (props) {
      const {stylable} = this.refs
      if (stylable.setNativeProps) {
        stylable.setNativeProps(props)
      }
    }

    processStylePlugins (props, testFunc = () => true) {
      const {registry, options, Type} = definition
      const {stylePropertyNames, mapPropsToStyleObject} = options
      const {globals, property} = options.plugins
      const {styleValues} = this.state
      const {context} = this
      let mutableStyleValues = Object.assign({}, styleValues)
      stylePropertyNames.forEach((attrName) => {
        if (testFunc({props, attrName})) {
          const fullAttrName = getStylePropertyName(attrName)
          const availableProperties = mapPropsToStyleObject[attrName].slice()
          const propertyStyleMap = {}
          const flatAvailableProperties =
            availableProperties.reduce((list, val) => {
              if (isObject(val)) {
                const keys = Object.keys(val)
                list.push(keys)
                keys.forEach((key) => {
                  propertyStyleMap[key] = val[key]
                })
              } else if (isString(val)) {
                list.push(val)
              }
              return list
            }, [])

          // TODO: only run global plugins once!

          // Filter to properties available for this property attribute
          // Eg: style, labelStyle, imageStyle etc
          let propertyMap = {}
          let propertyPlugins = property.reduce((list, plugin) => {
            const ind = flatAvailableProperties.indexOf(plugin.name)
            if (~ind) {
              propertyMap[plugin.name] = plugin
              list.push(plugin.name)
              flatAvailableProperties.splice(ind, 1)
            }
            return list
          }, [])
          const plugins = {
            globals: globals,
            property: {
              keys: propertyPlugins,
              map: propertyMap
            }
          }

          let sheets = mutableStyleValues[fullAttrName]
          // Must wrap in if flat is in use
          if (sheets && !Array.isArray(sheets)) {
            sheets = [sheets]
          }

          const {state} = this

          const computedStyle = getStyleSheet(
            {
              context,
              props,
              state,
              sheets,
              util,
              definition,
              attrName,
              fullAttrName,
              mutableStyleValues,
              plugins
            })

          // It's possible for a component to declare style
          // properties not mapped to a plugin, in this case
          // we pass the properties through verbatim
          // TODO: provide a default handler for these properties?
          // NOTE: currently this is the last computed style so overrides
          // NOTE: values in the target attribute eg: `labelStyle`
          if (flatAvailableProperties.length) {
            const verbatim = {}
            flatAvailableProperties.forEach((name) => {
              let styleProp = name
              if (propertyStyleMap[name]) {
                styleProp = propertyStyleMap[name]
              }
              if (props[name] !== undefined) {
                verbatim[styleProp] = props[name]
              }
            })
            computedStyle.push(verbatim)
          }

          mutableStyleValues[fullAttrName] = computedStyle
        }
      })
      this.setState({styleValues: mutableStyleValues})
    }

    static childContextTypes = {
      font: propTypes.fontPropType,
      text: propTypes.textPropType
    }

    static contextTypes = {
      font: propTypes.fontPropType,
      text: propTypes.textPropType
    }

    getChildContext () {
      const {options} = definition
      const {props} = this
      const context = {}
      // NOTE: we only propagate to children
      // NOTE: until a component that supportsText
      // NOTE: is found
      if (!options.supportsText) {
        if (props.font) {
          context.font = props.font
        }
        if (props.text) {
          context.text = props.text
        }
      }
      return context
    }

    // So that changes to style properties are
    // reflected in the stylable component
    componentWillReceiveProps (props) {
      this.processStylePlugins(props, ({attrName}) => {
        // TODO: proper invalidation
        return props[attrName] && this.props[attrName]
      })
    }

    componentWillMount () {
      this.processStylePlugins(this.props)
    }

    render () {
      const children = this.state.children || this.props.children
      return (
        <Stylable
          ref='stylable'
          {...this.props}
          {...this.state.styleValues}>
          {children}
        </Stylable>
      )
    }
  }

  PrismComponent.propTypes = Stylable.propTypes
  PrismComponent.defaultProps = Stylable.defaultProps

  // Inject font contextType
  Stylable.contextTypes = Stylable.contextTypes || {}
  Stylable.childContextTypes = Stylable.childContextTypes || {}

  Stylable.contextTypes.font = propTypes.fontPropType
  Stylable.childContextTypes.font = propTypes.fontPropType
  Stylable.contextTypes.text = propTypes.textPropType
  Stylable.childContextTypes.text = propTypes.textPropType

  if (Stylable.prototype.getChildContext) {
    Stylable.prototype._getChildContext = Stylable.prototype.getChildContext
  }

  Stylable.prototype.getChildContext = function () {
    let context = PrismComponent.prototype.getChildContext.call(this)
    // Call original getChildContext which wins over our
    // pre-defined child context so if there is a collision
    // I sure hope you know what you are doing
    if (this._getChildContext) {
      // NOTE: it's important we always have a context so guard
      // NOTE: against an implementation not returning an object
      const originalContext = this._getChildContext()
      context = Object.assign(context, isObject(originalContext) ? originalContext : {})
    }
    return context
  }

  // So we can easily see the underlying component name in errors
  PrismComponent.displayName = `Prism(${definition.Name})`

  return PrismComponent
}

export default withPrism
