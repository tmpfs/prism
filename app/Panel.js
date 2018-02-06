import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from 'react-native-prism'
import View from './View'
import Label from './SimpleLabel'

class Panel extends Component {

  //static mapStyleToProps = {
    //labelStyle: ['color'],
    //headerStyle: [{space: 'marginBottom', bg: 'backgroundColor'}],
    //bodyStyle: ['background']
  //}

  static mapStyleToProps = {
    labelStyle: {
      color: () => true
    },
    headerStyle: {
      space: () => 'marginBottom',
      bg: () => 'backgroundColor'
    },
    bodyStyle: {
      background: () => 'backgroundColor'
    }
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
        <View style={headerStyle}>
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
