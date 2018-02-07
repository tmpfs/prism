## Cascade

This section gives an overview of the cascade or inheritance mechanism using the default configuration.

1. Compute style from `defaultProps`
2. Include styles from `defaultStyleRule`
3. Process global plugins (property mapping)
4. Process property plugins (eg: extended and experimental)
5. Run processors

Note that property plugins are massaged so that `style`, `labelStyle` etc always execute after after other configured property plugins.

This means the inheritance for say `color` of `Label` can be described in this order:

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

---

```javascript
Label: {
  color: 'green'
}
```

```html
// Color is green now we have a default style rule
<Label />
```

---

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

---

```html
// We don't care what label thinks - it should be orange
<Label color='orange' />
```

---

```html
// Orange, really?
<Label color='orange' style={{color: 'purple'}} />
```
