import React, {Component} from 'react'
import {Image, Text, View} from 'react-native'
import {Prism} from '../src/Prism'

class ImageLabel extends Component {

  static propTypes = {
    // Make sure our properties are validated correctly
    imageStyle: Prism.propTypes.style,
    labelStyle: Prism.propTypes.style
  }

  render () {
    const {style, imageStyle, labelStyle} = this.props
    return (
      <View style={style}>
        <Image style={imageStyle} {...this.props} />
        <Text style={labelStyle}>{this.props.children}</Text>
      </View>
    )
  }
}
export default Prism(ImageLabel)
