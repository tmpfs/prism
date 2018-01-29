## Plugins

Plugins allow you to change the behaviour of the default property processing, see [style properties](#style-properties) for the list of default properties.

Each property has a corresponding plugin function and other functionality which does not correspond to a property are also defined as plugins. For example, the `mapPropsToStyle` logic is a plugin so that it can be disabled.

Plugins are defined as an array of plugin objects, when the plugin is a function it is deemed to be a global like `mapPropsToStyle`:

```javascript
const plugins = [
  ({props, styleSheet}) => {
    // Global plugins are not property-specific
    // and do not need to define a propType
  }
]
```
