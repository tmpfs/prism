import Plugin from './Plugin'

import util from './util'
const {isObject} = util

export default new Plugin(
  'defaultProps',
  ({definition, attrName}) => {
    const {NewType} = definition
    const defaultProps = NewType.inheritedDefaultProps || {}
    if (defaultProps && isObject(defaultProps[attrName])) {
      console.log('defaultProps: ' + NewType.displayName)
      return defaultProps[attrName]
    }
  }
)
