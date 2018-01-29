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
  - [Create Style Registry](#create-style-registry)
  - [Defining Styled Components](#defining-styled-components)
- [Components](#components)
  - [Mapping Properties To Styles](#mapping-properties-to-styles)
  - [Property Type Access](#property-type-access)
  - [Component Options](#component-options)
    - [Default Styles](#default-styles)
    - [Default Style Inheritance](#default-style-inheritance)
  - [Color Names](#color-names)
- [Configuration](#configuration)
  - [Default Plugins](#default-plugins)
  - [Extended Plugins](#extended-plugins)
  - [Custom Plugins](#custom-plugins)
  - [Disable System Plugins](#disable-system-plugins)
  - [Remove Plugins](#remove-plugins)
- [Plugins](#plugins)
  - [Global Plugins](#global-plugins)
  - [Property Plugins](#property-plugins)
- [Properties](#properties)
  - [Style Properties](#style-properties)
    - [style](#style)
    - [className](#classname)
  - [Extended Style Properties](#extended-style-properties)
    - [flex](#flex)
    - [direction](#direction)
    - [wrap](#wrap)
    - [justify](#justify)
    - [padding](#padding)
    - [margin](#margin)
    - [position](#position)
    - [background](#background)
    - [border](#border)
    - [radius](#radius)
  - [System Properties](#system-properties)
    - [style](#style-1)
    - [styleSheet](#stylesheet)
    - [styleRegistry](#styleregistry)
    - [styleFlexRow](#styleflexrow)
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

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques in ~600 lines of code.

## Getting Started

### Defining Styles

To configure your application stylesheets first create some colors, fonts and styles.

#### Colors

Colors are a map from color name to value.

```javascript
export default {
  orange: '#ff6600'
}
```

#### Fonts

Fonts are declared as functions that return a different string per platform as iOS uses the PostScript name and Android uses the file name.

Each font function is passed the value of `Platform.OS`.

```javascript
export default {
  regular: (os) => {
    return os === 'ios' ? 'WorkSans-Regular' : 'worksans'
  }
}
```

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts so this signature is common:

```javascript
export default ({colors, fonts}) => {
  return {
    Label: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.orange
    }
  }
}
```

### Create Style Registry

Now you can create a registry for your style definitions and instruct your components to use the registry:

```javascript
// Import all your routes, views or components

import {Prism, StyleRegistry} from 'react-native-prism'
import Colors from './Colors'
import Fonts from './Fonts'
import StyleSheet from './StyleSheet'

// Create the style registry
const registry = new StyleRegistry()
registry.addColors(Colors)
registry.addFonts(Fonts)
registry.addStyleSheet(StyleSheet)

// Use this registry for styled components and
// enable the extended properties (padding, margin etc)
Prism.configure(registry, {extendedProperties: true})

// Initialize your application
```

### Defining Styled Components

To create a styled component you just need to pass the component class to the `Prism` function which will return a HOC wrapper.

```javascript
import React, {Component} from 'react'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
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

Then you can use all the built in (and extended) [style properties](#style-properties), for example:

```html
  <Label
    padding={5}
    margin={[10, 20]}
    style={{color: 'red'}}>Text</Label>
```

The default styles for a component are extracted by class name so the stylesheet we created earlier already provides styles for our new component!

It is important to know that the `propTypes` and `defaultProps` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

## Components

### Mapping Properties To Styles

It can be very convenient to map properties to stylesheets, this is achieved using `mapPropsToStyle`. Functions declared in `mapPropsToStyles` *must* return either a compiled style declaration, plain object or undefined when no action should be taken.

For example to return a declaration from the compiled stylesheet:

```javascript
static propTypes = {
  center: PropTypes.bool
}
static mapPropsToStyle = {
  center: ({prop, styleSheet}) => {
    if (prop) {
      return styleSheet.textCenter
    }
  }
}
```

Or if you prefer you can return a plain object of style properties:

```javascript
static mapPropsToStyle = {
  center: ({prop, styleSheet}) => {
    if (prop) {
      return {textAlign: 'center'}
    }
  }
}
```

It is recommended to access pre-compiled stylesheets wherever possible.

You have access to all the properties so you can apply styles conditionally based on other properties:

```javascript
static propTypes = {
  space: PropTypes.number,
  horizontal: PropTypes.bool
}
static mapPropsToStyle = {
  space: ({prop, props}) => {
    if (prop) {
      const {horizontal} = props
      const styleProp = horizontal ? 'marginRight' : 'marginBottom'
      const style = {}
      style[styleProp] = prop
      return style
    }
  }
}
```

### Property Type Access

Sometimes you have a property that you wish to pass to a child component that should conform to one of the built in property types.

The `Prism.propTypes` field exposes the underlying configured property types.

This is common when a component wraps several fixed child components.

```javascript
import React, {Component} from 'react'
import {Image, Text, View} from 'react-native'
import {Prism} from 'react-native-prism'

class ImageLabel extends Component {

  static propTypes = {
    // Make sure our properties are validated correctly
    imageStyle: Prism.propTypes.style,
    labelStyle: Prism.propTypes.style
  }

  render () {
    const {style, imageStyle, labelStyle} = this.props
    return (
      <View style={style}>
        <Image style={imageStyle} {...this.props} />
        <Text style={labelStyle}>{this.props.children}</Text>
      </View>
    )
  }
}
export default Prism(ImageLabel)
```

### Component Options

Components can declare processing options at a class level by declaring a static `styleOptions` function.

#### Default Styles

You can use `styleOptions` to override the default style behaviour (looking up a style declaration by class name) and supply alternative default styles.

```javascript
static styleOptions = ({styleSheet}) => {
  return {
    defaultStyles: [styleSheet.textCenter]
  }
}
```

Or if you want to compile a style declaration:

```javascript
static styleOptions = ({compile}) => {
  return {
    defaultStyles: [compile{{textAlign: 'center'}}]
  }
}
```

The entire style registry is passed so you can access `colors` and `fonts` too if required.

#### Default Style Inheritance

Sometimes you may wish to distribute a collection of components intended to be reusable, in this case you may expect the consumer to declare the class level style for the component but wish to provide some default styles *before* the class level style is applied.

To do so you can use the `inherit` option which will use the supplied `defaultStyles` array and append a class level style definition (eg: `Label`) when available.

```javascript
static styleOptions = ({compile}) => {
  return {
    inherit: true,
    defaultStyles: [compile{{textAlign: 'center'}}]
  }
}
```

You can use `defaultStyles` to create simple inheritance patterns that can help to remove duplicate properties in your styles:

```javascript
class BlockQuote extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      inherit: true,
      defaultStyles: [styleSheet.Label, styleSheet.Paragraph]
    }
  }
}
```

### Color Names

Styles are much easier to change if we can refer to our custom colors by name, however this functionality needs to be enabled in your components. The plugin that processes color names is activated by default but it's more efficient if we only process color names at the boundary with the underlying RN components.

Take for example the `color` style property; it only applies to the `Text` related components. So we should enable it for our `Label`. Just add the `colorNames` class option:

```javascript
class Label extends Component {
  static styleOptions = () => {
    return {
      colorNames: true
    }
  }
}
```

Take an `ImageLabel` that wraps an `Image` and `Label`. We would likely want to expose `color` on the parent component and pass it to the `Label`.

Then we can render it like so:

```html
<ImageLabel color='orange' />
```

In this case after the `style` for `ImageLabel` has been computed `color` is still `orange`, only when it is computed in `Label` does it become `#ff6600` *just before* being passed to the underying RN `Text` component.

## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the plugins.

* `plugins` array of plugin definitions to use, overrides the system plugins.
* `extendedProperties` boolean that enables the extended style property plugins.
* `additionalPlugins` array of plugin definitions to append to the system plugins.
* `disabledPlugins` array of string plugin names to disable.

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
    },
    PropTypes.object
  ]
]
```

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

When the `extendedProperties` option is enabled plugins that handle these properties are configured.

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

#### direction

`Enum<String> (row|column)`

Set the `flexDirection` style property.

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

### System Properties

System properties are those passed to the underlying component implementation from the HOC component. They allow access to the colors, fonts and compiled stylesheet.

#### style

`Array`

The computed stylesheet for the component.

#### styleSheet

`Object`

The compiled collection of stylesheets.

#### styleRegistry

`StyleRegistry`

The underlying registry of colors, fonts and stylesheets.

#### styleFlexRow

`Boolean`

Indicates whether the layout direction is horizontal or vertical, can be used by child components to determine the edge for intermediate space.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on January 29, 2018

