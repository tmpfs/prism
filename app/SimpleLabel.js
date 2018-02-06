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
      flat: true,
      mapPropsToStyle: {
        color: ({prop}) => prop,
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

  //static defaultProps = {
    //color: 'pink'
  //}

  render () {
    // Get the computed style sheet
    const {style} = this.props
    //console.log(style)
    //console.log('TEXT')
    //console.log(text)
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(SimpleLabel)
