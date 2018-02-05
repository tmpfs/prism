import {Rule} from './Processor'

export default new Rule(
  'colorNames',
  ({move, propValue, colors}) => {
    if (colors[propValue]) {
      move(colors[propValue])
    }
  },
  ['color', 'backgroundColor', 'borderColor', 'background']
)
