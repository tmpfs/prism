## Cascade

It can be useful to know some of the internals of how styles are computed.

Generally speaking these are the actions taken:

1. Default styles are applied.
2. Global plugins are executed.
3. Property plugins are executed.
4. Child component styles are computed.
5. Inline styles are applied.

Default styles start with any values in a style declaration inferred using the component class name, eg: `Label` when available. If the component is namespaced it is prefixed with the namespace and a period, eg: `com.prism.ui.Label`.

At this point, global plugins that handle [mapping properties to styles](mapping-properties-to-styles) are executed.

Then the property plugins which handle the extended and experimental properties are executed as well as any custom property plugins.

Subsequently the [mapStyleToComponent](mapstyletocomponent) plugin is executed to create styles for child components, during this phase a child component style sheet (eg: `com.prism.ui.Panel.Header`) is added when present.

Finally any styles given in the `style` property take precedence.
