import {Rule} from './Processor'

export default new Rule(
  'tintColor',
  ({move, propValue}) => {
    // Extract to prop, helps with ActivityIndicator
    move(propValue, null, true)
  },
  ['tintColor']
)
