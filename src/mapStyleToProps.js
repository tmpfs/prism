import Plugin from './Plugin'
import util from './util'
const {isObject, isFunction} = util

export default new Plugin(
  'mapStyleToProps',
  ({props, options, registry, attrName, flat, additionalProperties}) => {
    const {mapStyleToProps} = options
    let map = mapStyleToProps
    if (isObject(map[attrName])) {
      // Iterating a child object definition, eg: labelStyle
      map = map[attrName]
    }
    const sheets = []
    const styleProps = flat

    const {colors} = registry

    const remove = (propName) => {
      delete styleProps[propName]
    }

    const move = (propName, propValue) => {
      additionalProperties[propName] = propValue
      remove(propName)
    }

    for (const propName in map) {
      let prop = styleProps[propName]

      // Ensure we respect a property override
      if (props && props[propName]) {
        prop = props[propName]
      }

      if (prop !== undefined) {
        // FIXME: shouldn't be looking up color names here
        prop = colors[prop] || prop

        const fn = map[propName]
        if (isFunction(fn)) {
          const result = fn({...registry, registry, props, prop, propName, move, remove})
          // Shortcut for the move operation
          // is to return the prop
          if (result === prop) {
            move(propName, prop)
          }
        }
      }
    }
  },
  {
    flatStyles: true,
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
