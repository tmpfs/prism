import React from 'react'

import Plugin from './Plugin'
import propTypes from './propTypes'

export default [

  // Text
  new Plugin(
    'textTransform',
    ({context, prop, props, state, util, options}) => {
      // Inherited from the parent context
      if (!prop && context) {
        prop = context.textTransform
      }

      const transformer = (prop, s) => {
        switch(prop) {
          case 'uppercase':
            s = s.toUpperCase()
            break;
          case 'lowercase':
            s = s.toLowerCase()
            break;
          case 'capitalize':
            s = util.ucword(s)
            break;
        }
        return s
      }

      const it = (children) => {
        if (util.isString(children)) {
          children = transformer(prop, children)
        }
        return children
      }

      if (prop && options.supportsText) {
        let {children} = props
        children = it(children)
        children = React.Children.map(children, (child) => {
          return it(child)
        })
        // NOTE: we push children on to the state
        // NOTE: the HOC will prefer children in state
        // NOTE: to the original children in props
        state.children = children
      }
    },
    {propType: propTypes.textTransform}
  ),

  // Font
  new Plugin(
    'font',
    ({context, prop, styleSheet, colors, sizes, config, options}) => {
      if (options.supportsText) {
        const fontShapeColors = propTypes.fontShapeColors
        const fontShapeMap = propTypes.fontShapeMap
        // Inherited from the parent context
        if (!prop && context) {
          prop = context.font
        } else {
          prop = Object.assign({}, context.font, prop)
        }
        const style = {}
        for (let k in prop) {
          if (prop[k] !== undefined) {
            let val = prop[k]
            if (~fontShapeColors.indexOf(k)) {
              val = colors[val] || val
            }
            style[fontShapeMap[k]] = val
          }
        }

        // Handle string type - named font size
        if (style.fontSize && typeof(style.fontSize) === 'string') {
          // TODO: throw error on missing size or fall through to style validation?
          const sizes = options.sizes || sizes || config.sizes || {}
          const fontSize = sizes[style.fontSize] || 16
          style.fontSize = fontSize
        }
        return style
      }
    },
    {propType: propTypes.font}
  )
]
