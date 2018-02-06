import Plugin from './Plugin'
import util from './util'
const {isString, isFunction, isObject} = util

export default new Plugin(
  'mapPropsToStyle',
  ({props, options, registry, ns, attrName, styleSheet}) => {
    const {mapPropsToStyle} = options
    let map = mapPropsToStyle
    if (isObject(map[attrName])) {
      // Iterating a child object definition, eg: labelStyle
      map = map[attrName]
    }
    const sheets = []

    // Add a state style to the list of style sheets
    const state = (stateName) => {
      // Returned a string, trigger :hover syntax
      if (isString(stateName)) {
        let stateStyleDeclName
        let stateStyleSheet
        if (attrName === 'style') {
          // This gives us the top-level component
          stateStyleDeclName = ns.getStateClassName(stateName)
          stateStyleSheet = styleSheet[stateStyleDeclName]
        } else{
          stateStyleDeclName = ns.getChildStateClassName(attrName, stateName)
          stateStyleSheet = styleSheet[stateStyleDeclName]
        }
        if (stateStyleSheet) {
          sheets.push(stateStyleSheet)
        }
      }
    }

    for (const k in map) {
      const prop = props[k]
      if (props.hasOwnProperty(k) && prop !== undefined) {
        const fn = map[k]
        if (isFunction(fn)) {
          const sheet = fn({...registry, options, ns, props, prop, state})

          // This is a convenient shortcut for returning the
          // prop itself to assign it to a style with the same
          // name and value, you can just do:
          //
          // color: ({prop}) => prop
          //
          if (sheet === prop) {
            const tmp = {}
            tmp[k] = prop
            sheets.push(tmp)
            continue
          }

          if (sheet !== undefined) {
            sheets.push(sheet)
          }
        }
      }
    }
    return sheets
  },
  {
    definesChildren: true,
    requireOptions: true,
    validator: (name, computed) => {
      if (!isObject(computed)) {
        throw new Error(
          `Prism you declared ${name} as an invalid type, expected object ` +
          `but got ${typeof(computed)}`
        )
      }
    }
  }
)
