## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the plugins.

* `extendedProperties` boolean that enables the extended style property plugins.
* `disabled` boolean that disables all default plugins.
* `additionalPlugins` array of plugin definitions to append to the default plugins.
* `disabledPlugins` array of string plugin names to disable.
* `plugins` array of plugin definitions to use, overrides the default plugins.

Note that support for the `style` property cannot be disabled, it is not handled by a plugin.

### Default Plugins

When no configuration object is given the following plugins are enabled:

* `mapPropsToStyle`
* `colorNames`
* `className`

### Extended Plugins

To enable the [extended style properties](#extended-style-properties) use `extendedProperties`.

```javascript
Prism.configure(registry, {extendedProperties: true})
```

### Custom Plugins

Use the `additionalPlugins` option to add custom functionality to all your styled components.

See [plugins](#plugins) for information on defining custom plugins.

### Inline Styles Only

You can disable all plugins and inline `style` attributes are still processed and available to your component:

```javascript
Prism.configure(registry, {disabled: true})
```

### Remove Plugins

You may want to remove plugins you don't need or if you find a property name collision:

```javascript
Prism.configure(registry, {disabledPlugins: ['direction', 'wrap']})
```
