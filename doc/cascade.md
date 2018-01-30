## Cascade

It is useful to know the order in which styles are computed.

1. Default styles are applied.
2. Global plugins are executed.
3. Property plugins are executed.
4. Inline styles are applied.

Default styles start with an array specified using `styleOptions` when given and append a style declaration inferred using the component class name, eg: `Label`.

If the component is namespaced it is prefixed with the namespace and a period, eg: `com.fika.text.Label`.

If the component is using [mapPropsToStyleObject](#mapPropsToStyleObject) and the target property is not the default `style` property then a child component class name is inferred and appended, eg: `com.fika.ImageLabel.Label`.

If no style declaration matches the computed class name no action is taken.

Global plugins in the default configuration handle the `className` property first before processing plugins that map properties to styles, so your component properties overwrite those in style declarations referenced by `className`.

Property plugins enabled with the `extendedProperties` option (or custom plugins) are executed next so they override property mappings and `className`.

Finally any styles given in the `style` property take precedence.
