<h1 align="center">Prism</h1>
<p align="center">Minimal, idiomatic style management for React Native.</p>
<p align="center">
  <img width="256" height="256" src="https://raw.githubusercontent.com/fika-community/prism/master/prism.png" />
</p>

---

- [Installation](#installation)
- [Synopsis](#synopsis)
- [Components](#components)
  - [Defining Styles](#defining-styles)
    - [Colors](#colors)
    - [Fonts](#fonts)
    - [Styles](#styles)
  - [Create Style Registry](#create-style-registry)
  - [Defining Styled Components](#defining-styled-components)
  - [Mapping Properties To Styles](#mapping-properties-to-styles)
  - [Setting Default Styles (styleOptions)](#setting-default-styles-styleoptions)
- [Style Properties](#style-properties)
  - [style](#style)
  - [className](#classname)
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

---

## Installation

Use your preferred package manager for installation.

```
npm i react-native-prism
yarn add react-native-prism
```

## Synopsis

Prism is a library that returns a HOC (Higher Order Component) that exposes access to a style registry containing user-defined colors, fonts and styles.

It provides a simple yet flexible mechanism for mapping properties to styles and finding style declarations in the registry.

## Components

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

Each font function is passed a boolean indicating if the platform is iOS.

```javascript
export default {
  regular: (ios) => {
    return ios ? 'WorkSans-Regular' : 'worksans'
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

// Use this registry for styled components
Prism.configure(registry)

// Initialize your application
```

### Defining Styled Components

To create a styled component you just need to pass the component class to the `Prism` function which will return a HOC wrapper.

```javascript
import React, {Component} from 'react'
import {Text} from 'react-native'
import {Prism} from 'react-native-prism'

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

Now you can use all the built in properties, for example:

```html
  <Label
    position={{top: 10, left: 20}}
    style={{color: 'red'}}>Text</Label>
```

### Mapping Properties To Styles

It can be very convenient to map properties to stylesheets, this is achieved using `mapPropsToStyle`. For example to return a declaration from the compiled stylesheet:

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

The former style is preferred as the style declaration is pre-compiled.

You have access to all the properties so you can apply styles conditionally based on other properties:

```javascript
static propTypes = {
  space: PropTypes.number,
  horizontal: PropTypes.bool
}
static mapPropsToStyle = {
  space: ({prop, props, styleSheet}) => {
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

### Setting Default Styles (styleOptions)

## Style Properties

By default plugins are enabled that expose the following properties on all styled components.

### style

`Array | Object`

Inline styles for the component.

### className

`String | Array <String>`

Assign stylesheets to the component. When a string is given separate stylesheet names should be delimited with whitespace.

### flex

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

### direction

`Enum<String> (row|column)`

Set the `flexDirection` style property.

### wrap

`Boolean`

Set the `flexWrap` style property.

### justify

`Enum<String> (center|start|end|between|around)`

Set the `justifyContent` style property, note that the `flex-` prefixes are omitted.

### padding

`Number | Object | Array`

Sets padding properties, a number sets all edges to be equal.

Arrays are a shorthand for setting vertical and horizontal values and take the form: `[vertical, horizontal]`.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
[5,10]
```

### margin

`Number | Object | Array`

Sets margin properties, a number sets all edges to be equal.

Arrays are a shorthand for setting vertical and horizontal values and take the form: `[vertical, horizontal]`.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
[5,10]
```

### position

`Object`

Makes a component absolutely positioned (relative to the parent as is the RN way) and sets the style properties to the given values.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
```

### background

`String`

Set the `backgroundColor` style property.

### border

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

### radius

`Number | Object`

Sets border radius style properties.

```javascript
{
  top: {left: 0, right: 0},
  bottom: {left: 0, right: 0}
}
```

## System Properties

System properties are those passed to the underlying component implementation from the HOC component. They allow access to the colors, fonts and compiled stylesheet.

### style

`Array`

The computed stylesheet for the component.

### styleSheet

`Object`

The compiled collection of stylesheets.

### styleRegistry

`StyleRegistry`

The underlying registry of colors, fonts and stylesheets.

### styleFlexRow

`Boolean`

Indicates whether the layout direction is horizontal or vertical, can be used by child components to determine the edge for intermediate space.

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on January 28, 2018

