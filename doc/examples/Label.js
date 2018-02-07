import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../../src/Prism'

class Label extends Component {
  static styleOptions = {
    supportsText: true,
    mapPropsToStyle: {
      align: ({prop, styleSheet}) => {
        return {textAlign: prop}
      },
      bold: ({prop, styleSheet}) => {
        if (styleSheet.bold !== undefined) {
          return styleSheet.bold
        }
        return {fontWeight: 'bold'}
      }
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
