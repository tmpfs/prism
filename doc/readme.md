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
npm i --save react-native-prism
yarn add react-native-prism
```

## Synopsis

Prism is a library that returns a HOC (Higher Order Component) which exposes access to a style registry containing user-defined colors, fonts and styles.

It provides a simple yet flexible mechanism for mapping properties to styles and finding style declarations in the registry.

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques in ~800 lines of code.

<? @include components.md ?>
<? @include configuration.md ?>
<? @include plugins.md ?>
<? @include cascade.md ?>
<? @include properties.md ?>

## Bugs

Some third-party components break the idiom of `style` being an array or object and enforce object only. There is currently no easy way to flatten the `style` array to an object for these component implementations. The best solution for now is to ask the author to fix the `propType`, otherwise just fork it and fix it.

## License

MIT

<? @include links.md ?>
