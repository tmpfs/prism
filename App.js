/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  Text,
  View
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

import {Prism, StyleRegistry} from './src'
import Colors from './app/Colors'
import Fonts from './app/Fonts'
import StyleSheet from './app/StyleSheet'

const registry = new StyleRegistry()
registry.addColors(Colors)
registry.addFonts(Fonts)
registry.addStyleSheet(StyleSheet)
Prism.configure(registry)

const {styleSheet} = registry

class MockComponent extends Component {
  render() {
    return (
      <View style={styleSheet.container}>
        <Text style={styleSheet.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styleSheet.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styleSheet.instructions}>
          {instructions}
        </Text>
      </View>
    );
  }
}

const StyledComponent = Prism(MockComponent)

export default class App extends Component<{}> {
  render () {
    return (
      <StyledComponent />
    )
  }
}
