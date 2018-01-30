import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      mapPropsToStyleDecl: () => {
        error: styleSheet.error
      },
      mapPropsToStyleProp: {
        size: 'fontSize',
        align: 'textAlign'
      }
    }
  }

  static mapPropsToStyle = {
    center: () => {
      console.log('GOT CENTER PROP ON LABEL')
    }
  }

  static propTypes = {
    color: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.number
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
