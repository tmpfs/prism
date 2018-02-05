## Components

### Bundling Styles

Component libraries should supply a style registry which is merged with the user-supplied registry to bundle their default styles.

```javascript
import React, {Component} from 'react'
import {Prism, StyleRegistry} from 'react-native-prism'
import theme from './theme'
const registry = new StyleRegistry({theme})
class Styled extends Component {
  static styleOptions = () => {
    return {
      registry: registry
    }
  }
}
export default Prism(Styled)
```

An example of bundling default styles for a component library is in the [Layout](https://github.com/fika-community/prism-components/blob/master/src/Layout.js) and corresponding [theme](https://github.com/fika-community/prism-components/blob/master/src/theme.js) for [Prism Components][].

Users of the library can then selectively override style declarations where necessary.

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

Functions declared in this way have access to the style registry (`styleSheet`, `colors` etc) the `props`, current `prop` and the computed component `options`. Functions should return a style object or array of objects, to take no action return `undefined`.

If you return a string a style sheet is resolved using the familiar `a:hover` syntax.

For a component called `Notice`:

```javascript
static mapPropsToStyle = {
  error: ({prop, props}) => {
    if (prop === true) {
      // Include the style for Notice:error
      return 'error'
    }
  }
}
```

Would result in including the class declaration lookup for `Notice:error`:

```javascript
{
  'Notice:error': {
    backgroundColor: 'red',
    color: 'white'
  }
}
```

This can be an easy way to trigger style variations that are resolved from the style sheet based on a property value. For example, if you have a `size` property that accepts `small|medium|large` you can do:

```javascript
static mapPropsToStyle = {
  size: ({prop}) => prop
}
```

To resolve a style sheet for the value of `size`, eg: `Notice:small`, `Notice:medium` or `Notice:large`.

#### mapStyleToProps

When you start creating composite components it becomes very useful to route properties to style objects for the child components, use `mapStyleToProps` to define styles for these child components.

Take the case of a `Panel` component with child components for the header and body.

You can declare child computed styles with:

```javascript
static mapStyleToProps = {
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
static mapStyleToProps = {
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
static mapStyleToProps = {
  // Maps color -> labelStyle.color and space -> labelStyle.marginTop
  labelStyle: ['color', {space: 'marginTop'}],
  imageStyle: ['width', 'height']
}
```

The `mapStyleToProps` functionality is *subtractive* by default, if you route a property to a component style it is no longer included in the primary `style` object. This is normally what you want to prevent properties like `color` from triggering an error on non-text components.

Except sometimes you may wish to route properties to a child component style but also include them in the primary computed `style`, to do so you can use the `style` array to force inclusion of properties.

Take the example above where we route `width` and `height` to the `imageStyle` object which we assign to the child `Image` component; we may wish to also propagate those values to the parent `style` so we can apply the dimensions to the containing component as well.

```javascript
static mapStyleToProps = {
  // Force include dimensions in the main `style`
  style: ['width', 'height'],
  // Map dimensions into the child style
  imageStyle: ['width', 'height']
}
```

When using `mapStyleToProps` there is no need to define `propTypes` for the child style objects they are automatically declared as we know ahead of time they should have the same property type as `style`. But for properties you map using the routing functionality you should declare them so they are validated:


```javascript
static propTypes = {
  space: PropTypes.number
}

static mapStyleToProps = {
  labelStyle: [{space: 'marginBottom'}]
}
```

For style declaration lookup the child component name is determined by the property name with any `Style` suffix removed and the first character converted to uppercase.

If the component is namespaced use the fully qualified name, eg: `com.prism.ui.Panel.Header`.

### Property Type Validation

It is important to know that the `propTypes` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

If you need it the `Prism.propTypes` field exposes the system property types.

### Namespaces

The `Prism` function accepts a second argument which can be used to specify a namespace for your component. This is useful (and recommended) when designing reusable component sets.

```javascript
export default Prism(Label, 'com.prism.ui')
```

Now the default component style declaration name is `com.prism.ui.Label` and a consumer needs to declare the style using the fully qualified name:

```javascript
export default ({colors, fonts}) => {
  return {
    'com.prism.ui.Label': {
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
  return (
    <NonIdiomaticComponent style={style} />
  )
}
```
