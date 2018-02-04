import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
  static mapPropsToComponent = {
    foo: ['color']
  }
  render () {
    // Get the computed style sheet
    const {style, fooStyle} = this.props
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(Label)
