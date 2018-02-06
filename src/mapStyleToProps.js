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

    const move = (newValue, newPropName, expand = false) => {
      newPropName = newPropName || propName
      if (expand) {
        expansions[newPropName] = newValue
        if (hasOptions) {
          pluginOptions.additionalProperties[newPropName] = newValue
        }
        expanded = true
      } else {
        target[newPropName] = newValue
      }
      // Writing a new property (expansion)
      // so delete the old one
      if (expand || (newPropName !== propName)) {
        delete target[propName]
      }
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
          const result = fn({...registry, options, props, prop})
          // TODO: API?
          additionalProperties[propName] = result
          delete styleProps[propName]
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
