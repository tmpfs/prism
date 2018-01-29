import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Image, Text, View} from 'react-native'
import {Prism} from '../src/Prism'
import Label from './Label'

class ImageLabel extends Component {

  static styleOptions = () => {
    return {
      //styleProperties: ['labelStyle', 'imageStyle']
      //styl
      styleProperties: {
        label: ['color'],
        image: ['position']
      }
    }
  }

  static propTypes = {
    color: PropTypes.string,
    // Make sure our properties are validated correctly
    imageStyle: Prism.propTypes.style,
    labelStyle: Prism.propTypes.style
  }

  render () {
    const {style, imageStyle, labelStyle, color} = this.props
    return (
      <View style={style}>
        <Image style={imageStyle} />
        <Label color={color} style={labelStyle}>{this.props.children}</Label>
      </View>
    )
  }
}
export default Prism(ImageLabel)
