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

