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
* `supportsTextTransform`: Component allows text transformations.
* `supportsDimension`: Component can receive `width` and `height`.

#### background

`String`

Set the `backgroundColor` style property.

#### color

`String`

Set the `color` style property, requires the `supportsText` flag.

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


### Experimental Properties

When the `experimentalPlugins` option is given these properties are configured.

They are considered experimental due to use of `context` to propagate values to child components and the behaviour is undefined when components wrapped by `Prism()` make use of the `context`.

#### font

The `font` property provides a convenient shortcut for all the [Text Style Props][] and can be useful if you have a lot of inline text styling.

Only `Text` and `TextInput` components can accept these style properties so components that wish to receive them in their computed stylesheet must specify the `supportsText` option.

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

The shape of the font object is described in [PropTypes.js](/src/PropTypes.js).

#### text

The `text` property provides a means to apply text transformations to components, it requires the `supportsTextTransform` flag on receiving components.

This property is distinct from the `font` property as it's behaviour is very different, instead of injecting values into a style sheet it *modifies a component's children*.

It is an object with a single `transform` property:

```javascript
{transform: 'lowercase|uppercase|capitalize'}
```

Example usage:

```html
<List space={5} text={{transform: 'uppercase'}}>
  <List space={10}>
    <Paragraph>
      This is some uppercase text <Label text={{transform: 'lowercase'}}>including some lowercase text in a Label</Label> in a paragraph. <Label text={{transform: 'capitalize'}}>We can capitalize too</Label>.
    </Paragraph>
  </List>
</List>
```

Components can also support `textTransform` in their style sheets but note that for child components the property will not be `text` but `childNameText` so that components can direct text transformations accordingly.
