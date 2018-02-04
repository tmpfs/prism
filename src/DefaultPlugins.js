import PropTypes from 'prop-types'
import propTypes from './PropTypes'

import {StyleSheet} from 'react-native'
import util from './util'

const {isObject, isString, getStylePropertyName} = util

export default [

  // Support for className
  [
    ({prop, styleSheet}) => {
      const className = prop
      const find = (list) => {
        return list
          .filter((nm) => styleSheet.hasOwnProperty(nm))
          .map((nm) => styleSheet[nm])
      }

      if (Array.isArray(className)) {
        return find(className)
      }

      return find(className.split(/\s+/))
    },
    {className: propTypes.className}
  ],

  [
    'mapPropsToComponent',
    (pluginOptions) => {
      const {
        props,
        options,
        extractedStyles,
        definition,
        ns,
        styleSheet,
        stylePropertyNames,
        mutableStyleValues} = pluginOptions
      //console.log('mapPropsToComponent: ' + stylePropertyNames)
      const {mapPropsToComponent} = options
      const {Type} = definition
      let defaultProps = Type.defaultProps || {}
      //const sheets = []
      //const originalSheets = sheets
      const target = {}

      stylePropertyNames.forEach((attrName) => {
        const fullAttrName = getStylePropertyName(attrName)
        let sheets = []

        const defaults = defaultProps[fullAttrName] || defaultProps[attrName]
        if (isObject(defaults)) {
          sheets.push(defaults)
        }

        //if (defaultProps[fullAttrName]) {

        //}

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

        // TODO: handle state!!

        const source = mapPropsToComponent[attrName]
        const target = {}
        let matched = false
        //console.log('mapPropsToComponent: ' + attrName)
        //console.log('mapPropsToComponent: ' + fullAttrName)
        //console.log(source)
        // NOTE: child component style objects are initialized in PrismComponent
        // NOTE: based on stylePropertyNames
        if (Array.isArray(source) && source.length) {
          source.forEach((propName) => {
            //console.log(propName)
            if (isString(propName) && props[propName] !== undefined) {
              // Get from the processed property so we can respect color names
              if (extractedStyles[propName]) {
                sheets = sheets.concat(extractedStyles[propName])
              } else {
                target[propName] = props[propName]
                matched = true
              }
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
                  if (extractedStyles[childPropName]) {
                    sheets = sheets.concat(extractedStyles[childPropName])
                  } else {
                    target[stylePropName] = props[childPropName]
                    //console.log('using prop value: ' + props[childPropName])
                    matched = true
                  }
                }
              })
            }
          })
        }
        if (matched) {
          sheets.push(target)
        }
        //console.log('Assigning child object sheets: ' + fullAttrName)
        //console.log('Assigning child object sheets: ' + sheets.length)
        //console.log(StyleSheet.flatten(sheets))
        mutableStyleValues[fullAttrName] = sheets
      })
    },
    {},
    true
  ],

  [
    'mapStyleToProp',
    ({props, sheets, options, util, definition, mutableStyleValues}) => {
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
            // Note look up in the props before the style sheet
            console.log(props[k])
            const value = (props[k] && defaultProps[k] !== props[k]) ? props[k] : flat[k]
            if (value !== undefined) {
              mutableStyleValues[key] = value
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
    ({props, options, registry, util, ns}) => {
      const {mapPropsToStyleState} = options
      const {styleSheet} = registry
      let stateStyle = mapPropsToStyleState({...registry, props})
      const sheets = []
      if (stateStyle) {
        if (util.isString(stateStyle)) {
          const stateClassName = ns.getStateClassName(stateStyle)
          stateStyle = styleSheet[stateClassName]
        }
        // May be undefined if styleSheet does not exist
        if (stateStyle &&
            (util.isArray(stateStyle) ||
             util.isObject(stateStyle) ||
             util.isNumber(stateStyle))) {
          sheets.push(stateStyle)
        }
      }
      return sheets
    }
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
