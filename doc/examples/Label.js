import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism} from '../../src/Prism'

class Label extends Component {
  static styleOptions = {
    supportsText: true,
    mapPropsToStyle: {
      align: ({prop}) => {
        return {textAlign: prop}
      },
      bold: ({registry, propName}) => {
        console.log(propName)
        // Use a compiled `bold` style rule when available
        if (registry.has(propName)) {
          return registry.resolve(propName)
        }
        // Default behaviour
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
