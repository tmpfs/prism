import Plugin from './Plugin'
import util from './util'
const {isObject} = util

export default new Plugin(
  'mapStyleToProps',
  ({props, options, registry, ns, attrName, styleSheet}) => {
    // TODO
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
