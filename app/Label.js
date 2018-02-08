import React, {Component} from 'react'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
  static styleOptions = {
    supportsText: true
  }

  render () {
    // Get the computed style sheet
    const {style, styleSheet} = this.props
    return (
      <Text style={styleSheet.Label}>{this.props.children}</Text>
    )
  }
}

export default Prism(Label)
