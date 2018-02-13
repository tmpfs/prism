import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from '../src/Prism'

import Label from './Label'

class DefaultStyleLabel extends Component {
  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <Label style={style}>{this.props.children}</Label>
    )
  }
}

export default Prism(DefaultStyleLabel, 'DefaultStyleLabel')
