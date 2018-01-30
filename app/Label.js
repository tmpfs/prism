import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../src/Prism'

class Label extends Component {
  static styleOptions = ({styleSheet}) => {
    return {
      colorNames: ['color'],
      mapPropsToStyleDecl: {
        error: styleSheet.error
      },
      mapPropsToStyleProp: {
        size: 'fontSize',
        align: 'textAlign'
      }
    }
  }

  static propTypes = {
    color: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    size: PropTypes.number
  }

  /*
  static mapPropsToStyle = {
    align: ({prop}) => {
      if (prop) {
        return {textAlign: prop}
      }
    },
    size: ({prop}) => {
      if (prop) {
        return {fontSize: prop}
      }
    }
  }
  */

  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

//export default Prism(Label, 'com.fika.text')
export default Prism(Label)
