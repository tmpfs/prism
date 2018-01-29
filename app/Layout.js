import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'
import {Prism} from '../src/Prism'

class Layout extends Component {

  static propTypes = {
    background: PropTypes.string
  }

  render () {
    // Get the computed style sheet
    const {style} = this.props
    return (
      <View style={style}>{this.props.children}</View>
    )
  }
}

//export default Prism(Label, 'com.fika.text')
export default Prism(Layout)
