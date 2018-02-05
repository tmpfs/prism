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
    sheets,
    definition,
    util,
    mutableStyleValues,
    childComponentNames,
    attrName,
    plugins}) => {

  const style = props[attrName]
  const {config, options, registry, namespace, Name, Type} = definition
  const {styleSheet, colors, invariants} = registry

  const ns = new Namespace(
    {namespace, className: options.className, typeName: Name})

  const defaultStyles = styleSheet[ns.componentClassName] ?
    [styleSheet[ns.componentClassName]] : []

  if (invariants[ns.componentClassName]) {
    defaultStyles.push(invariants[ns.componentClassName])
  }

  // Add default styles
  sheets = sheets.concat(defaultStyles)

  let keys = config.availablePropertyNames.slice()
  const map = config.availablePropertyPlugins

  // Build the map of child properties that we should put
  // into extractedStyles so  that properties assigned to child
  // components are not applied to the parent style
  const {mapStyleToComponent, styleForceInclusion} = options
  const mappedChildProperties = Object.keys(mapStyleToComponent)
    .reduce((list, childName) => {
        const v = mapStyleToComponent[childName]
        if (Array.isArray(v)) {
          const names = v.reduce((propNames, nm) => {
            const seen = (nm) => {
              return ~styleForceInclusion.indexOf(nm) || ~list.indexOf(nm) || ~propNames.indexOf(nm)
            }
            if (isString(nm)) {
              if (!seen(nm)) {
                propNames.push(nm)
              }
            } else if(isObject(nm)) {
              for (let z in nm) {
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

  const newProps = {}

  // Encapsulates the mutation functionality for
  // plugins
  const mutations = {
    // Add a child style object
    addChildStyle: (propName, propValue) => {
      mutableStyleValues[propName] = propValue
    },
    addProperty: (propName, propValue) => {
      // TODO: run property plugins on these properties
      mutableStyleValues[propName] = propValue

      //newProps[propName] = propValue
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
    mutations,
    childComponentNames,
    attrName
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

  // Run before global plugins
  runGlobalPlugins(before)

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
          if (~mappedChildProperties.indexOf(plugin.name)) {
            return
          }
          sheets = sheets.concat(style)
        }
      }
    })
  }

  runPropertyPlugins(keys, props)

  // Run after global plugins
  runGlobalPlugins(after)

  // Add inline `style` property
  if (style) {
    sheets = sheets.concat(style)
  }

  //console.log('hasPre: ' + processor.hasPreProcessors)

  if (processor.hasPreProcessors) {
    const flat = StyleSheet.flatten(sheets)
    const expansions = processor.process(flat)
    const keys = Object.keys(expansions)
    if (keys.length) {
      for (let k in expansions) {
        mutableStyleValues[k] = expansions[k]
      }
      runPropertyPlugins(keys, expansions)
    }
    //console.log('after processing: ')
    //console.log(flat)
    return options.flat ? flat : [flat]
  }

  if (options.flat) {
    return StyleSheet.flatten(sheets)
  }

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
      // Class level processing options
      const {options} = definition
      const state = {
        styleValues: {}
      }

      const childComponentNames = ['style'].concat(options.childComponentNames)
      // Initialize a style object for each child component style
      childComponentNames.forEach((name) => {
        // Use initialStyles set by defaultProps
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
      const {childComponentNames, mapStyleToComponent} = options
      const {plugins} = options
      const {styleValues} = this.state
      const {state, context} = this
      let mutableStyleValues = Object.assign({}, styleValues)
      const styleAttrName = 'style'
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
            childComponentNames
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
  PrismComponent.defaultProps = Stylable.defaultProps

  definition.Type = Stylable
  definition.NewType = PrismComponent

  return PrismComponent
}

export default withPrism
