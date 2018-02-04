import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import propTypes from './PropTypes'
import Namespace from './Namespace'

import util from './util'

const {
  ucfirst,
  isObject,
  isString
} = util

const computeStyles = (
  {
    context,
    props,
    state,
    sheets,
    definition,
    util,
    mutableStyleValues,
    stylePropertyNames,
    attrName,
    plugins}) => {

  const style = props[attrName]
  const {config, options, registry, namespace, Name, Type} = definition
  const {styleSheet, colors} = registry

  const ns = new Namespace(
    {namespace, className: options.className, typeName: Name})

  const defaultStyles = styleSheet[ns.componentClassName] ?
    [styleSheet[ns.componentClassName]] : []

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

  // Build the map of child properties that we should put
  // into extractedStyles so  that properties assigned to child
  // components are not applied to the parent style
  const {mapPropsToComponent} = options
  const extractedStyles = {}
  const mappedChildProperties = Object.keys(mapPropsToComponent)
    .reduce((list, childName) => {
        const v = mapPropsToComponent[childName]
        if (Array.isArray(v)) {
          const names = v.reduce((propNames, nm) => {
            const seen = (nm) => {
              return ~list.indexOf(nm) || ~propNames.indexOf(nm)
            }
            if (isString(nm)) {
              if (!seen(nm)) {
                propNames.push(nm)
              }
            } else if(isObject(nm)) {
              for (let z in nm) {
                //if (isString(nm[z])) {
                  //z = nm[z]
                //}
                //console.log('getting object property name: ' + z)
                if (!seen(z)) {
                  propNames.push(z)
                }
              }
            }
            return propNames
          }, [])
          // Flatten the array
          list = list.concat(names)
        }
      return list
    }, [])

  //console.log('mappedChildProperties')
  //console.log(mappedChildProperties)

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
    stylePropertyNames,
    attrName,
    extractedStyles
  }

  const runGlobalPlugins = (globals) => {
    globals.forEach((plugin) => {
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
  }

  const before = plugins.globals.filter((plugin) => !plugin.isAfter)
  const after = plugins.globals.filter((plugin) => plugin.isAfter)

  //console.log(before.map((p) => p.name))
  //console.log(after.map((p) => p.name))

  // Run before global plugins
  runGlobalPlugins(before)

  // Run property plugins
  keys.forEach((propName) => {
    const plugin = map[propName]
    pluginOptions.plugin = plugin
    pluginOptions.propName = propName
    pluginOptions.prop = props[propName]
    const style = plugin.func(pluginOptions)
    if (style) {
      if (~mappedChildProperties.indexOf(plugin.name)) {
        //console.log('got mapped child property!!!!')
        extractedStyles[plugin.name] = style
      } else {
        sheets = sheets.concat(style)
      }
    }
  })

  // Run after global plugins
  runGlobalPlugins(after)

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

      const stylePropertyNames = ['style'].concat(options.stylePropertyNames)
      // Initialize empty styles, following the convention
      stylePropertyNames.forEach((name) => {
        // Use initialStyles set by defaultProps
        // TODO: do not store initialStyles on the Types
        // TODO: we can store them on the definition
        state.styleValues[name] = definition.initialStyles[name].slice()
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
      const styleAttrName = 'style'
      //console.log(stylePropertyNames)
      const compute = (attrName) => {
        let sheets = mutableStyleValues[attrName]
        // Must wrap in if flat is in use
        if (sheets && !Array.isArray(sheets)) {
          sheets = [sheets]
        }
        const computedStyle = computeStyles(
          {
            context,
            props,
            state,
            sheets,
            util,
            definition,
            attrName,
            mutableStyleValues,
            plugins,
            stylePropertyNames
          })

        //mutableStyleValues[attrName] = computedStyle

        return computedStyle
      }

      // Compute style property
      if (testFunc({props, styleAttrName})) {
        // This assigns the style property to the state values
        // which in turn will get passed to the wrapped component
        // via props
        mutableStyleValues.style = compute(styleAttrName)
      }

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
