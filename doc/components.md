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

Now you can use all the built in [style properties](#style-properties), for example:

```html
  <Label
    position={{top: 10, left: 20}}
    style={{color: 'red'}}>Text</Label>
```

The default styles for a component are extracted by class name so the stylesheet we created earlier already provides styles for our new component!

It is important to know that the `propTypes` and `defaultProps` you declare are assigned to the HOC so properties work as expected and that your static `propTypes` are *augmented* with all the [style properties](#style-properties).

Built in `propTypes` are merged first so your `propTypes` will win if there is a property name collision however the behaviour is undefined so you should take care that your `propTypes` do not conflict.

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

It is recommended to access pre-compiled stylesheets wherever possible.

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
    // Make sure our style property is validated correctly
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

You can use this to override the default style behaviour (looking up a stylesheet by class name) and supply your preferred default styles.

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

