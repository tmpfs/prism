import React, {Component} from 'react';
import {Prism, StyleRegistry} from '../../src/Prism'
import theme from './theme'
import Label from './Label'

const registry = new StyleRegistry({theme})
Prism.configure(
  registry,
  {
    extendedProperties: true,
    fontProperties: true,
    experimentalPlugins: true,
    textTransform: true,
    colorNames: true
  }
)
export default class Application extends Component {
  render () {
    return (
      <Label
        background='bg'
        color='highlight'
        bold
        align='center'
        textTransform='capitalize'
        padding={15}>
        Prism example application
      </Label>
    )
  }
}
