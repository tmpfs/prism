import PropTypes from 'prop-types'
import propTypes from './PropTypes'

import {StyleSheet} from 'react-native'
import util from './util'

const {isObject, isString} = util

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
    ({props, options, util, attrName}) => {
      const {mapPropsToComponent} = options
      const source = mapPropsToComponent[attrName]
      const target = {}
      // This is only for child component objects
      if (attrName !== 'style') {
        if (Array.isArray(source)) {
          let matched = false
          source.forEach((propName) => {
            if (isString(propName) && props[propName] !== undefined) {
              target[propName] = props[propName]
              matched = true
            // Handle object definition: {space: marginTop}
            } else if (isObject(propName)) {
              const propertyNames = Object.keys(propName)
              propertyNames.forEach((childPropName) => {
                let stylePropName = childPropName
                // Rewriting the style property name
                if (isString(propName[childPropName])) {
                  stylePropName = propName[childPropName]
                }
                if (props[childPropName] !== undefined) {
                  target[stylePropName] = props[childPropName]
                  matched = true
                }
              })
            }
          })
          // Save adding empty objects to the list of style sheets
          if (matched) {
            return target
          }
        }
      }
    }
  ],

  [
    'mapStyleToProp',
    ({sheets, options, util, mutableStyleValues}) => {
      const {mapStyleToProp} = options
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
            if (flat[k] !== undefined) {
              mutableStyleValues[key] = flat[k]
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
