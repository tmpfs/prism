import React, {Component} from 'react';
import {Prism, StyleRegistry} from './src/Prism'
import Colors from './app/Colors'
import Fonts from './app/Fonts'
import StyleSheet from './app/StyleSheet'

import Layout from './app/Layout'
import Label from './app/Label'
import Square from './app/Square'
import ImageLabel from './app/ImageLabel'

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

const image = 'https://raw.githubusercontent.com/fika-community/prism/master/prism.png'

export default class App extends Component<{}> {
  render () {
    return (
      <Layout background='backgroundGreen'>
        <Layout
          margin={20}
          padding={10}
          background='green'
          border={[4, 'cream']}>
            <ImageLabel
              border='cream'
              padding={20}
              margin={[10, 20]}
              width={96}
              height={96}
              size={24}
              error
              source={{uri: image}}>Prism</ImageLabel>

            <Label
              border='cream'
              padding={20}
              align='center'
              color='muted'
              size={18}
              margin={[10, 20]}>
                Minimal, idiomatic style management for React Native.
              </Label>

            <Layout direction='row' justify='center'>
              <Square margin={15} />
              <Square margin={15} />
              <Square margin={15} />
            </Layout>
          </Layout>
      </Layout>
    )
  }
}
