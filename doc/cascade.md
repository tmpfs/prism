## Cascade

This section gives an overview of the cascade or inheritance mechanism using the default configuration.

1. Compute style from `defaultProps`
2. Include styles from `defaultStyleRule`
3. Process global plugins (property mapping)
4. Process property plugins (eg: extended and experimental)
5. Run processors

Note that property plugins are massaged so that `style`, `labelStyle` etc always execute after other configured property plugins.

This means the inheritance for say `color` of `Label` can be described in this order.

### Default Properties

```javascript
static defaultProps = {
  style: {
    color: 'red'
  }
}
```

```html
// Color is red
<Label />
```

### Default Style Rule

```javascript
Label: {
  color: 'green'
}
```

```html
// Color is green now we have a default style rule
<Label />
```

### Component Mapping

```javascript
static mapPropsToStyle = {
  color: () => {
    return {color: 'blue'}
  }
}
```

```
// Our component now says it should be blue
<Label />
```

### Class Name

```javascript
'.highlight': {
  color: 'steelblue'
}
```

```html
// Prefer the color in another style rule
<Label className='highlight' />
```

### Inline Property

```html
// Prefer the inline property over the className style
<Label className='highlight' color='orange' />
```

### Inline Style

```html
// Inline style beats everything else
<Label className='highlight' color='orange' style={{color: 'purple'}} />
```
