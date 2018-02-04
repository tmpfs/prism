## Getting Started

### Defining Styles

To configure your application stylesheets first create some colors, fonts and styles.

#### Colors

Colors are a map from color name to value. Use of custom color names is optional but it can help make your styles more semantic.

#### Fonts

Fonts are declared as functions that may return a different string per platform if necessary as iOS uses the PostScript name and Android uses the file name.

Each font function is passed the value of `Platform.OS`.

#### Styles

Styles are declared as a function that is passed the style registry, typically you only need access to the colors and fonts.

File: [theme.js](/doc/examples/theme.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/theme.js ?>

### Configure Prism

Now you can create a style registry and instruct your components to use it:

File: [App.js](/doc/examples/App.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/App.js ?>

With the `extendedProperties` option all the built in and extended [style properties](#style-properties) are available.

### Defining Styled Components

To create a styled component you just need to pass the component class to the `Prism` function which will return the HOC component.

```javascript
import {Prism} from 'react-native-prism'
// Define your Label component
export default Prism(Label)
```

Here is a working example for the application shown above.

File: [Label.js](/doc/examples/Label.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/Label.js ?>

The default styles for a component are extracted by class name so the stylesheet we created earlier already provides styles for our new component!

