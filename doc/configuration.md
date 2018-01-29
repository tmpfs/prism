## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the plugins.

* `disabled` boolean that when `true` disables all default plugins.
* `disabledPlugins` array of string plugin names to disable.
* `plugins` array of plugin definitions to use, overrides the built in plugins.

### Inline Styles Only

You can disable all plugins and inline `style` attributes are still processed and available to your component:

```javascript
Prism.configure(registry, {disabled: true})
```

### Remove Default Plugins

You may want to remove plugins you don't need or if you find a property name collision:

```javascript
Prism.configure(registry, {disabledPlugins: ['direction', 'wrap']})
```
