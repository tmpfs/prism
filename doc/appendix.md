## Appendix

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

<? @include plugins.md ?>

### Processor

TODO

### Invariants

Invariants are unknown style declarations that would trigger an error when compiling style sheets with `StyleSheet.create()`. This strict behaviour of RN is very useful but there are occasions where it makes more sense to put the information in a style sheet and invariants allow us to do that. Internally they are extracted as invariant style rules and later resolved when styles are computed.

An example of this is `tintColor` where we need to assign to the `tintColor` property of `ActivityIndicator` but really it's styling information and is better suited to being in a style sheet.

Also the experimental `textTransform` property is treated as an invariant so it can be declared in style rules and processed using the plugin system yet never appear in compiled or computed style sheets.

Invariants use a processor to ensure computed styles do not contain these properties so they incur the same performance penalty (stylesheet flattening is required).

### Performance

TODO
