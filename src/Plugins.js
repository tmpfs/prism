import PropTypes from 'prop-types'
import propTypes from './PropTypes'

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

  // Support for mapPropsToStyleProp
  //[
    //'mapPropsToStyleProp',
    //({props, options, definition, registry, util}) => {
      //const {mapPropsToStyleProp} = options
      //const {Name} = definition
      //if (mapPropsToStyleProp !== undefined) {
        //const sheets = []
        //let map = mapPropsToStyleProp
        //if (util.isFunction(map)) {
          //map = mapPropstoStyleProp(registry)
        //}
        //for (let k in map) {
          //if (props[k] !== undefined) {
            //const sheet = {}
            //sheet[map[k]] = props[k]
            //sheets.push(sheet)
          //}
        //}
        //return sheets
      //}
    //}
  //],

  // Support for mapPropsToStyleDecl
  //[
    //'mapPropsToStyleDecl',
    //({props, options, definition, registry, util}) => {
      //const {mapPropsToStyleDecl} = options
      //const {Name} = definition
      //if (mapPropsToStyleDecl !== undefined) {
        //const sheets = []
        //let map = mapPropsToStyleDecl
        //if (util.isFunction(mapPropsToStyleDecl)) {
          //map = mapPropsToStyleDecl(registry)
        //}
        //for (let k in map) {
          //if (props[k] !== undefined) {
            //const sheet = map[k]
            //if (sheet !== undefined) {
              //sheets.push(sheet)
            //} else {
              //throw new Error(
                //`Prism mapPropsToStyleDecl missing style ` +
                //`declaration for "${k}" in component ${Name}`
              //)
            //}
          //}
        //}
        //return sheets
      //}
    //}
  //],

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
