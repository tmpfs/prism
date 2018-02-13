import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from 'react-native-prism'
import View from './View'

import Label from './Label'

class NumberStack extends Component {

  //static styleOptions = {
    //flat: true
  //}

  static mapPropsToStyle = {
    titleStyle: {
      size: ({css, prop}) => css.pseudo(prop)
    },
    numberStyle: {
      size: ({css, prop}) => css.pseudo(prop)
    }
  }

  //static mapStyleToProps = {
    //titleStyle: {
      //textTransform: ({prop}) => {
        //console.log('mapStyleToProps on child style')
        //return prop
      //}
    //}
  //}

  static propTypes = {
    value: PropTypes.number,
    color: PropTypes.string,
    bold: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
  }

  static defaultProps = {
    bold: true,
    size: 'medium',
    align: 'center',
    style: {
      padding: 10,
      textTransform: 'capitalize'
    }
  }

  render() {
    const {
      style,
      align,
      color,
      bold,
      value,
      textTransform,
      titleStyle,
      numberStyle
    } = this.props

    const center = (align === 'center')
    let ellipsis
    if (align === 'right') {
      ellipsis='head'
    }

    //console.log(style)
    //console.log(titleStyle)
    //console.log(textTransform)

    const title = (
      <Label
        align={align}
        bold={bold}
        color={color}
        textTransform={textTransform}
        ellipsis={ellipsis}
        style={titleStyle}>
        {this.props.children}
      </Label>
    )

    const num = (
      <Label
        align={align}
        bold={bold}
        ellipsis={ellipsis}
        style={numberStyle}>
        {value.toString()}
      </Label>
    )

    return (
      <View center={center} style={style}>
        {title}
        {num}
      </View>
    )
  }
}

export default Prism(NumberStack, 'NumberStack')
