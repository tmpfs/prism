/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  View
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

import {Prism, StyleRegistry} from './src/Prism'
import Colors from './app/Colors'
import Fonts from './app/Fonts'
import StyleSheet from './app/StyleSheet'
import Label from './app/Label'

// Ensure example code compiles
import ImageLabel from './app/ImageLabel'

const config = {
  debug: true,
  extendedProperties: true,
  disabled: true,
  //additionalPlugins: [
    //[
      //'customPlugin',
      //() => {}
    //]
  //],
  //disabledPlugins: ['mapPropsToStyle', 'customPlugin']
}
const registry = new StyleRegistry()
registry.addColors(Colors)
registry.addFonts(Fonts)
registry.addStyleSheet(StyleSheet)
Prism.configure(registry, config)

export default class App extends Component<{}> {
  render () {
    return (
      <View style={{flex: 1}}>
        <Label
          padding={5}
          margin={[10, 20]}
          color='green'>Text</Label>
        <ImageLabel
          padding={5}
          margin={[10, 20]}>Text</ImageLabel>
      </View>
    )
  }
}
