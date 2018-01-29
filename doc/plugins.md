## Plugins

Plugins allow you to change the default behaviour, see [style properties](#style-properties) for the list of default properties and [configuration](#configuration) for how to register plugins.

### Global Plugins

Global plugins such as `mapPropsToStyle` are defined by string name followed by plugin implementation:

```javascript
const plugins = [
  [
    'globalPlugin',
    ({props, styleSheet}) => { /* ... */ }
  ]
]
```

### Property Plugins

If your plugin is for a property you should specify the implementation followed by the `propType` to use:

```javascript
import PropTypes from 'prop-types'
const plugins = [
  [
    ({prop, propName, styleSheet, colors}) => {
      // Return some transform specific style declarations
    },
    {transform: PropTypes.object}
  ]
]
```
