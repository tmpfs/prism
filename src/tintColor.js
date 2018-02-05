import {Rule} from './Processor'

export default new Rule(
  'tintColor',
  ({move, propName, propValue, colors}) => {
    propValue = colors[propValue] || propValue
    // Extract to prop, helps with ActivityIndicator
    move(propValue, null, true)
  },
  ['tintColor'],
  true
)
