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

  // Color name handling
  [
    'colorNames',
    ({plugin, props, colors, options, definition}) => {
      const {Type} = definition
      let {propNames} = plugin
      const sheet = {}
      propNames.forEach((propName) => {
        const val = props[propName] || (Type.defaultProps && Type.defaultProps[propName])
        if (val) {
          if (colors[val]) {
            sheet[propName] = colors[val]
          } else if (Type.defaultProps && Type.defaultProps[propName]) {
            sheet[propName] = val
          }
        }
      })
      return sheet
    },
    propTypes.colorNames
  ],

  // Support for mapPropsToStyleDecl
  [
    'mapPropsToStyleDecl',
    ({props, options, definition, registry, util}) => {
      const {mapPropsToStyleDecl} = options
      const {Name} = definition
      if (mapPropsToStyleDecl !== undefined) {
        const sheets = []
        let map = mapPropsToStyleDecl
        if (util.isFunction(mapPropsToStyleDecl)) {
          map = mapPropsToStyleDecl(registry)
        }
        for (let k in map) {
          if (props[k] !== undefined) {
            const sheet = map[k]
            if (sheet !== undefined) {
              sheets.push(sheet)
            } else {
              throw new Error(
                `Prism mapPropsToStyleDecl missing style ` +
                `declaration for "${k}" in component ${Name}`
              )
            }
          }
        }
        return sheets
      }
    }
  ],

  // Support for mapPropsToStyleProp
  [
    'mapPropsToStyleProp',
    ({props, options, definition, registry, util}) => {
      const {mapPropsToStyleProp} = options
      const {Name} = definition
      if (mapPropsToStyleProp !== undefined) {
        const sheets = []
        let map = mapPropsToStyleProp
        if (util.isFunction(map)) {
          map = mapPropstoStyleProp(registry)
        }
        for (let k in map) {
          if (props[k] !== undefined) {
            const sheet = {}
            sheet[map[k]] = props[k]
            sheets.push(sheet)
          }
        }
        return sheets
      }
    }
  ],

  // Support for mapping properties to child objects
  [
    'mapPropsToObject',
    ({props, options, registry, util}) => {
      const {mapPropsToObject} = options
      if (mapPropsToObject !== undefined) {
        let map = mapPropsToObject
        if (util.isFunction(map)) {
          map = mapPropsToObject(registry)
        }
        for (let k in map) {
          const def = map[k]
          // NOTE: we take advantage of the fact
          // NOTE: that Object.freeze() is shallow
          // NOTE: here, would like to find a better
          // NOTE: way to propagate these props

          // Property object must already be declared
          if (props[k]) {
            if (Array.isArray(def)) {
              def.forEach((propName) => {
                props[k][propName] = props[propName]
              })
            } else {
              for (let z in def) {
                props[k][z] = props[def[z]]
              }
            }
          }
        }
      }
    }
  ],

  // Support for mapPropsToStyle
  [
    'mapPropsToStyle',
    (pluginOptions) => {
      const {props, definition, options, registry, util} = pluginOptions
      const {mapPropsToStyle} = options
      const {Type} = definition
      if (mapPropsToStyle !== undefined) {
        const sheets = []
        let map = mapPropsToStyle
        if (util.isFunction(map)) {
          map = mapPropsToStyle(registry)
        }
        for (let k in map) {
          const prop = props[k]
          const mapOptions = {...pluginOptions, prop}
          if (props.hasOwnProperty(k) && prop !== undefined) {
            const fn = map[k]
            if (util.isFunction(fn)) {
              const sheet = fn(mapOptions)
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
