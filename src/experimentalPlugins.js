import React from 'react'

import Plugin from './Plugin'
import propTypes from './propTypes'

import util from './util'

export default [

  // Text
  new Plugin(
    'textTransform',
    ({context, prop, props, state, options}) => {
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

]
