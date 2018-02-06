import {Rule} from './Processor'

// TODO: move this to prism-components
export default new Rule(
  'tintColor',
  ({move, props, propName, propValue, colors}) => {
    // Ensure we respect a property override
    if (props && props[propName]) {
      propValue = props[propName]
    }
    //propValue = colors[propValue] || propValue
    // Extract to prop, helps with ActivityIndicator
    //move(propValue, null, true)
  },
  ['tintColor'],
  true
)
