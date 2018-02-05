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
      mapPropsToStyle: {
        textTransform: ({prop}) => {
          return {textTransform: prop}
        },
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

  render () {
    // Get the computed style sheet
    const {style, text} = this.props
    //console.log('TEXT')
    //console.log(text)
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(SimpleLabel)
