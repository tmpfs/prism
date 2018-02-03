## Getting Started

### Defining Styles

To configure your application stylesheets first create some colors, fonts and styles.

#### Colors

Colors are a map from color name to value.

<? @source {javascript} ../app/Colors.js ?>

#### Fonts

Fonts are declared as functions that return a different string per platform as iOS uses the PostScript name and Android uses the file name.

Each font function is passed the value of `Platform.OS`.

<? @source {javascript} ../app/Fonts.js ?>

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts so this signature is common:

<? @source {javascript} ../app/StyleSheet.js ?>

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

<? @source {javascript=s/\.\.\/src\/Prism/react-native-prism/} ../app/Label.js ?>

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

### Default Styles

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

This is the preferred method for reusable component sets as it allows them to supply default styles without any knowledge of the style sheet declarations.

After the `defaultProps` are evaluated components can use `defaultStyles` to extend the default style behaviour (looking up a style declaration by class name) and supply default styles that are applied *before* the class level style.

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

Use of `defaultStyles` is not advisable if you are designing components to be shared with others, use `defaultProps` instead.

#### Style Class Name

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
