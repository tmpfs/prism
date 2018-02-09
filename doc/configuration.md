## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the library configuration. These are the common configuration options, some more advanced options are shown in [plugin configuration](#plugin-configuration).

* `defaultProps` use the [defaultProps](/src/defaultProps.js) plugin, default is `true`.
* `defaultStyleRule` use the [defaultStyleRule](/src/defaultStyleRule.js) plugin, default is `true`.
* `mapPropsToStyle` use the [mapPropsToStyle](/src/mapPropsToStyle.js) plugin, default is `true`.
* `mapStyleToProps` use the [mapStyleToProps](/src/mapStyleToProps.js) plugin, default is `true`.
* `className` use the property plugin for [className](/src/className.js), default is `true`.
* `extendedProperties` enables the [extended property plugins](/src/extendedPropertyPlugins.js).
* `fontProperties` enables the [font property plugins](/src/fontProperties.js).
* `experimentalPlugins` enables the [experimental plugins](/src/experimentalPlugins.js).
* `colorNames` enables the [color names](/src/colorNames.js) processor.
* `textTransform` enables the text transform support (requires experimental plugins).
* `withState` enables [component state](#component-state) support.
* `pure` advanced option, see [pure mode](#pure-mode).
* `debug` print information at boot, default value is `__DEV__`.

When no configuration object is given support for the `className` property is enabled and the global plugins to support mapping properties to styles and resolving default styles.

This is a sensible minimal default configuration which will be sufficient for many applications and creates the least chance of conflict if you want to integrate Prism with an existing application.

To use the [extended style properties](#extended-style-properties) and enable color name lookup:

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

File: [configuration.js](/src/configuration.js)

<? @source {javascript} ../src/configuration.js ?>
