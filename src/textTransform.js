import {Rule} from './Processor'

export default new Rule(
  'textTransform',
  ({move, propValue, colors}) => {
    move(propValue, null, true)
  },
  ['textTransform']
)
