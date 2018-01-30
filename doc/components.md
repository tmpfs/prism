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
static mapPropsToStyleDecl = ({styleSheet}) => {
  return {
    bold: styleSheet.bold
  }
}
```

Or using `styleOptions`:

```javascript
static styleOptions = ({styleSheet}) => {
  return {
    mapPropsToStyleDecl: {
      bold: styleSheet.bold
    }
  }
}
```

#### mapPropsToStyleProp

The simplest form is `mapPropsToStyleProp` which can be used to alias a property to a style sheet property, it is a map of property name to string.

```javascript
static mapPropsToStyleProp = {
  size: 'fontSize'
}
```

Maps the `size` property to `style.fontSize`.

#### mapPropsToStyleDecl

Often you just want to include a style declaration when a property exists:

```javascript
static mapPropsToStyleDecl = ({styleSheet}) => {
  return {
    error: styleSheet.error
  }
}
```

If the `error` property is defined the `error` style declaration is included in the computed styles. For more advanced logic use `mapPropsToStyle`.

#### mapPropsToObject

When designing composite components you often need to pass properties down to child components. Use `mapPropsToObject` to automatically route properties to objects that are passed to child components:

```javascript
static defaultProps = {
  imageProps: {},
  labelProps: {}
}

static mapPropsToObject = {
  labelProps: {
    size: 'size',
    error: 'error'
  },
  imageProps: ['source']
}
```

This can save a lot of repetition passing properties to child components. When using this option you can specify an object (which allows aliasing the property name) or an array of strings, the example above illustrates both styles.

You *must* ensure the child objects are prepared to receive the properties by initializing them in `defaultProps`.

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
