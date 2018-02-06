import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ActivityIndicator} from 'react-native'
import {Prism} from '../src/Prism'

class Activity extends Component {

  static mapStyleToProps = {
    tintColor: ({prop}) => {
      //console.log('mapStyleToProps for tintColor on Activity')
      //console.log(prop)
      return prop
    }
  }

  static propTypes = {
    large: PropTypes.bool,
    tintColor: PropTypes.string,
  }

  static defaultProps = {
    labelProps: {}
  }

  render() {
    const {
      style,
      activityIndicatorStyle,
      large,
      tintColor,
      labelProps
    } = this.props

    const activitySize = large ? 'large' : 'small'

    // Default is no label
    let activity = (
      <ActivityIndicator
        size={activitySize}
        color={tintColor}
        style={activityIndicatorStyle} />
    )

    return activity
  }
}

export default Prism(Activity)
