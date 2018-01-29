import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Image, Text, View} from 'react-native'
import {Prism} from '../src/Prism'
import Label from './Label'

class ImageLabel extends Component {

  static styleOptions = () => {
    return {
      styleProperties: {
        // Maps to labelStyle.color
        label: ['color'],
        // Maps to imageStyle.width and imageStyle.height
        image: ['width', 'height']
      }
    }
  }

  static propTypes = {
    source: Image.propTypes.source,
    color: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    // Make sure our properties are validated correctly
    imageStyle: Prism.propTypes.style,
    labelStyle: Prism.propTypes.style
  }

  render () {
    const {style, imageStyle, labelStyle, width, height, source} = this.props
    return (
      <View style={style}>
        <Image
          width={width}
          height={height}
          source={source}
          style={imageStyle} />
        <Label style={labelStyle}>{this.props.children}</Label>
      </View>
    )
  }
}
export default Prism(ImageLabel)
