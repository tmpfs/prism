import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View as NativeView} from 'react-native'
import {Prism} from '../src/Prism'

class View extends Component {
  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <NativeView style={style}>{this.props.children}</NativeView>
    )
  }
}

export default Prism(View, 'View')
