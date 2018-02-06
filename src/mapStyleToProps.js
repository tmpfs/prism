import Plugin from './Plugin'
import util from './util'
const {isObject} = util

export default new Plugin(
  'mapStyleToProps',
  ({props, options}) => {
    const {mapStyleToProps} = options
    let map = mapStyleToProps
    if (isObject(map[attrName])) {
      // Iterating a child object definition, eg: labelStyle
      map = map[attrName]
    }
    const sheets = []
    for (const propName in map) {
      const prop = props[propName]
      if (props.hasOwnProperty(propName) && prop !== undefined) {
        const fn = map[propName]
        if (isFunction(fn)) {

        }
      }
    }
  },
  {
    definesChildren: true,
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
