## Plugins

Plugins allow you to change the default behaviour, see [style properties](#style-properties) for the list of default properties and [configuration](#configuration) for how to register plugins.

A plugin is defined as an array that specifies the plugin name, function handler and optionally a third `propType` field.

### Global Plugins

Global plugins such as the `mapPropsToStyle` and `colorNames` plugins are not property-specific so they omit the `propType`:

```javascript
const plugins = [
  [
    'globalPlugin',
    ({props, styleSheet}) => { /* ... */ }
  ]
]
```

### Property Plugins

If your plugin is for a property you should specify a `propType` to use so the property will be validated, for example:

```javascript
import PropTypes from 'prop-types'
const plugins = [
  [
    'transform',
    ({props, styleSheet}) => {
      const {transform} = props
      if (transform) {
        // Return some transform specific style declarations
      }
    }
    PropTypes.object
  ]
]
```
