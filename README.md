<h1 align="center">Prism</h1>
<p align="center">Minimal, idiomatic style management for React Native.</p>
<p align="center">
  <img width="256" height="256" src="https://raw.githubusercontent.com/fika-community/prism/master/prism.png" />
</p>

---

- [Installation](#installation)
- [Synopsis](#synopsis)
- [Getting Started](#getting-started)
  - [Defining Styles](#defining-styles)
    - [Colors](#colors)
    - [Fonts](#fonts)
    - [Styles](#styles)
  - [Configure Prism](#configure-prism)
  - [Defining Styled Components](#defining-styled-components)
- [Components](#components)
  - [Mapping Properties To Styles](#mapping-properties-to-styles)
    - [mapPropsToStyle](#mappropstostyle)
    - [mapPropsToStyleState](#mappropstostylestate)
    - [mapPropsToComponent](#mappropstocomponent)
    - [mapStyleToProp](#mapstyletoprop)
  - [Property Type Validation](#property-type-validation)
  - [Namespaces](#namespaces)
  - [Requirements](#requirements)
  - [Initializing Styles](#initializing-styles)
    - [registry](#registry)
    - [defaultProps](#defaultprops)
    - [className](#classname)
  - [Color Names](#color-names)
  - [Flat Styles](#flat-styles)
- [Configuration](#configuration)
  - [Default Plugins](#default-plugins)
  - [Extended Plugins](#extended-plugins)
  - [Custom Plugins](#custom-plugins)
  - [Disable System Plugins](#disable-system-plugins)
  - [Remove Plugins](#remove-plugins)
- [Plugins](#plugins)
  - [Global Plugins](#global-plugins)
  - [Property Plugins](#property-plugins)
- [Cascade](#cascade)
- [Properties](#properties)
  - [Style Properties](#style-properties)
    - [style](#style)
    - [className](#classname-1)
  - [Extended Style Properties](#extended-style-properties)
    - [flex](#flex)
    - [row](#row)
    - [wrap](#wrap)
    - [justify](#justify)
    - [padding](#padding)
    - [margin](#margin)
    - [position](#position)
    - [background](#background)
    - [border](#border)
    - [radius](#radius)
  - [Experimental Properties](#experimental-properties)
    - [font](#font)
    - [text](#text)
- [License](#license)

---

## Installation

Use your preferred package manager for installation.

```
npm i --save react-native-prism
yarn add react-native-prism
```

## Synopsis

Prism is a library that returns a HOC (Higher Order Component) which exposes access to a style registry containing user-defined colors, fonts and styles.

It provides a simple yet flexible mechanism for mapping properties to styles and finding style declarations in the registry.

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques that will leave your JSX clean and serene allowing you to more easily focus on your application's state and logic.

If you want to migrate an existing application you should start with [Prism Primitives][] which provides a drop-in replacement for the RN visual components. See [Prism Components][] for some *slightly* more advanced components; if you want to see a running application clone and run the RN app in the [Prism Components][] repository.

## Getting Started

### Defining Styles

To configure your application stylesheets first create some colors, fonts and styles.

#### Colors

Colors are a map from color name to string value. Use of custom color names is optional but it can help make your styles more semantic.

#### Fonts

Fonts are a map from font identifier to string font family name.

```javascript
{regular: 'WorkSans-Regular'}
```

Because Android uses the file name and iOS uses the PostScript name the easiest thing to do is name your fonts *using the PostScript* name.

If you need a conditional use a function which will be passed the value of `Platform.OS` and should return a platform-specific font family name.

```javascript
{
  regular: (os) => {
    return os === 'ios' ? 'WorkSans-Regular' : 'worksans'
  }
}
```

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts.

File: [theme.js](https://github.com/fika-community/prism/blob/master/doc/examples/theme.js)

```javascript
export default {
  colors: {
    cream: '#fdfbdf',
    muted: '#9a9a9a'
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      Label: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.cream
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
```

### Configure Prism

Now you can create a style registry and instruct your components to use it:

File: [App.js](https://github.com/fika-community/prism/blob/master/doc/examples/App.js)

```javascript
import React, {Component} from 'react';
import {Prism, StyleRegistry} from 'react-native-prism'
import theme from './theme'
import Label from './Label'

const registry = new StyleRegistry()
registry.addTheme(theme)
Prism.configure(
  registry,
  {
    debug: true,
    extendedProperties: true,
    experimentalPlugins: true
  }
)
export default class Application extends Component {
  render () {
    return (
      <Label
        background='steelblue'
        color='white'
        bold
        align='center'
        text={{transform: 'capitalize'}}
        padding={15}>
        Prism example application
      </Label>
    )
  }
}
```

With the `extendedProperties` option all the built in and extended [style properties](#style-properties) are available.

### Defining Styled Components

To create a styled component you just need to pass the component class to the `Prism` function which will return the HOC component.

```javascript
import {View} from 'react-native'
import {Prism} from 'react-native-prism'
export default Prism(View)
```

Here is a working example for the application shown above.

File: [Label.js](https://github.com/fika-community/prism/blob/master/doc/examples/Label.js)

```javascript
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from 'react-native-prism'

class Label extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      supportsText: true,
      supportsTextTransform: true,
      mapPropsToStyle: {
        align: ({prop, styleSheet}) => {
          return {textAlign: prop}
        },
        bold: ({prop, styleSheet}) => {
          if (styleSheet.bold !== undefined) {
            return styleSheet.bold
          }
          return {fontWeight: 'bold'}
        }
      }
    }
  }

  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(Label)
```

The default styles for a component are extracted by class name so the stylesheet we created earlier already provides styles for our new component!

## Components

### Mapping Properties To Styles

Components have varied needs for mapping properties to style declarations so the library provides several ways to map properties depending upon the requirement.

Each of the mapping options may be either a function or object, when it is a function it is passed the style registry and should return an object.

You may declare these options as `static` fields on your component or within the object returned by `styleOptions`, when using the `static` declaration if often makes more sense to use the function notation so you can access the style registry.

```javascript
static mapPropsToStyle = {
  bold: ({styleSheet}) => {
    return styleSheet.bold
  }
}
```

Or using `styleOptions`:

```javascript
static styleOptions = ({styleSheet}) => {
  return {
    mapPropsToStyle: {
      bold: () => styleSheet.bold
    }
  }
}
```

#### mapPropsToStyle

Use `mapPropsToStyle` when you want presence of a property to trigger inclusion of styles into the final computed style. Each object key maps to a property name and the corresponding function is called when the property is defined on the component.

You have access to all the properties so you can apply styles conditionally based on other properties:

```javascript
static styleOptions = () => {
  return {
    mapPropsToStyle: {
      space: ({prop, props}) => {
        const {horizontal} = props
        const styleProp = horizontal ? 'marginRight' : 'marginBottom'
        const style = {}
        style[styleProp] = prop
        return style
      }
    }
  }
}
```

Functions declared in this way have access to the style registry (`styleSheet`, `colors` etc) the `props`, current `prop` and the computed component `options`. Functions should return a style object or array of objects, to take no action return `undefined`.

#### mapPropsToStyleState

Use `mapPropsToStyleState` to change the computed style based on a condition with support for modifying the style declaration name using the familiar `a:hover` syntax.

For a component called `Notice`:

```javascript
static mapPropsToStyleState = ({props}) => {
  if (props.error) {
    return 'error'
  }
}
```

Would result in including the class declaration lookup for `Notice:error` (the `Notice` style is also included for property inheritance):

```javascript
{
  'Notice:error': {
    backgroundColor: 'red',
    color: 'white'
  }
}
```

You can also return a style object, array of style objects or a compiled style declaration.

This can be an easy way to trigger style variations that are resolved from the style sheet based on a property value. For example, if you have a `size` property that accepts `small|medium|large` you can do:

```javascript
static mapPropsToStyleState = ({props}) => {
  if (props.size) {
    return props.size
  }
}
```

To resolve a style sheet for the value of `size`, eg: `Notice:small`, `Notice:medium` or `Notice:large`.

#### mapPropsToComponent

When you start creating composite components it becomes very useful to route properties to style objects for the child components, use `mapPropsToComponent` to define styles for these child components.

Take the case of a `Panel` component with child components for the header and body.

You can declare child computed styles with:

```javascript
static mapPropsToComponent = {
  headerStyle: [],
  bodyStyle: []
}
```

At it's simplest level the empty array just declares that your component requires some child styles.

Your render can then pass the computed styles to child components:

```javascript
render () {
  const {
    style,
    headerStyle,
    bodyStyle,
    header
  } = this.props

  return (
    <View style={style}>
      <View style={headerStyle}>
        {header}
      </View>
      <View style={bodyStyle}>
        {this.props.children}
      </View>
    </View>
  )
}
```

The immediate benefit is that you can now declare styles using dot notation for the child components, for example:

```javascript
'Panel': {
  flex: 1
},
'Panel.Header': {
  backgroundColor: 'blue',
  padding: 5
},
'Panel.Body': {
  backgroundColor: 'red',
  padding: 10
}
```

But you can also use this functionality to route properties into the child style object:

```javascript
static mapPropsToComponent = {
  headerStyle: [{space: 'marginBottom'}],
  bodyStyle: ['background']
}
```

```javascript
// Set distance between header and body
// and the background color of the body
<Panel space={10} background='blue' />
```

Often you want to pass a `color` property to a component which is not a text component and route it to the components that handle text:

```javascript
static mapPropsToComponent = {
  // Maps color -> labelStyle.color and space -> labelStyle.marginTop
  labelStyle: ['color', {space: 'marginTop'}],
  imageStyle: ['width', 'height']
}
```

When using `mapPropsToComponent` there is no need to declare the properties in your component `propTypes`, they are automatically declared as we know ahead of time they should have the same property type as `style`.

For style declaration lookup the child component name is determined by the property name with any `Style` suffix removed and the first character converted to uppercase.

If the component is namespaced use the fully qualified name, eg: `com.prism.ui.Panel.Header`.

#### mapStyleToProp

Use `mapStyleToProp` when you want to delete a style property from the computed style and assign it to a property.

This is useful when a child component expects a property but it is better suited to being in a style declaration. For example, the RN `ActivityIndicator` component accepts a `tintColor` property and it cannot be assigned as a style.

Assuming a style like:

```css
ActivityIndicator: {
  tintColor: '#ff6600'
}
```

To map the style to a property:

```javascript
  static styleOptions = () => {
    return {
      mapStyleToProp: {
        tintColor: true
      }
    }
  }
```

Your component will then receive a `tintColor` property from the style declaration and the declaration will be removed.

If you want to map to an alternative property name use a string value:

```javascript
mapStyleToProp: {
  tintColor: 'highlightColor'
}
```

The fact that the style declaration is removed is very useful for dealing with *invariants*. The RN `StyleSheet` will validate your style declarations so this feature allows you to declare non-standard style declaration names (eg: `textTransform`) and have your style sheets validate correctly.

### Property Type Validation

It is important to know that the `propTypes` and `defaultProps` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

If you need it the `Prism.propTypes` field exposes the system property types.

### Namespaces

The `Prism` function accepts a second argument which can be used to specify a namespace for your component. This is useful (and recommended) when designing reusable component sets.

```javascript
export default Prism(Label, 'com.fika.text')
```

Now the default component style declaration name is `com.fika.text.Label` and a consumer needs to declare the style using the fully qualified name:

```javascript
export default ({colors, fonts}) => {
  return {
    'com.fika.text.Label': {
      color: colors.orange
    }
  }
}
```

### Requirements

Sometimes a component or library of components needs certain conditions to be met to be able to work correctly.

You may pass a *third* argument to `Prism()` which is a function passed the `registry` and `config` and can be used to validate the component requirements.

Here is an example from the `com.prism.ui` components:

```javascript
const requirements = ({config}) => {
  if (config.extendedProperties !== true) {
    return `extendedProperties must be set in config ` +
      `to use the ${Namespace} component library`
  }
}

export default Prism(Layout, Namespace, requirements)
```

If the component requirements are not met you can throw an error or return an error or a string. When a string is returned it is wrapped in an error and thrown.

Note that you can use this technique to validate style declarations exist, for example:

```javascript
const requirements = ({registry}) => {
  const {styleSheet} = registry
  if (!styleSheet.bold) {
    return `bold style declaration is required`
  }
}
```

If you want to specify requirements for a component that does not have a namespace pass the empty string for the `namespace` argument.

### Initializing Styles

#### registry

Component libraries of any size will find it easiest to supply an entire style registry which is merged with the user-supplied registry.

```javascript
import {StyleRegistry} from 'react-native-prism'
const registry = new StyleRegistry()
// Configure the colors, fonts and styles for your components
static styleOptions = () => {
  return {
    registry: registry
  }
}
```

#### defaultProps

When you need to specify the absolute minimum styles for your component you can use `defaultProps`:

```javascript
static defaultProps = {
  style: {
    backgroundColor: 'red'
  },
  labelStyle: {
    color: 'white'
  }
}
```

#### className

Sometimes you may wish to change the class name used when looking up default styles for a component:

```javascript
class TouchButton extends Components {
  static styleOptions = () => {
    return {
      className: 'Button'
    }
  }
}
```

Will resolve to a `Button` style sheet rather than the default `TouchButton`.

### Color Names

Styles are much easier to change if we can refer to our custom colors by name.

Components can declare their own color names by defining a style registry in the component style options.

The bundled plugins handle color name lookup but if you are writing your own plugins and want to support color name lookup for color values you need to test the `colors` map:

```javascript
[
  ({prop, colors}) => {
    return {backgroundColor: colors[prop] || prop}
  },
  {bulletColor: PropTypes.string}
]
```

### Flat Styles

Sometimes you are wrapping a third-party component and want to proxy the `style` object to the component but it does not accept an array for the `style` property; it enforces an object only property type.

The computed `style` property passed to your component is guaranteed to be an array; here however we need it to be an object. To do so you can use the `flat` option:

```javascript
static styleOptions = () => {
  return {
    flat: true
  }
}
```

Now you can just proxy it to the child component knowing it will be an object:

```javascript
render () {
  const {style} = this.props
  return {
    <NonIdiomaticComponent style={style} />
  }
}
```

## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the plugins.

* `plugins` array of plugin definitions to use, overrides the system plugins.
* `extendedProperties` boolean that enables the extended style property plugins.
* `additionalPlugins` array of plugin definitions to append to the system plugins.
* `disabledPlugins` array of string plugin names to disable.
* `debug` print configured plugins.

Note that support for the `style` property and `mapPropsToStyleObject` cannot be disabled, they are not handled by plugins.

### Default Plugins

When no configuration object is given support for the `className` property is enabled, a `colorNames` plugin to translate from custom named colors and the global plugins to support mapping properties to styles.

This is a sensible minimal default configuration which will be sufficient for many applications and creates the least chance of conflict if you want to integrate Prism with an existing application.

### Extended Plugins

To enable the [extended style properties](#extended-style-properties) use `extendedProperties`.

```javascript
Prism.configure(registry, {extendedProperties: true})
```

### Custom Plugins

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

### Disable System Plugins

You can disable all system plugins with an empty array, inline `style` attributes are still processed and available to your component:

```javascript
Prism.configure(registry, {plugins: []})
```

### Remove Plugins

You may want to remove plugins you don't need or if you find a property name collision:

```javascript
Prism.configure(
  registry,
  {
    extendedProperties: true,
    disabledPlugins: ['direction', 'wrap']
  }
)
```

The `disabledPlugins` option is processed after `plugins` and `additionalPlugins` so you may use this to disable your custom plugins. If you give a plugin name that does not exist it is ignored.

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

## Cascade

It is useful to know the order in which styles are computed.

1. Default styles are applied.
2. Global plugins are executed.
3. Property plugins are executed.
4. Inline styles are applied.

Default styles start with any values in `defaultProps` followed by an array specified using `defaultStyles` and then a style declaration inferred using the component class name, eg: `Label`.

If the component is namespaced it is prefixed with the namespace and a period, eg: `com.fika.text.Label`.

If the component is using [mapPropsToStyleObject](#mapPropsToStyleObject) and the target property is not the default `style` property then a child component class name is inferred and appended, eg: `com.fika.ImageLabel.Label`.

If no style declaration matches the computed class name no action is taken.

Global plugins in the default configuration handle the `className` property first before processing plugins that map properties to styles, so your component properties overwrite those in style declarations referenced by `className`.

Property plugins enabled with the `extendedProperties` option (or custom plugins) are executed next so they override property mappings and `className`.

Finally any styles given in the `style` property take precedence.

## Properties

### Style Properties

By default plugins are enabled that expose the following properties on all styled components.

#### style

`Array | Object`

Inline styles for the component.

#### className

`String | Array<String>`

Assign stylesheets to the component. When a string is given separate stylesheet names should be delimited with whitespace.

### Extended Style Properties

As a convenience the `extendedProperties` allow for rapidly mocking layouts with a variety of convenient shortcuts for common style properties.

Enable the `extendedProperties` option to use these properties.

Some extended properties require components *opt-in* using `styleOptions`, for example to receive the `color` property:

```javascript
static styleOptions = () => {
  return {
    supportsText: true
  }
}
```

* `supportsText`: Component can receive text style props.
* `supportsTextTransform`: Component allows text transformations.
* `supportsDimension`: Component can receive `width` and `height`.

#### flex

`Number | Boolean | Object`

Shorthand for `flex` properties. A number is assigned directly to the `flex` style property, boolean is coerced to a number (yields zero or one).

Object notation supports the `grow`, `row` and `wrap` fields:

```
{
  grow: 1,
  row: true,
  wrap: true
}
```

The `row` boolean sets `flexDirection`, `wrap` sets `flexWrap` and `grow` sets the `flex` property.

#### row

`Boolean`

Set the `flexDirection` style property to `row`.

#### wrap

`Boolean`

Set the `flexWrap` style property.

#### justify

`Enum<String> (center|start|end|between|around)`

Set the `justifyContent` style property, note that the `flex-` prefixes are omitted.

#### padding

`Number | Object | Array`

Sets padding properties, a number sets all edges to be equal.

Arrays are a shorthand for setting vertical and horizontal values and take the form: `[vertical, horizontal]`.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
[5,10]
```

#### margin

`Number | Object | Array`

Sets margin properties, a number sets all edges to be equal.

Arrays are a shorthand for setting vertical and horizontal values and take the form: `[vertical, horizontal]`.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
[5,10]
```

#### position

`Object`

Makes a component absolutely positioned (relative to the parent as is the RN way) and sets the style properties to the given values.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
```

#### background

`String`

Set the `backgroundColor` style property.

#### border

`String | Array | Object`

Enables a border for the component. When a string is given `borderColor` is set and a default `borderWidth` is used.

When an array is given it takes the form `[width, color]`.

```javascript
{
  color: 'red',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}
```

Note that not all RN components will set borders as expected when different widths are given for each side, if you experience problems with this syntax ensure the style is applied to a `View` rather than `Image` etc.

#### radius

`Number | Object`

Sets border radius style properties.

```javascript
{
  top: {left: 0, right: 0},
  bottom: {left: 0, right: 0}
}
```

### Experimental Properties

When the `experimentalPlugins` option is given plugins that handle these properties are configured.

These properties are considered experimental as they make use of `context` to propagate values to child components and the behaviour is undefined when components wrapped by `Prism()` make use of the `context`.

#### font

The `font` property provides a convenient shortcut for all the [Text Style Props][].

Only `Text` and `TextInput` components can accept these style properties so components that wish to recieve them in their computed stylesheet must specify the `supportsText` option.

This property is propagated via the context which allows us to declare text styles on parent elements that do not support text and override them in child components.

A simple declaration might look like:

```html
<Layout font={{size: 'large', color: 'red'}}>
  <Layout>
    <Label>Red text</Label>
    <Label font={{color: 'green'}}>
      Font style properties combined with those inherited from the grandparent
    </Label>
  </Layout>
</Layout>
```

The shape of the font object is described in [PropTypes.js](https://github.com/fika-community/prism/blob/master/src/PropTypes.js).

#### text

The `text` property provides a means to apply text transformations to components.

This property is distinct from the `font` property as it's behaviour is very different, instead of injecting values into a style sheet it *modifies a component's children*.

It is an object with a single `transform` property:

```javascript
{transform: 'lowercase|uppercase|capitalize'}
```

Example usage:

```html
<List space={5} text={{transform: 'uppercase'}}>
  <List space={10}>
    <Paragraph>
      This is some uppercase text <Label text={{transform: 'lowercase'}}>including some lowercase text in a Label</Label> in a paragraph. <Label text={{transform: 'capitalize'}}>We can capitalize too</Label>.
    </Paragraph>
  </List>
</List>
```

Components can also support `textTransform` in their style sheets but note that for child components the property will not be `text` but `childNameText` so that components can direct text transformations accordingly.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on February 4, 2018

[prism primitives]: https://github.com/fika-community/prism-primitives
[prism components]: https://github.com/fika-community/prism-components
[text style props]: https://facebook.github.io/react-native/docs/text-style-props.html

