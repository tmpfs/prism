import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from '../src/Prism'

import SimpleLabel from './SimpleLabel'

class DefaultStyleLabel extends Component {
  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <SimpleLabel style={style}>{this.props.children}</SimpleLabel>
    )
  }
}

export default Prism(DefaultStyleLabel)
