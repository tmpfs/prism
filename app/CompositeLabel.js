import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, View} from 'react-native'
import {Prism} from '../src/Prism'

import Label from './Label'

class CompositeLabel extends Component {

  //static mapStyleToProps = {
    //headerStyle: [],
    //bodyStyle: ['color'],
    //footerStyle: [{footerColor: 'color'}]
  //}

  static mapStyleToProps = {
    headerStyle: {},
    bodyStyle: {
      color: () => true
    },
    footerStyle: {
      footerColor: 'color'
    }
  }

  render () {
    // Get the computed style sheet
    const {style, label, footer, headerStyle, bodyStyle, footerStyle} = this.props
    return (
      <View style={style}>
        <Label style={headerStyle}>{label}</Label>
        <Label style={bodyStyle}>{this.props.children}</Label>
        <Label style={footerStyle}>{footer}</Label>
      </View>
    )
  }
}

export default Prism(CompositeLabel)
