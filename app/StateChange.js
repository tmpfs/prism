import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, View, Button} from 'react-native'
import {Prism} from '../src/Prism'

import Label from './Label'

class StateChange extends Component {

  static styleOptions = {
    // Prevent double render on mount
    // as we are going to call setStyleState()
    // manually in componentWillMount()
    manual: true
  }

  static mapPropsToStyle = {
    state: ({prop, state, setState}) => {
      if (state.active) {
        return setState('active')
      }
    }
  }

  static mapStyleToProps = {
    headerStyle: {},
    bodyStyle: {
      color: () => true
    },
    footerStyle: {
      footerColor: 'color'
    }
  }

  state = {
    active: true
  }

  componentWillMount () {
    // Set state from our initial instance state
    // so if we set active to `true` the style
    // will be applied when the component first renders
    const {setStyleState} = this.props
    setStyleState(this.state)
  }

  render () {
    const changeState = () => {
      this.setState({active: !this.state.active})
    }
    // Get the computed style sheet
    const {style, label, footer, headerStyle, bodyStyle, footerStyle} = this.props
    return (
      <View style={style}>
        <Label style={headerStyle}>{label}</Label>
        <Label style={bodyStyle}>{this.props.children}</Label>
        <Label style={footerStyle}>{footer}</Label>
        <Button title='Toggle' onPress={changeState} />
      </View>
    )
  }
}

export default Prism(StateChange)
