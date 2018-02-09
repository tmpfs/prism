import React, {Component} from 'react'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
  static styleOptions = {
    supportsText: true
  }

  static mapPropsToStyle = {
    '*': () => {
      //console.log('wildcard called!!!!')
    }
  }

  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(Label)
