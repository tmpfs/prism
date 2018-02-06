import React, {Component} from 'react'
import {StyleSheet} from 'react-native'

import propTypes from './propTypes'
import withContext from './withContext'
import Namespace from './Namespace'

import {processor} from './Processor'

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
    definition,
    mutableStyleValues,
    additionalProperties,
    childComponentNames,
    attrName,
    plugins}) => {

  const style = props[attrName]
  const {config, options, registry, namespace, Name, Type} = definition
  const {styleSheet, colors, invariants} = registry
  const ns = new Namespace({namespace, typeName: Name})

  let sheets = []

  const defaultStyles = styleSheet[ns.componentClassName] ?
    [styleSheet[ns.componentClassName]] : []

  let styleRuleName = ns.componentClassName

  if (attrName !== 'style') {
    // Add child class name style sheet
    styleRuleName = ns.getChildClassName(attrName)

    if (invariants[styleRuleName]) {
      sheets.push(invariants[styleRuleName])
    }
  }

  if (styleSheet[styleRuleName]) {
    sheets.push(styleSheet[styleRuleName])
  }

  let keys = config.availablePropertyNames.slice()
  const map = config.availablePropertyPlugins

  // Build the map of child properties that we should put
  // into extractedStyles so  that properties assigned to child
  // components are not applied to the parent style
  //const {mapStyleToProps, styleForceInclusion} = options
  const mappedChildProperties = []
  //const mappedChildProperties = Object.keys(mapStyleToProps)
    //.reduce((list, childName) => {
        //const v = mapStyleToProps[childName]
        //if (Array.isArray(v)) {
          //const names = v.reduce((propNames, nm) => {
            //const seen = (nm) => {
              //return ~styleForceInclusion.indexOf(nm) || ~list.indexOf(nm) || ~propNames.indexOf(nm)
            //}
            //if (isString(nm)) {
              //if (!seen(nm)) {
                //propNames.push(nm)
              //}
            //} else if(isObject(nm)) {
              //for (let z in nm) {
                //if (!seen(z)) {
                  //propNames.push(z)
                //}
              //}
            //}
            //return propNames
          //}, [])
          //// Flatten the array
          //list = list.concat(names)
        //}
      //return list
    //}, [])

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
    registry,
    styleSheet,
    options,
    colors,
    attrName
  }

  const runGlobalPlugins = (globals) => {
    globals.forEach((plugin) => {
      pluginOptions.plugin = plugin
      const style = plugin.func(pluginOptions)
      if (style) {
        sheets = sheets.concat(style)
      }
    })
  }

  //const before = plugins.globals.filter((plugin) => !plugin.isAfter)
  //const after = plugins.globals.filter((plugin) => plugin.isAfter)

  // Run before global plugins
  runGlobalPlugins(plugins.globals)

  const runPropertyPlugins = (keys, props) => {
    // Run property plugins
    keys.forEach((propName) => {
      const plugin = map[propName]
      if (plugin) {
        pluginOptions.plugin = plugin
        pluginOptions.propName = propName
        pluginOptions.prop = props[propName]
        const style = plugin.func(pluginOptions)
        if (style) {
          // This handles ignoring properties that are being
          // routed to child components
          //if (~mappedChildProperties.indexOf(plugin.name)) {
            //return
          //}
          sheets = sheets.concat(style)
        }
      }
    })
  }

  runPropertyPlugins(keys, props)

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

  // NOTE: We only execute for the style attribute
  // NOTE: and assume that the child style objects
  // NOTE: will be passed to the `style` attribute
  // NOTE: of another `Prism` component for further
  // NOTE: processing.
  //
  // NOTE: If this were not the case invariants like
  // NOTE: textTransform would be applied to the parent
  // NOTE: component.
  if (processor.hasPreProcessors && attrName === 'style') {
    const flat = StyleSheet.flatten(sheets)
    const expansions = processor.process(flat, pluginOptions)
    const keys = Object.keys(expansions)
    if (keys.length) {
      for (let k in expansions) {
        additionalProperties[k] = expansions[k]
      }
      runPropertyPlugins(keys, expansions)
    }
    //return options.flat ? flat : [flat]
    return [flat]
  }

  //if (options.flat) {
    //return StyleSheet.flatten(sheets)
  //}

  return sheets
}


// High order component wrapper
const withPrism = (Stylable, definition) => {
  const {config} = definition
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
      const {options} = definition
      // Class level processing options
      const state = {
        styleValues: {},
        additionalProperties: {}
      }

      this.childComponentNames = options.childComponentNames
      this.allStyleObjectNames = ['style'].concat(this.childComponentNames)

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
      const {childComponentNames} = options
      const {plugins} = options
      const {styleValues} = this.state
      const {state, context} = this

      let mutableStyleValues = Object.assign({}, styleValues)
      this.allStyleObjectNames.forEach((name) => {
        mutableStyleValues[name] = []
      })

      const additionalProperties = {}

      const compute = (attrName) => {
        const computedStyle = computeStyles(
          {
            context,
            props,
            state,
            util,
            definition,
            attrName,
            mutableStyleValues,
            plugins,
            additionalProperties,
            childComponentNames
          })
        return computedStyle
      }

      // Compute style properties
      this.allStyleObjectNames.forEach((stylePropertyName) => {
        mutableStyleValues[stylePropertyName] = compute(stylePropertyName)
      })

      // Update the state so styles are reactive
      this.setState({styleValues: mutableStyleValues, additionalProperties})
    }

    // So that changes to style properties are
    // reflected in the stylable component
    componentWillReceiveProps (props) {
      this.processStylePlugins(props, ({attrName}) => {
        // TODO: proper invalidation
        //return props[attrName] && this.props[attrName]
        return true
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
          {...this.state.additionalProperties}
          {...this.state.styleValues}>
          {children}
        </Stylable>
      )
    }
  }

  // So we can easily see the underlying component name in errors
  PrismComponent.displayName = `Prism(${definition.Name})`
  // Proxy propTypes
  PrismComponent.propTypes = Stylable.propTypes

  definition.Type = Stylable
  definition.NewType = PrismComponent

  return PrismComponent
}

export default withPrism
