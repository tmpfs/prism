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
    - [Styles](#styles)
    - [Colors](#colors)
    - [Fonts](#fonts)
  - [Application Configuration](#application-configuration)
- [Components](#components)
  - [Defining Styled Components](#defining-styled-components)
  - [Quick Components](#quick-components)
  - [Bundling Styles](#bundling-styles)
  - [Default Styles](#default-styles)
  - [Mapping Properties To Styles](#mapping-properties-to-styles)
    - [mapPropsToStyle](#mappropstostyle)
      - [Pseudo State](#pseudo-state)
      - [Child Components](#child-components)
    - [mapStyleToProps](#mapstyletoprops)
  - [Component State](#component-state)
    - [Lifecycle](#lifecycle)
      - [shouldStyleUpdate](#shouldstyleupdate)
    - [Options](#options)
  - [Property Type Validation](#property-type-validation)
  - [Namespaces](#namespaces)
  - [Requirements](#requirements)
- [Properties](#properties)
  - [Style Properties](#style-properties)
    - [style](#style)
    - [className](#classname)
  - [Extended Style Properties](#extended-style-properties)
    - [background](#background)
    - [border](#border)
    - [padding](#padding)
    - [margin](#margin)
    - [flex](#flex)
    - [row](#row)
    - [wrap](#wrap)
    - [justify](#justify)
    - [position](#position)
    - [radius](#radius)
    - [width](#width)
    - [height](#height)
  - [Font Properties](#font-properties)
    - [color](#color)
    - [align](#align)
    - [bold](#bold)
    - [font](#font)
  - [Experimental Properties](#experimental-properties)
    - [textTransform](#texttransform)
- [Cascade](#cascade)
  - [Default Properties](#default-properties)
  - [Default Style Rule](#default-style-rule)
  - [Component Mapping](#component-mapping)
  - [Class Name](#class-name)
  - [Inline Property](#inline-property)
  - [Inline Style](#inline-style)
- [Configuration](#configuration)
- [Appendix](#appendix)
  - [Platform Styles](#platform-styles)
  - [Color Names](#color-names)
  - [Flat Styles](#flat-styles)
  - [Plugins](#plugins)
    - [Creating Plugins](#creating-plugins)
      - [Property Plugins](#property-plugins)
      - [Global Plugins](#global-plugins)
    - [Plugin Configuration](#plugin-configuration)
      - [plugins](#plugins-1)
      - [additionalPlugins](#additionalplugins)
      - [disabledPlugins](#disabledplugins)
  - [Processor](#processor)
  - [Invariants](#invariants)
  - [Best Practices](#best-practices)
  - [Pure Mode](#pure-mode)
  - [Performance](#performance)
- [License](#license)

---

## Installation

Use your preferred package manager for installation.

```
npm i --save react-native-prism
yarn add react-native-prism
```

## Synopsis

Prism is a library that returns a Higher Order Component (HOC) exposing access to a style registry containing user-defined colors, fonts and styles.

It provides a simple yet flexible mechanism for mapping properties to styles and finding style declarations in the registry.

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques that will leave your JSX clean and serene allowing you to focus on your application's state and logic.

If you want to migrate an existing application you should start with [Prism Primitives][] which provides a drop-in replacement for the RN visual components. See [Prism Components][] for some *slightly* more advanced components; if you want to see a running application clone and run the RN app in the [Prism Components][] repository.

## Getting Started

### Defining Styles

To configure your application stylesheets first create a theme with some styles, colors and fonts.

File: [theme.js](https://github.com/fika-community/prism/blob/master/doc/examples/theme.js)

```javascript
export default {
  colors: {
    bg: 'steelblue',
    highlight: '#fdfbdf',
    normal: '#9a9a9a'
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      Label: {
        fontSize: 20,
        fontFamily: fonts.regular,
        color: colors.normal
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
```

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts.

#### Colors

Colors are a map from color name to string value. Use of custom color names is optional but it can help make your styles more semantic.

#### Fonts

Fonts are a map from font identifier to string font family name.

```javascript
{regular: 'WorkSans-Regular'}
```

Because Android uses the file name and iOS uses the PostScript name the easiest thing to do is name your fonts *using the PostScript* name otherwise use [platform styles](#platform-styles).

### Application Configuration

To configure your application create a style registry with your theme and instruct your components to use it:

File: [App.js](https://github.com/fika-community/prism/blob/master/doc/examples/App.js)

```javascript
import React, {Component} from 'react';
import {Prism, StyleRegistry} from 'react-native-prism'
import theme from './theme'
import Label from './Label'

const registry = new StyleRegistry({theme})
Prism.configure(
  registry,
  {
    extendedProperties: true,
    fontProperties: true,
    experimentalPlugins: true,
    textTransform: true,
    colorNames: true
  }
)
export default class Application extends Component {
  render () {
    return (
      <Label
        background='bg'
        color='highlight'
        bold
        align='center'
        textTransform='capitalize'
        padding={15}>
        Prism example application
      </Label>
    )
  }
}
```

With the `extendedProperties` option all the built in and extended [style properties](#style-properties) are available.

Note that you should `import` all your Prism enabled components *before* calling `configure()`.

## Components

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
  static styleOptions = {
    supportsText: true
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

### Quick Components

```javascript
Prism.style(Type, style, props)
```

Sometimes you want to wrap a component using fixed styles without too much fuss, use `Prism.style()` to wrap a component with basic styles.

This is particularly useful when you just want to draw a shape, a convoluted example to illustrate inheritance:

```javascript
const Rectangle = Prism.style(
  View,
  {
    flex: 0,
    width: 20,
    height: 20,
    // Set absolute minimum color (defaultProps.style)
    backgroundColor: 'red'
  },
  {
    // Override backgroundColor with extended property
    background: 'green'
  }
)
```

```html
// Use the green background
<Rectangle />
// Resize and use a blue background
<Rectangle width={50} height={50} background='blue' />
```

### Bundling Styles

Component libraries should supply a style registry which is merged with the user-supplied registry to bundle their default styles. Pass a theme and the `bundle` flag to a style registry assigned to the component, here is how we wire it up:

```javascript
import {Prism, StyleRegistry} from 'react-native-prism'
const namespace = 'prism'
const theme = {
  styles: () => {
    return {
      'prism|Label': {
        fontSize: 22,
        color: 'white',
        backgroundColor: 'black'
      }
    }
  }
}
const registry = new StyleRegistry({theme, bundle: true})
class Label extends Component {
  static styleOptions = {
    registry: registry
  }
}
export default Prism(Label, {namespace})
```

Then a user of the component can just overwrite the declarations they need to change:

```javascript
'prism|Label': {
  color: 'black',
  backgroundColor: 'white'
}
```

The default `fontSize` is respected but now the colors are inverted!

An example of bundling default styles for a component library is in the [Layout](https://github.com/fika-community/prism-components/blob/master/src/Layout.js) and corresponding [theme](https://github.com/fika-community/prism-components/blob/master/src/theme.js) for [Prism Components][].

### Default Styles

It is recommended that you bundle styles using a theme and style registry however it is possible to set the bare minimum styles for a component with `defaultProps`, to do so you use an object named using the corresponding property:

```javascript
static defaultProps = {
  style: {
    fontSize: 16,
    color: 'black'
  }
}
```

We can declare default styles for [child components](#child-components) too.

```javascript
static mapPropsToStyle = {
  labelStyle: {}
}
static defaultProps = {
  style: {
    flex: 1
  },
  labelStyle: {
    fontSize: 16,
    color: 'black'
  }
}
```

### Mapping Properties To Styles

Components have varied needs for mapping properties to style declarations so the library provides several ways to map properties depending upon the requirement.

Each of the mapping options may be either a function or object, when it is a function it is passed the style registry and should return an object.

Prism is flexible with these declarations, the `static` style is the most terse and preferred when other `styleOptions` are not needed:

The following are all equivalent:

```javascript
static mapPropsToStyle = {
  bold: ({styleSheet}) => styleSheet.bold
}
```

```javascript
static styleOptions = {
  mapPropsToStyle: ({styleSheet}) => {
    return {
      bold: () => styleSheet.bold
    }
  }
}
```

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

Use `mapPropsToStyle` when you want the presence of a property to trigger inclusion of styles into the computed style. Each object key maps to a property name and the corresponding function is called when the property is defined on the component.

You have access to all the properties so you can apply styles conditionally based on other properties:

```javascript
static mapPropsToStyle = {
  space: ({prop, props}) => {
    const {horizontal} = props
    const styleProp = horizontal ? 'marginRight' : 'marginBottom'
    const style = {}
    style[styleProp] = prop
    return style
  }
}
```

Functions declared in this way have access to the style registry and it's properties (`colors` etc) the `props`, current `prop` and  `propName`. Functions should return a style object or array of objects to be included in the computed styles, to take no action return `undefined`.

When the passed `prop` is returned a style rule is created using the property name and value which is useful when the property name matches the style property name:

```javascript
{color: ({prop}) => prop}
```

Is shorthand for:

```javascript
{
  color: ({prop}) => {
    return {color: prop}
  }
}
```

##### Pseudo State

If you call `css.pseudo()` with a string a style sheet is resolved using the familiar `a:hover` syntax.

For a component called `Notice`:

```javascript
static mapPropsToStyle = {
  error: ({css, prop, propName}) => {
    if (prop === true) {
      // Include the style for Notice:error
      return css.pseudo(propName)
    }
  }
}
```

Would result in including the rule for `Notice:error` when the `error` property is `true`:

```javascript
{
  'Notice:error': {
    backgroundColor: 'red',
    color: 'white'
  }
}
```

```html
<Notice error>Error message</Notice>
```

This can be an easy way to trigger style variations that are resolved from the style sheet based on a property value. For example, if you have a `size` property that accepts `small|medium|large` you can do:

```javascript
static mapPropsToStyle = {
  size: ({css, prop}) => css.pseudo(prop)
}
```

To resolve a style sheet for the value of `size`, eg: `Notice:small`, `Notice:medium` or `Notice:large`.

##### Child Components

For composite components you can route properties to styles that you apply to child components.

At it's simplest level the empty object just declares that your component wants a style object to pass to a child, but you can also route properties to child style objects:

```javascript
static mapPropsToStyle = {
  headerStyle: {
    color: ({prop}) => prop
  },
  bodyStyle: {}
}
```

Which will define and create the `headerStyle` and `bodyStyle` properties for your component and route the `color` property in to the `headerStyle` object. The `propTypes` for the child style objects are automatically declared as we know ahead of time they should have the same property type as `style`.

The immediate benefit is that you can now define style rules using dot notation for the child components which will automatically be resolved as default styles.

```javascript
'Panel Header': {
  color: 'blue',
  padding: 10
},
'Panel Body': {
  padding: 20
}
```

For style declaration lookup the child component name is determined by the property name with any `Style` suffix removed and the first character converted to uppercase. If the component is namespaced use the fully qualified name, eg: `prism|Panel Header`.

Then your render should route the properties to child components, for example:

```javascript
render () {
  const {style, headerStyle, bodyStyle, label} = this.props
  return (
    <View style={style}>
      <Text style={headerStyle}>
        {label}
      </Text>
      <View style={bodyStyle}>
        {this.props.children}
      </View>
    </View>
  )
}
```

Now use of the `color` property on the parent is directed to the `headerStyle` object (and therefore the child component):

```html
<Panel color='red' />
```

You can combine `css.pseudo()` with multiple child components to create some interesting behaviour:

```javascript
static mapPropsToStyle = {
  titleStyle: {
    size: ({css, prop}) => css.pseudo(prop)
  },
  numberStyle: {
    size: ({css, prop}) => css.pseudo(prop)
  }
}
```

For a component `NumberStack`:

```html
<NumberStack size='medium' />
```

Will resolve `NumberStack.Title:small` to include in `titleStyle` and `NumberStack.Number:small` for the `numberStyle`.

#### mapStyleToProps

This is the inverse mapping that extracts a style property and assigns it as a property on the component.

It is recommended to only use `mapStyleToProps` when you absolutely must as it requires flattening the computed styles.

```javascript
static mapStyleToProps = {
  tintColor: ({prop}) => prop
}
```

Typically this is used to deal with [invariants](#invariants) as in the example above which allows your component to respect `tintColor` in a style rule:

```javascript
Activity: {
  tintColor: 'purple'
}
```

And have it extracted to a property on the component:

```javascript
render () {
  const {style, tintColor} = this.props
  return (
    <View style={style}>
      <ActivityIndicator tintColor={tintColor} />
    </View>
  )
}
```

See [Activity.js](https://github.com/fika-community/prism-components/blob/master/src/Activity.js) for a complete implementation.

### Component State

For most use cases when you are triggering state changes from a property `mapPropsToStyle` and `css.pseudo()` will do the job just fine (see [pseudo state](#pseudo-state)). However there are times when you need finer control over style invalidation as the component state changes.

To enable state invalidation you need to specify the `withState` configuration option and enable `supportsState` in your component:

```javascript
static styleOptions = {
  supportsState: true
}
```

A typical scenario is when you are managing state based on events from a child component and want the state change to be reflected in the styles.

```javascript
render () {
  const toggle = () => this.setState({active: !this.state.active})
  return (
    <ChildComponent onPress={toggle} />
  )
}
```

Once state invalidation is enabled you can do:

```javascript
static mapPropsToStyle = {
  state: ({state, css}) => {
    if (state.active) {
      return css.pseudo('active')
    }
  }
}
```

To add the `:active` pseudo class to the component when `state.active` is true. If you want the state change to automatically be applied to child components you can use the `cascadeState` option:

```javascript
static styleOptions = {
  supportsState: true,
  cascadeState: true
}
static mapPropsToStyle = {
  state: ({state, css}) => {
    if (state.active) {
      return css.pseudo('active')
    }
  }
  // We don't need to declare a state handler
  // for these as `cascadeState` is enabled
  // the `:active` pseudo class will be triggered
  // for these styles automatically
  headerStyle: {},
  footerStyle: {}
}
```

You should try to match the default style of your component to the default state but you can trigger invalidation of the styles using the *initial component state* when it mounts by declaring the `mountStateStyle` option for your component.

```javascript
static styleOptions = {
  supportsState: true,
  mountStateStyle: true
}
```

#### Lifecycle

The component state functionality decorates your component with a simple lifecycle that lets you decide when state changes should trigger style invalidation.

By default as soon as you enable this feature every call to `setState()` will trigger invalidation of the styles but you can implement `shouldStyleUpdate()` on your component to control this behaviour.

##### shouldStyleUpdate

```javascript
shouldStyleUpdate(state, newState)
```

Implement this function to control whether to invalidate the styles when the state changes, it should return a boolean.

#### Options

* `supportsState` opt-in to state style invalidation.
* `cascadeState` call primary state handler for child component styles.
* `mountStateStyle` automatically invalidate using the state of the component when it mounts.

### Property Type Validation

It is important to know that the `propTypes` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

If you need it the `Prism.propTypes` field exposes the system property types.

### Namespaces

The `Prism` function accepts a namespace option which can be used to specify a namespace for your component. This is useful (and recommended) when designing reusable component sets.

```javascript
const namespace = 'prism'
export default Prism(Label, {namespace})
```

Now the default component style declaration name uses CSS-style namespaces `prism|Label` and a consumer needs to declare the style using the fully qualified name:

```javascript
'prism|Label': {
  color: 'black'
}
```

### Requirements

Sometimes a component or library of components needs certain conditions to be met to be able to work correctly.

You may pass a `requirements` option to `Prism()` which is a function passed the `registry` and `config` and can be used to validate the component requirements.

Here is an example from the [Prism Components][]:

```javascript
const requirements = ({config}) => {
  if (config.extendedProperties !== true) {
    return `extendedProperties must be set in config ` +
      `to use the ${namespace} component library`
  }
}

export default Prism(Layout, {requirements})
```

If the component requirements are not met you can throw an error or return an error or a string. When a string is returned it is wrapped in an error and thrown.

Note that you can use this technique to validate style rules exist, for example:

```javascript
const requirements = ({registry}) => {
  if (!registry.has('bold')) {
    return `bold style rule is required`
  }
}
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

The property mapping API and these properties should be sufficient for most applications and indeed it might be considered best practice not to use the extended and experimental properties.

### Extended Style Properties

Extended properties allow for rapidly mocking layouts with a variety of convenient shortcuts for common style properties. Enable the `extendedProperties` option to use these properties.

Some extended properties require a component *opt-in* using `styleOptions` for the style to be applied, for example to receive the `color` property:

```javascript
static styleOptions = () => {
  return {
    supportsText: true
  }
}
```

* `supportsText`: Component can receive text style props.
* `supportsDimension`: Component can receive `width` and `height`.

Note that the `supportsText` option is also used to test whether a component can receive `textTransform` on it's children.

#### background

`String`

Set the `backgroundColor` style property.

#### border

`String | Array | Object`

Enables a border for the component, this shortcut is great for quickly visualizing component dimensions.

When a string is given `borderColor` is set and a default `borderWidth` is used.

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

#### position

`Object`

Makes a component absolutely positioned (relative to the parent as is the RN way) and sets the style properties to the given values.

```javascript
{top: 0, right: 0, bottom: 0, top:0}
```

#### radius

`Number | Object`

Sets border radius style properties.

```javascript
{
  top: {left: 0, right: 0},
  bottom: {left: 0, right: 0}
}
```

#### width

`Number | String`

Pass the `width` property into the computed style, requires the `supportsDimension` flag.

#### height

`Number | String`

Pass the `height` property into the computed style, requires the `supportsDimension` flag.

### Font Properties

When the `fontProperties` option is given these properties are configured.

Only `Text` and `TextInput` components can accept these style properties so components that wish to receive them in their computed stylesheet must specify the `supportsText` option.

#### color

`String`

Set the `color` style property.

#### align

`Enum<String> (left|center|right)`

Sets the `textAlign` style property.

#### bold

`Boolean`

Looks for a style rule named `bold` and returns it if available otherwise sets `fontWeight` to `bold`.

#### font

The `font` property provides a convenient shortcut for all the [Text Style Props][] and can be useful if you have a lot of inline text styling.

Note that to propagate down to children this property requires that `experimentalPlugins` is enabled so that `context` is used, see [experimental properties](#experimental-properties).

An example using [Prism Components][]:

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

The shape of the font object is described in [propTypes.js](https://github.com/fika-community/prism/blob/master/src/propTypes.js).

### Experimental Properties

When the `experimentalPlugins` option is given these properties are configured.

They are considered experimental due to use of `context` to propagate values to child components and the behaviour is undefined when components wrapped by `Prism()` make use of the `context`.

#### textTransform

```javascript
lowercase|uppercase|capitalize
```

The `textTransform` property provides a means to apply text transformations to components, it requires the `supportsText` flag on receiving components and requires that the `textTransform` and `experimentalPlugins` options are enabled.

This property is distinct from the `font` property as it's behaviour is very different, instead of injecting values into a style sheet it *modifies a component's children*.

In a style sheet:

```javascript
'Panel.Header': {
  textTransform: 'capitalize'
}
```

Inline property usage illustrating inheritance:

```html
<List space={5} textTransform='uppercase'>
  <List space={10}>
    <Paragraph>
      This is some uppercase text <Label textTransform='lowercase'>including some lowercase text in a Label</Label> in a paragraph. <Label textTransform='capitalize'>We can capitalize too</Label>.
    </Paragraph>
  </List>
</List>
```

Caveat that you cannot undo a transformation on a child (`none` is not supported), you can only override with a new transformation.

## Cascade

This section gives an overview of the cascade or inheritance mechanism using the default configuration.

1. Compute style from `defaultProps`
2. Include styles from `defaultStyleRule`
3. Process global plugins (property mapping)
4. Process property plugins (eg: extended and experimental)
5. Run processors

Note that property plugins are massaged so that `style`, `labelStyle` etc always execute after other configured property plugins.

This means the inheritance for say `color` of `Label` can be described in this order.

### Default Properties

```javascript
static defaultProps = {
  style: {
    color: 'red'
  }
}
```

```html
// Color is red
<Label />
```

### Default Style Rule

```javascript
Label: {
  color: 'green'
}
```

```html
// Color is green now we have a default style rule
<Label />
```

### Component Mapping

```javascript
static mapPropsToStyle = {
  color: () => {
    return {color: 'blue'}
  }
}
```

```
// Our component now says it should be blue
<Label />
```

### Class Name

```javascript
highlight: {
  color: 'steelblue'
}
```

```html
// Prefer the color in another style rule
<Label className='highlight' />
```

### Inline Property

```html
// Prefer the inline property over the className style
<Label className='highlight' color='orange' />
```

### Inline Style

```html
// Inline style beats everything else
<Label className='highlight' color='orange' style={{color: 'purple'}} />
```

## Configuration

You can pass a configuration object as the second argument to `Prism.configure()` to modify the library configuration. These are the common configuration options, some more advanced options are shown in [plugin configuration](#plugin-configuration).

* `defaultProps` use the [defaultProps](https://github.com/fika-community/prism/blob/master/src/defaultProps.js) plugin, default is `true`.
* `defaultStyleRule` use the [defaultStyleRule](https://github.com/fika-community/prism/blob/master/src/defaultStyleRule.js) plugin, default is `true`.
* `mapPropsToStyle` use the [mapPropsToStyle](https://github.com/fika-community/prism/blob/master/src/mapPropsToStyle.js) plugin, default is `true`.
* `mapStyleToProps` use the [mapStyleToProps](https://github.com/fika-community/prism/blob/master/src/mapStyleToProps.js) plugin, default is `true`.
* `className` use the property plugin for [className](https://github.com/fika-community/prism/blob/master/src/className.js), default is `true`.
* `extendedProperties` enables the [extended property plugins](https://github.com/fika-community/prism/blob/master/src/extendedPropertyPlugins.js).
* `fontProperties` enables the [font property plugins](https://github.com/fika-community/prism/blob/master/src/fontProperties.js).
* `experimentalPlugins` enables the [experimental plugins](https://github.com/fika-community/prism/blob/master/src/experimentalPlugins.js).
* `colorNames` enables the [color names](https://github.com/fika-community/prism/blob/master/src/colorNames.js) processor.
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

File: [configuration.js](https://github.com/fika-community/prism/blob/master/src/configuration.js)

```javascript
export default {
  plugins: [],
  processors: [],
  defaultProps: true,
  defaultStyleRule: true,
  mapPropsToStyle: true,
  mapStyleToProps: true,
  className: true,
  extendedProperties: false,
  fontProperties: false,
  experimentalPlugins: false,
  withState: false,
  inlineStyle: true,
  colorNames: false,
  textTransform: false,
  pure: false,
  debug: __DEV__,
  invariants: [],
  sizes: {
    'xx-small': 12,
    'x-small': 13,
    'small': 14,
    'medium': 16,
    'large': 18,
    'x-large': 22,
    'xx-large': 26
  }
}
```

## Appendix

### Platform Styles

You can use platform specific styles for your fonts and style sheets by using the standard notation passed to `Platform.select()`.

If you need a platform-specific font family specify an object in your fonts map:

```javascript
export default {
  regular: {
    ios: 'WorkSans-Regular',
    android: 'worksans'
  }
}
```

Platform-specific styles are merged over the top of default rules using a selective merge so you can overwrite declarations and inherit the other styles. To illustrate:

```javascript
export default {
  Label: {
    fontSize: 20,
    color: 'red'
  },
  android: {
    Label: {
      // Overwrite for android but inherit
      // fontSize from the top-level Label
      color: 'green'
    }
  }
}
```

### Color Names

Styles are much easier to change and we can add semantic meaning to our colors if we can refer to them by name, use the `colorNames` option to enable this functionality.

With the `colorNames` option enabled and a theme like:

```javascript
{
  colors: {
    primary: '#333333',
    muted: '#999999',
  },
  styles: ({colors}) => {
    return {
      Label: {
        fontSize: 16,
        color: colors.primary
      }
    }
  }
}
```

You can now override the color by name:

```html
<Label color='muted' />
```

To work in all scenarios (default properties, style sheets and properties) this logic is implemented as a [processor](#processor) and adds overhead therefore it is not enabled by default.

Consider that there may be a better way for your application to manage named colors internally before enabling this option.

### Flat Styles

Sometimes you are wrapping a third-party component and want to proxy the `style` object to the component but it does not accept an array for the `style` property; it enforces an object only property type.

The computed `style` property passed to your component is guaranteed to be an array; here however we need it to be an object. To do so you can use the `flat` option:

```javascript
static styleOptions = {
  flat: true
}
```

Now you can just proxy it to the child component knowing it will be an object:

```javascript
render () {
  const {style} = this.props
  return (
    <NonIdiomaticComponent style={style} />
  )
}
```

Flat styles are applied to [child components](#child-components) too.

### Plugins

Plugins allow you to change the default behaviour.

#### Creating Plugins

To create a plugin you pass a plugin name, handler function and plugin options:

```javascript
import {Plugin} from 'react-native-prism'
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

### Processor

Processors are plugins that operate on a *flat representation* of the computed styles, they are used to support named colors and invariants. The default configuration does not enable any processors but it is worth knowing that certain configuration options add some processing overhead:

* `colorNames`
* `textTransform`

### Invariants

Invariants are unknown style declarations that would trigger an error when compiling style sheets with `StyleSheet.create()`. This strict behaviour of RN is very useful but there are occasions where it makes more sense to put the information in a style sheet and invariants allow us to do that. Internally they are extracted as invariant style rules and later resolved when styles are computed.

An example of this is `tintColor` where we need to assign to the `tintColor` property of `ActivityIndicator` but really it's styling information and is better suited to being in a style sheet.

Also the experimental `textTransform` property is treated as an invariant so it can be declared in style rules and processed using the plugin system yet never appear in compiled or computed style sheets.

Invariants use a processor to ensure computed styles do not contain these properties so they incur the same performance penalty.

### Best Practices

You are free to do as you please however here are some guidelines:

* Avoid setting styles in `defaultProps`.
* Use class name style rule for default styles (eg: `Label`).
* Prefer `className` as first option for style overrides.
* Use extended properties sparingly, useful for rapid devlopment, later migrate to `className`.
* Avoid inline `style` properties.

### Pure Mode

If you like the style sheet paradigm that Prism has but want to get closer to the metal we offer a pure mode of operation. When the `pure` configuration option is given plugins and style computation are disabled. Your components are given direct access to the style registry instead.

In pure mode your components are only passed two properties by the HOC:

* `styleRegistry` the application style registry.
* `styleSheet` alias for the registry style sheet.

Note that `style` is no longer passed!

Now you need to pass the styles manually by finding them in the registry:

```javascript
render () {
  const {styleSheet} = this.props
  <Text style={styleSheet.text}>
    {this.props.children}
  </Text>
}
```

Typically you would decide to use this mode of operation from the beginning. If you enable pure mode for an existing application using Prism features your views will revert to zero style.

This would apply to any third-party components you may be using too!

### Performance

We have made every effort to keep iterations and function calls to a bare minimum and in it's default configuration performance impact should be minimal.

However performance may be impacted if you use any of the following features as they all require a flat representation of the computed styles:

* [Processor](#processor) operate on flat computed styles.
* [Invariants](#invariants) implies use of a processor.
* [Flat Styles](#flat-styles) computes a component-specific flat stylesheet.

And of course caveat emptor this is not the sort of thing you want to use to style say many thousands of game sprites.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on February 9, 2018

[prism primitives]: https://github.com/fika-community/prism-primitives
[prism components]: https://github.com/fika-community/prism-components
[text style props]: https://facebook.github.io/react-native/docs/text-style-props.html

