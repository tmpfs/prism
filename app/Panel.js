import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from 'react-native-prism'
import View from './View'
import Label from './SimpleLabel'

class Panel extends Component {

  static mapStyleToComponent = {
    labelStyle: ['color'],
    headerStyle: [{space: 'marginBottom', bg: 'backgroundColor'}],
    bodyStyle: ['background']
  }

  static propTypes = {
    label: PropTypes.string,
    header: PropTypes.node
  }

  render () {
    const {style} = this.props
    let {
      labelStyle,
      headerStyle,
      headerText,
      bodyStyle,
    } = this.props

    let {label, header} = this.props

    if (label && !header) {
      header = (
        <Label
          style={labelStyle}>{label}</Label>
      )
    }

    return (
      <View style={style}>
        <View text={headerText} style={headerStyle}>
          {header}
        </View>
        <View style={bodyStyle}>
          {this.props.children}
        </View>
      </View>
    )
  }
}

export default Prism(Panel)
