## Components

### Defining Styled Components

To create a styled component you just need to pass the component class to the `Prism` function which will return the HOC component.

```javascript
import {View} from 'react-native'
import {Prism} from 'react-native-prism'
export default Prism(View)
```

Here is a working example for the application shown above.

File: [Label.js](/doc/examples/Label.js)

<? @source {javascript=s/\.\.\/\.\.\/src\/Prism/react-native-prism/} ./examples/Label.js ?>

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
const namespace = 'com.example.text'
const theme = {
  styles: () => {
    return {
      'com.example.text.Label': {
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
'com.example.text.Label': {
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
  bold: ({registry}) => registry.resolve('bold')
}
```

```javascript
static styleOptions = {
  mapPropsToStyle: ({registry}) => {
    return {
      bold: () => registry.resolve('bold')
    }
  }
}
```

```javascript
static styleOptions = ({registry}) => {
  return {
    mapPropsToStyle: {
      bold: () => registry.resolve('bold')
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
'Panel.Header': {
  color: 'blue',
  padding: 10
},
'Panel.Body': {
  padding: 20
}
```

For style declaration lookup the child component name is determined by the property name with any `Style` suffix removed and the first character converted to uppercase. If the component is namespaced use the fully qualified name, eg: `com.prism.ui.Panel.Header`.

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
const namespace = 'com.prism.ui'
export default Prism(Label, {namespace})
```

Now the default component style declaration name is `com.prism.ui.Label` and a consumer needs to declare the style using the fully qualified name:

```javascript
'com.prism.ui.Label': {
  color: 'black'
}
```

### Requirements

Sometimes a component or library of components needs certain conditions to be met to be able to work correctly.

You may pass a `requirements` option to `Prism()` which is a function passed the `registry` and `config` and can be used to validate the component requirements.

Here is an example from the `com.prism.ui` components:

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
