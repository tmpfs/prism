import Plugin from './Plugin'

import util from './util'
const {isObject} = util

export default new Plugin(
  'defaultProps',
  ({definition, attrName}) => {
    //console.log('defaultProps plugin: ' + attrName)
    const {NewType} = definition
    const defaultProps = NewType.inheritedDefaultProps
    console.log(defaultProps)
    //console.log(Object.keys(Type))
    //console.log(defaultProps)
    if (defaultProps && isObject(defaultProps[attrName])) {
      //console.log('Running default props...')
      return defaultProps[attrName]
    }
  }
)
