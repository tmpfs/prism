import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Image, Text, View} from 'react-native'
import {Prism} from '../src/Prism'
import Label from './Label'

class ImageLabel extends Component {

  static styleOptions = ({styleSheet}) => {
    return {
      colorNames: ['color'],
      mapPropsToObject: {
        labelProps: {
          size: 'size',
          error: 'error'
        },
        imageProps: ['source']
      },
      mapPropsToStyleDecl: {
        row: styleSheet.row
      },
      styleProperties: {
        // Maps color -> labelStyle.color and space -> labelStyle.marginTop
        label: ['color', ['space', 'marginTop']],
        // Maps to imageStyle.width and imageStyle.height
        image: ['width', 'height']
      }
    }
  }

  static propTypes = {
    imageProps: PropTypes.object,
    labelProps: PropTypes.object,
    source: Image.propTypes.source,
    color: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    space: PropTypes.number,
    size: PropTypes.number
  }

  static defaultProps = {
    space: 10,
    imageProps: {},
    labelProps: {}
  }

  render () {
    const {
      style,
      imageStyle,
      labelStyle,
      imageProps,
      labelProps,
      width,
      height
    } = this.props
    return (
      <View style={style}>
        <Image
          width={width}
          height={height}
          {...imageProps}
          style={imageStyle} />
        <Label
          {...labelProps}
          style={labelStyle}>{this.props.children}</Label>
      </View>
    )
  }
}
export default Prism(ImageLabel)
