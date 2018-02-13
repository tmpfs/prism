import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text} from 'react-native'
import {Prism, StyleRegistry} from '../src/Prism'

import theme from './bundle'
const registry = new StyleRegistry({theme, bundle: true})

class Bundle extends Component {
  static styleOptions = {
    supportsText: true,
    registry: registry
  }

  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <Text style={style}>{this.props.children}</Text>
    )
  }
}

export default Prism(Bundle, {styleName: 'Bundle'})
