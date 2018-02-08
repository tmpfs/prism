## Getting Started

### Defining Styles

To configure your application stylesheets first create a theme with some styles, colors and fonts.

File: [theme.js](/doc/examples/theme.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/theme.js ?>

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts.

#### Colors

Colors are a map from color name to string value. Use of custom color names is optional but it can help make your styles more semantic.

#### Fonts

Fonts are a map from font identifier to string font family name.

```javascript
{regular: 'WorkSans-Regular'}
```

Because Android uses the file name and iOS uses the PostScript name the easiest thing to do is name your fonts *using the PostScript* name.

If you need a platform-specific font family specify an object:

```javascript
{
  regular: {
    ios: 'WorkSans-Regular',
    android: 'worksans'
  }
}
```

### Application Configuration

To configure your application create a style registry with your theme and instruct your components to use it:

File: [App.js](/doc/examples/App.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/App.js ?>

With the `extendedProperties` option all the built in and extended [style properties](#style-properties) are available.

Note that you should `import` all your Prism enabled components *before* calling `configure()`.

