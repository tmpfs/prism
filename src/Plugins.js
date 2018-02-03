import PropTypes from 'prop-types'
import propTypes from './PropTypes'

import {StyleSheet} from 'react-native'

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
    'mapStyleToProps',
    ({sheets, options, util, mutableStyleValues}) => {
      const {mapStyleToProps} = options
      const {isObject, isString} = util
      if (isObject(mapStyleToProps)) {
        const map = mapStyleToProps
        //const map = mapStyleToProps[fullAttrName] || mapStyleToProps[attrName]
        //if (map !== undefined) {
          const flat = StyleSheet.flatten(sheets)
          let k
          let v
          let key
          for (k in map) {
            key = k
            v = map[k]
            if (v) {
              // Rewrite prop name
              if (isString(v)) {
                key = v
              }
              // Prevent overwriting, style, childStyle etc.
              //if (mutableStyleValues[key] !== undefined) {
                //throw new Error(
                  //`Prism you mapped ${key} as a prop but the property is already defined`)
              //}
              if (isObject(v)) {
                mutableStyleValues[key] = mutableStyleValues[key] || {}
                for (let z in v) {
                  if (flat[z] !== undefined) {
                    mutableStyleValues[key][z] = flat[z]
                  }
                }
                delete flat[k]
              } else {
                if (flat[k] !== undefined) {
                  mutableStyleValues[key] = flat[k]
                  delete flat[k]
                }
              }
            }
          }
          console.log(flat)
          const res = [flat]
          res.overwrite = true
          return res
          //computedStyle = options.flat ? flat : [flat]
        //}
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
        if (typeof(stateStyle) === 'string') {
          const stateClassName = ns.componentClassName + '.' + stateStyle
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
