import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

import theme from './theme'
const {colors} = theme

class SimpleLabel extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      supportsText: true,
      supportsTextTransform: true,
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
  }

  static defaultProps = {
    style: {
      color: colors.base2,
      fontSize: 16
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

export default Prism(SimpleLabel)
