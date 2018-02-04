import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ActivityIndicator} from 'react-native'
import {Prism} from '../src/Prism'

const colors = {
  tint: '#5affda'
}

class Activity extends Component {

  static styleOptions = () => {
    return {
      //mapPropsToComponent: {
        //activityIndicator: []
      //},
      mapStyleToProp: {
        tintColor: true,
      }
    }
  }

  static propTypes = {
    large: PropTypes.bool,
    tintColor: PropTypes.string,
  }

  static defaultProps = {
    size: 'large',
    labelProps: {},
    style: {
      flex: 1
    },
    tintColor: 'red'
  }

  render() {
    const {
      style,
      activityIndicatorStyle,
      large,
      tintColor,
      labelProps
    } = this.props

    console.log('default tint color: ' + Activity.defaultProps.tintColor)
    console.log('final tint color: ' + tintColor)

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
