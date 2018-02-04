import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'
import {Prism} from '../src/Prism'

import SimpleLabel from './SimpleLabel'

class CompositeLabel extends Component {

  static mapPropsToComponent = {
    header: true,
    body: ['color'],
    footer: [{footerColor: 'color'}]
  }

  render () {
    // Get the computed style sheet
    const {style, label, footer, headerStyle, bodyStyle, footerStyle} = this.props
    return (
      <View>
        <SimpleLabel style={headerStyle}>{label}</SimpleLabel>
        <SimpleLabel style={bodyStyle}>{this.props.children}</SimpleLabel>
        <SimpleLabel style={footerStyle}>{footer}</SimpleLabel>
      </View>
    )
  }
}

export default Prism(CompositeLabel)
