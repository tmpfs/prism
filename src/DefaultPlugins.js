import PropTypes from 'prop-types'
import propTypes from './propTypes'

import {StyleSheet} from 'react-native'
import util from './util'

const {isObject, isString, isFunction} = util

export default [

  // Support for className
  //[
    //({prop, styleSheet, registry}) => {
      //const {invariants} = registry
      //const className = prop
      //const find = (list) => {
        //return list
          //.reduce((arr, nm) => {
            //if (styleSheet[nm]) {
              //arr.push(styleSheet[nm])
            //}
            //if (invariants[nm]) {
              //arr.push(invariants[nm])
            //}
            //return arr
          //}, [])
      //}
      //if (Array.isArray(className)) {
        //return find(className)
      //}
      //return find(className.split(/\s+/))
    //},
    //{className: propTypes.className}
  //],

  // Support for mapPropsToStyle
  [
    'mapPropsToStyle',
    ({props, options, registry, util, ns, attrName, styleSheet}) => {
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

              // Returned a string, trigger :hover syntax
              if (isString(sheet)) {
                let stateStyleDeclName
                let stateStyleSheet
                if (attrName === 'style') {
                  // This gives us the top-level component
                  stateStyleDeclName = ns.getStateClassName(sheet)
                  stateStyleSheet = styleSheet[stateStyleDeclName]
                } else{
                  stateStyleDeclName = ns.getChildStateClassName(attrName, sheet)
                  stateStyleSheet = styleSheet[stateStyleDeclName]
                }

                if (stateStyleSheet) {
                  sheets.push(stateStyleSheet)
                }
              }else if (sheet !== undefined) {
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
