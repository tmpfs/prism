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
          //console.log('map props align called!!!!')
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
      // We should never see this because
      // of the default class style rule
      // but if we remove it this value shoul
      // be used
      color: 'pink'
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
