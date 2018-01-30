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

### Property Type Validation

It is important to know that the `propTypes` and `defaultProps` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

If you need it `Prism.propTypes` field exposes the system property types.

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
