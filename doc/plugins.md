### Plugins

Plugins allow you to change the default behaviour.

#### Creating Plugins

To create a plugin you pass a plugin name, handler function and plugin options:

```javascript
new Plugin(
  'pluginName',
  () => { /* ... */ },
  {/* options */}
)
```

##### Property Plugins

If your plugin is for a property you should use the `propType` option:

```javascript
import PropTypes from 'prop-types'
const plugins = [
  new Plugin(
    'transform',
    ({prop, propName, styleSheet, colors}) => {
      // Return some transform specific style declarations
    },
    {propType: PropTypes.object}
  )
]
```

These plugins will only execute when the property is defined on the component.

See [extendedPropertyPlugins.js](https://github.com/fika-community/prism/blob/master/src/extendedPropertyPlugins.js) for several examples.

##### Global Plugins

Global plugins are those without a `propType` option:

```javascript
new Plugin(
  'globalPlugin',
  ({props, styleSheet}) => { /* ... */ },
  {requireOptions: true}
)
```

These plugins provide the ability to modify the computed style sheets without being triggered by the presence of a property.

They can provide options that filter when they are executed. For example `requireOptions` means *only run this plugin for components that have declared a corresponding options object*.

For the example above a component needs to explicitly enable the plugin:

```javascript
static styleOptions: {
  // Trigger execution of the plugin for this component
  globalPlugin: {}
}
```

#### Plugin Configuration

Use these configuration options to control plugins:

* `additionalPlugins` array of plugin definitions to append to the system plugins.
* `disabledPlugins` array of string plugin names to disable.
* `plugins` array of plugin definitions to use, overrides the system plugins.

##### plugins

Use your own `plugins` array when you want to specify a list of plugins to use *before* any plugins enabled using the configuration flags, you can disable `className` and `mapPropsToStyle` etc to use only the custom plugins you specify.

##### additionalPlugins

Use the `additionalPlugins` option to add custom functionality to all your styled components, see [plugins](#plugins) for information on defining custom plugins.

```javascript
Prism.configure(
  registry,
  {
    extendedProperties: true,
    additionalPlugins: [
      new Plugin(
        'customGlobalPlugin',
        ({props, styleSheet}) => {
          // Do something cool
        }
      )
    ]
  }
)
```

##### disabledPlugins

You may want to remove plugins you don't need or if you find a property name collision:

```javascript
Prism.configure(
  registry,
  {
    extendedProperties: true,
    disabledPlugins: ['position', 'wrap']
  }
)
```

The `disabledPlugins` option is processed after `plugins` and `additionalPlugins` so you may use this to disable your custom plugins. If you give a plugin name that does not exist it is ignored.
