import PropTypes from 'prop-types'
import propTypes from './propTypes'

import {StyleSheet} from 'react-native'
import util from './util'

const {isObject, isString, isFunction} = util

const mapState = ({props, options, registry, util, ns, attrName}) => {
  const {mapPropsToStyleState} = options
  const {styleSheet} = registry
  if (!isFunction(mapPropsToStyleState)) {
    return
  }
  let stateStyle = mapPropsToStyleState({...registry, props})
  const isStyle = attrName === 'style'
  const sheets = []
  if (stateStyle) {
    let stateStyleDeclName
    let stateStyleSheet = stateStyle
    if (util.isString(stateStyle)) {
      if (isStyle) {
        // This gives us the top-level component
        stateStyleDeclName = ns.getStateClassName(stateStyle)
        stateStyleSheet = styleSheet[stateStyleDeclName]
      } else{
        stateStyleDeclName = ns.getChildStateClassName(attrName, stateStyle)
        stateStyleSheet = styleSheet[stateStyleDeclName]
      }
    }
    // May be undefined if styleSheet does not exist
    if (stateStyleSheet &&
        (util.isArray(stateStyleSheet) ||
         util.isObject(stateStyleSheet) ||
         util.isNumber(stateStyleSheet))) {
      sheets.push(stateStyleSheet)
    }
  }
  return sheets
}

export default [

  // Support for className
  [
    ({prop, styleSheet, registry}) => {
      const {invariants} = registry
      const className = prop
      const find = (list) => {
        return list
          .reduce((arr, nm) => {
            console.log(nm)
            if (styleSheet[nm]) {
              arr.push(styleSheet[nm])
            }
            if (invariants[nm]) {
              console.log('style has invariants: ' + nm)
              arr.push(invariants[nm])
            }
            return arr
          }, [])
      }
      if (Array.isArray(className)) {
        return find(className)
      }
      return find(className.split(/\s+/))
    },
    {className: propTypes.className}
  ],



  [
    'mapStyleToComponent',
    (pluginOptions) => {
      const {
        props,
        options,
        definition,
        plugins,
        ns,
        styleSheet,
        registry,
        childComponentNames,
        mutations} = pluginOptions
      const {mapStyleToComponent} = options
      const {Type, initialStyles} = definition
      const {invariants} = registry
      const target = {}

      childComponentNames.forEach((attrName) => {
        let sheets = []

        const defaults = initialStyles[attrName]
        if (isObject(defaults)) {
          sheets.push(defaults)
        }

        // Add base class name (parent component)
        // style sheet
        //if (styleSheet[ns.componentClassName]) {
          //sheets.push(styleSheet[ns.componentClassName])
        //}

        // Add child class name style sheet
        const styleRuleName = ns.getChildClassName(attrName)
        if (styleSheet[styleRuleName]) {
          sheets.push(styleSheet[styleRuleName])
        }

        if (invariants[styleRuleName]) {
          sheets.push(invariants[styleRuleName])
        }

        const stateSheets = mapState({...pluginOptions, attrName})
        sheets = sheets.concat(stateSheets)

        // TODO: handle state!!?

        const source = mapStyleToComponent[attrName]
        const target = {}
        let matched = false
        // NOTE: child component style objects are initialized in PrismComponent
        // NOTE: based on childComponentNames
        if (Array.isArray(source) && source.length) {

          const addMatched = (propName, propValue) => {
            const plugin = plugins.property.map[propName]
            if (plugin) {
              const prop = propValue
              const style = plugin.func({...pluginOptions, prop, propName})
              if (style !== undefined) {
                sheets = sheets.concat(style)
              }
            } else {
              target[propName] = propValue
              matched = true
            }
          }

          source.forEach((propName) => {
            if (isString(propName) && props[propName] !== undefined) {
              // Get from the processed property so we can respect color names
              addMatched(propName, props[propName])
            } else if (isObject(propName)) {
              const propertyNames = Object.keys(propName)
              propertyNames.forEach((childPropName) => {
                let stylePropName = childPropName
                // Rewriting the style property name
                if (isString(propName[childPropName])) {
                  stylePropName = propName[childPropName]
                }

                if (props[childPropName] !== undefined) {
                  // Get from the processed property so we can respect color names
                  addMatched(stylePropName, props[childPropName])
                }
              })
            }
          })
        }
        if (matched) {
          sheets.push(target)
        }

        if (props[attrName]) {
          sheets.push(props[attrName])
        }

        mutations.addChildStyle(attrName, sheets)
      })
    },
    {},
    true
  ],

  [
    'mapStyleToProp',
    ({props, sheets, options, util, definition, mutations}) => {
      const {mapStyleToProp} = options
      const {Type} = definition
      const defaultProps = Type.defaultProps || {}
      const {isString} = util
      if (mapStyleToProp) {
        const flat = StyleSheet.flatten(sheets)
        let k
        let v
        let key
        for (k in mapStyleToProp) {
          key = k
          v = mapStyleToProp[k]
          if (v) {
            // Rewrite prop name
            if (isString(v)) {
              key = v
            }

            // Start with default value
            let value = defaultProps[k]

            // Get value from stylesheet
            if (flat[k] !== undefined) {
              value = flat[k]
            }

            // Inline prop wins
            if (props[k] !== undefined && props[k] !== defaultProps[k]) {
              value = props[k]
            }

            // Add as a property to be passed to the child component
            if (value !== undefined) {
              mutations.addProperty(key, value)
            }
          }
          // Must always remove the style prop
          // likely an invariant
          delete flat[k]
        }
        const res = [flat]
        res.overwrite = true
        return res
      }
    }
  ],

  [
    'mapPropsToStyleState',
    mapState
  ],

  // Support for mapPropsToStyle
  [
    'mapPropsToStyle',
    ({props, options, registry, util, ns}) => {
      const {mapPropsToStyle} = options
      if (mapPropsToStyle !== undefined) {
        const sheets = []
        let map = mapPropsToStyle
        if (util.isFunction(map)) {
          map = mapPropsToStyle(registry)
        }
        for (let k in map) {
          const prop = props[k]
          if (props.hasOwnProperty(k) && prop !== undefined) {
            const fn = map[k]
            // TODO: verify ahead of time?
            if (util.isFunction(fn)) {
              const sheet = fn({...registry, options, ns, props, prop})
              if (sheet !== undefined) {
                sheets.push(sheet)
              }
            }
          }
        }
        return sheets
      }
    }
  ],

]
