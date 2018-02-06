import Plugin from './Plugin'

import util from './util'
const {isObject} = util

export default new Plugin(
  'defaultProps',
  ({definition, attrName}) => {
    //const {Type} = definition
    //const defaultProps = Type.defaultProps || {}
    //if (isObject(defaultProps[attrName])) {
      //console.log('Running default props...')
      //return defaultProps[attrName]
    //}
  }
)
