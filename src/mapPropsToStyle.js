import Plugin from './Plugin'
import util from './util'
const {isString, isFunction, isObject} = util

const selector = ({registry, attrName, ns, sheets}) => {
  const css = (name) => registry.resolve(name)
  // Set from a pseudo class (:)
  css.pseudo = (name) => registry.select(registry.pseudo(name, ns, attrName), sheets)
  // Set from an id declaration (#)
  css.id = (name) => registry.select(registry.id(name, ns, attrName), sheets)
  // Set from class name style (.)
  css.className = (name) => registry.select(registry.className(name, ns, attrName), sheets)
  // Set by type name (Component)
  css.type = (name) => registry.select(registry.type(name, ns, attrName), sheets)
  return css
}

export default new Plugin(
  'mapPropsToStyle',
  (pluginOptions) => {
    const {props, options, registry, definition, newState, ns, attrName, isPrimaryStyle} = pluginOptions
    const {mapPropsToStyle} = options
    let map = mapPropsToStyle
    if (isObject(map[attrName])) {
      // Iterating a child object definition, eg: labelStyle
      map = map[attrName]
    }

    const sheets = []

    for (const propName in map) {
      const prop = props[propName]
      // Note that `state` is the build in wildcard, always gets called
      if (propName === 'state' || (props.hasOwnProperty(propName) && prop !== undefined)) {
        const fn = map[propName]
        if (isFunction(fn)) {
          const state = newState || {}
          const css = selector({...pluginOptions, sheets})
          const sheet = fn({...registry, registry, props, prop, propName, state, css})

          // This is a convenient shortcut for returning the
          // prop itself to assign it to a style with the same
          // name and value, you can just do:
          //
          // color: ({prop}) => prop
          //
          if (sheet && sheet === prop) {
            const tmp = {}
            tmp[propName] = prop
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
