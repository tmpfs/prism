## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the library configuration.

When no configuration object is given support for the `className` property is enabled and the global plugins to support mapping properties to styles.

This is a sensible minimal default configuration which will be sufficient for many applications and creates the least chance of conflict if you want to integrate Prism with an existing application.


* `className` use the plugin that processes the `className` property, default is `true`.
* `mapPropsToStyle` use the `mapPropsToStyle` plugin, default is `true`.
* `extendedProperties` enables the extended style property plugins.
* `experimentalPlugins` enables the experimental plugins.
* `colorNames` enables the color names preprocessor.
* `textTransform` enables the text transform preprocessor (requires experimental plugins).
* `additionalPlugins` array of plugin definitions to append to the system plugins.
* `disabledPlugins` array of string plugin names to disable.
* `plugins` array of plugin definitions to use, overrides the system plugins.
* `debug` print configured plugins.

For example to use the [extended style properties](#extended-style-properties) and enable color name lookup:

```javascript
Prism.configure(registry, {extendedProperties: true, colorNames: true})
```

To use `textTransform` you need to enable `experimentalPlugins`:

```javascript
Prism.configure(
  registry,
  {
    experimentalPlugins: true,
    textTransform: true
  }
)
```

### Plugin Configuration

#### plugins

Use your own `plugins` array when you want to specify a list of plugins to use *before* any plugins enabled using the configuration flags, you can disable `className` and `mapPropsToStyle` etc to use only the custom plugins you specify.

#### additionalPlugins

Use the `additionalPlugins` option to add custom functionality to all your styled components, see [plugins](#plugins) for information on defining custom plugins.

```javascript
Prism.configure(
  registry,
  {
    extendedProperties: true,
    additionalPlugins: [
      [
        'customGlobalPlugin',
        ({props, styleSheet}) => {
          // Do something cool
        }
      ]
    ]
  }
)
```

#### disabledPlugins

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
