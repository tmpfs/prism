import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {

  static styleOptions = () => {
    return {
      mapStyleToProps: {
        tintColor: true,
        //textTransform: {text: 'transform'}
      },
      mapPropsToStyleObject: {
        label: []
      }
    }
  }

  render () {
    // Get the computed style sheet
    const {style, labelStyle, tintColor, text} = this.props
    console.log(tintColor)
    console.log(style.tintColor)
    console.log(labelStyle)
    console.log(text)
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(Label)
