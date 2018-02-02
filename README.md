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
    - [mapPropsToStyle](#mappropstostyle)
    - [mapPropsToStyleObject](#mappropstostyleobject)
  - [Property Type Validation](#property-type-validation)
  - [Namespaces](#namespaces)
  - [Default Styles](#default-styles)
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
- [Cascade](#cascade)
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
- [Bugs](#bugs)
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

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques in ~800 lines of code.

## Getting Started

### Defining Styles

To configure your application stylesheets first create some colors, fonts and styles.

#### Colors

Colors are a map from color name to value.

```javascript
export default {
  cream: '#fdfbdf',
  muted: '#9a9a9a',
  green: '#023926',
  backgroundGreen: '#16a085',
  lightGreen: '#045B1E',
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
    Layout: {
      flex: 1
    },
    Label: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.cream
    },
    ImageLabel: {
      flex: 1,
      alignItems: 'center'
    },

    'ImageLabel.Label': {
      color: colors.muted
    },

    // Utils
    row: {
      flexDirection: 'row'
    },
    error: {
      color: 'red'
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
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from 'react-native-prism'

class Label extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      mapPropsToStyleDecl: () => {
        error: styleSheet.error
      },
      mapPropsToStyleProp: {
        size: 'fontSize',
        align: 'textAlign'
      }
    }
  }

  static propTypes = {
    color: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.number
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

Then you can use all the built in (and extended) [style properties](#style-properties), for example:

```html
  <Label
    padding={5}
    margin={[10, 20]}
    color='muted'>Text</Label>
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

If none of the above options suit your purposes the `mapPropsToStyle` option provides a low-level API for adding styles to the computed style.

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

Functions declared in this way have access to the style registry (`styleSheet`, `colors` etc) the `props`, current `prop` and the computed component `options`.

#### mapPropsToStyleObject

Use `mapPropsToStyleObject` when you need to *pluck* a property and place it in a particular style object. This is a powerful mechanism to ensure that properties are not inadvertently mapped to components that do not support the style property.

Take a component that wraps an `Image` and `Label` in a `View`, the `ImageLabel` component JSX might look something like this:

```html
<View style={style}>
  <Image
    source={source}
    width={width}
    height={height}
    {...imageProps}
    style={imageStyle} />
  <Label
    {...labelProps}
    style={labelStyle}>{this.props.children}</Label>
</View>
```

If you pass a `color` property into the style associated with a `View` you will get an error as it is not supported for that component.

```html
// `color` is not supported for a View style
<ImageLabel color='muted' />
```

Define a `mapPropsToStyleObject` to route the `color` property to the `Label`:

```javascript
static mapPropsToStyleObject = {
  // Maps color -> labelStyle.color and space -> labelStyle.marginTop
  labelStyle: ['color', {space: 'marginTop'}],
  imageStyle: ['width', 'height']
}
```

When using `mapPropsToStyleObject` there is no need to declare the properties in your component `propTypes`, they are automatically declared as we know ahead of time they should have the same property type as `style`.

A powerful feature of mapping properties in this way is that you can now define default styles for the child component with dot notation:

```javascript
export default ({colors, fonts}) => {
  return {
    ImageLabel: {
      flex: 1,
      alignItems: 'center'
    },
    'ImageLabel.Image': {
      borderColor: colors.cream,
      borderWidth: 1
    },
    'ImageLabel.Label': {
      color: colors.muted
    }
  }
}
```

The child component name is determined by the property name with any `Style` suffix removed and the first character converted to uppercase.

If the component is namespaced use the fully qualified name, eg: `com.fika.ImageLabel.Label`.

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

### Default Styles

Components can specify options at a class level by declaring a static `styleOptions` function which should return an object.

Use `defaultStyles` to extend the default style behaviour (looking up a style declaration by class name) and supply default styles that are applied *before* the class level style.

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

You can use `defaultStyles` to create simple inheritance patterns that can help to remove duplicate properties in your styles:

```javascript
class BlockQuote extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      defaultStyles: [styleSheet.Label, styleSheet.Paragraph]
    }
  }
}
export default Prism(BlockQuote)
```

Which would create default styles for the component using the `Label`, `Paragraph` and `BlockQuote` style declarations (in that order).

### Color Names

Styles are much easier to change if we can refer to our custom colors by name.

The bundled plugins handle color name lookup but if you are writing your own plugins and want to support color name lookup for color values you need to test the `colors` map:

```javascript
[
  ({prop, colors}) => {
    return {backgroundColor: colors[prop] || prop}
  },
  {bulletColor: PropTypes.string}
]
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

Default styles start with an array specified using `styleOptions` when given and append a style declaration inferred using the component class name, eg: `Label`.

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

Note that when you assign to `style` in JSX declarations it may be an array or object but by the time `style` reaches your component render function it is guaranteed to be an array.

## Bugs

Some third-party components break the idiom of `style` being an array or object and enforce object only. There is currently no easy way to flatten the `style` array to an object for these component implementations. The best solution for now is to ask the author to fix the `propType`, otherwise just fork it and fix it.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on February 2, 2018

