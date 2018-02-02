import React, {Component} from 'react';
import {View} from 'react-native'
import {Prism, StyleRegistry} from './src/Prism'
import Colors from './app/Colors'
import Fonts from './app/Fonts'
import StyleSheet from './app/StyleSheet'

import Label from './app/Label'

const registry = new StyleRegistry()
registry.addColors(Colors)
registry.addFonts(Fonts)
registry.addStyleSheet(StyleSheet)
Prism.configure(
  registry,
  {
    debug: true,
    extendedProperties: true
  }
)

export default class App extends Component<{}> {
  render () {
    return (
      <Label
        margin={30}
        text={{transform: 'upper'}}
        >
        Text
      </Label>
    )
  }
}
