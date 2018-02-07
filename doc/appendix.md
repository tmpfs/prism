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

TODO

### Performance

TODO
