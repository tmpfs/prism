import PropTypes from 'prop-types'

import Plugin from './Plugin'
//import propTypes from './propTypes'

export default [

  // Text Align
  new Plugin(
    'align',
    ({options, prop}) => {
      if (options.supportsText) {
        return {textAlign: prop}
      }
    },
    {propType: PropTypes.oneOf(['left', 'center', 'right'])}
  ),

  // Bold, does not currently support multiple weight, boolean only
  new Plugin(
    'bold',
    ({options, registry, propName}) => {
      if (options.supportsText) {
        if (registry.has(propName)) {
          return registry.resolve(propName)
        }
        return {fontWeight: 'bold'}
      }
    },
    {propType: PropTypes.bool}
  )
]
