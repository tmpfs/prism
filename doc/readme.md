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

For any non-trival RN application the question arises on how to manage styles for your components. The Prism library provides a solution using idiomatic techniques that will leave your JSX clean and serene allowing you to more easily focus on your application's state and logic.

If you want to migrate an existing application you should start with [Prism Primitives][] which provides a drop-in replacement for the RN visual components. See [Prism Components][] for some *slightly* more advanced components; if you want to see a running application clone and run the RN app in the [Prism Components][] repository.

<? @include getting-started.md ?>
<? @include components.md ?>
<? @include properties.md ?>
<? @include configuration.md ?>
<? @include plugins.md ?>
<? @include cascade.md ?>

## License

MIT

<? @include links.md ?>
