//import PropTypes from 'prop-types'
import propTypes from './propTypes'

//import {StyleSheet} from 'react-native'
//import util from './util'

//const {isObject, isString, isFunction} = util

export default [

  // Support for className
  [
    ({prop, styleSheet, registry}) => {
      const {invariants} = registry
      const className = prop
      const find = (list) => {
        return list
          .reduce((arr, nm) => {
            if (styleSheet[nm]) {
              arr.push(styleSheet[nm])
            }
            // Must add invariant styles too
            if (invariants[nm]) {
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
  ]

]
