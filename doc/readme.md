<h1 align="center">Prism</h1>
<p align="center">Minimal, idiomatic style management for React Native.</p>
<p align="center">
  <img width="256" height="256" src="https://raw.githubusercontent.com/fika-community/prism/master/prism.png" />
</p>

***
<!-- @toc -->
***

## Installation

Use your preferred package manager for installation.

```
npm i react-native-prism
yarn add react-native-prism
```

## Synopsis

Prism is a library that returns a HOC (Higher Order Component) that exposes access to a style registry containing user-defined colors, fonts and styles.

It provides a simple yet flexible mechanism for mapping properties to styles and finding style declarations in the registry.

## Style Properties

By default plugins are enabled that expose the following properties on all styled components.

### className

`String | Array <String>`

Assign stylesheets to the component. When a string is given separate stylesheet names can be separated with whitespace.

### flex

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

The `row` boolean sets `flexDirection`, `wrap` sets `flexWrap` and `grow` sets the `flex` propety.

### direction

`String <row|column>`

Set the `flexDirection` style property.

<? @include components.md ?>
