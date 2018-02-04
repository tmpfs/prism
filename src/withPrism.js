import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import propTypes from './PropTypes'
import Namespace from './Namespace'

import util from './util'

const {
  ucfirst,
  getStylePropertyName,
  isObject,
  isString
} = util

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
    callGlobals,
    plugins}) => {

  const style = props[fullAttrName]
  const {config, options, registry, namespace, Name, Type} = definition
  const {styleSheet, colors} = registry

  // Passing style to nested child component
  let childClassName
  if (attrName && attrName !== 'style') {
    childClassName = ucfirst(attrName)
  }

  const ns = new Namespace(
    {namespace, childClassName, className: options.className, typeName: Name})

  const defaultStyles = styleSheet[ns.componentClassName] ?
    [styleSheet[ns.componentClassName]] : []

  //console.log(ns.componentClassName)
  //console.log(defaultStyles.length)
  //console.log(StyleSheet.flatten(defaultStyles))

  const invariant = registry.styleInvariants[ns.componentClassName]
  if (invariant) {
    const {value} = invariant
    const values = mutableStyleValues
    invariant.plugin({value, values, options, registry, ns})
  }

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  let keys = config.availablePropertyNames.slice()
  const map = config.availablePropertyPlugins

  // Only run plugins when we have a defined property
  keys = keys.filter((propName) => {
    return (
      (props && props[propName] !== undefined) ||
      (context && context[propName] !== undefined)
    )
  })

  // We pass the computed plugins too
  plugins = {
    globals: plugins.globals,
    property: {
      keys: keys,
      map: map,
      processed: []
    }
  }

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
    plugins,
    mutableStyleValues,
    attrName,
    fullAttrName
  }

  // TODO: improve globals handling
  //if (callGlobals) {
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
  //}

  keys.forEach((propName) => {
    const plugin = map[propName]
    if (~plugins.property.processed.indexOf(plugin.name)) {
      return
    }
    pluginOptions.plugin = plugin
    pluginOptions.propName = propName
    pluginOptions.prop = props[propName]
    const style = plugin.func(pluginOptions)
    if (style) {
      sheets = sheets.concat(style)
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
const withPrism = (Stylable, definition) => {
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
        // TODO: do not store initialStyles on the Types
        // TODO: we can store them on the definition
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
      const {stylePropertyNames, mapPropsToComponent} = options
      const {plugins} = options
      const {styleValues} = this.state
      const {state, context} = this
      let mutableStyleValues = Object.assign({}, styleValues)
      let callGlobals = true
      //console.log(stylePropertyNames)
      stylePropertyNames.forEach((attrName) => {
        if (testFunc({props, attrName})) {
          const fullAttrName = getStylePropertyName(attrName)
          let sheets = mutableStyleValues[fullAttrName]
          // Must wrap in if flat is in use
          if (sheets && !Array.isArray(sheets)) {
            sheets = [sheets]
          }
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
              plugins,
              callGlobals
            })

          mutableStyleValues[fullAttrName] = computedStyle
          //callGlobals = false
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

  //// BEGIN CHILD CONTEXT

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

  //// END CHILD CONTEXT

  // So we can easily see the underlying component name in errors
  PrismComponent.displayName = `Prism(${definition.Name})`

  return PrismComponent
}

export default withPrism
