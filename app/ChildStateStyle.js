import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from 'react-native-prism'
import View from './View'

import SimpleLabel from './SimpleLabel'

class ChildStateStyle extends Component {

  //static styleOptions = {
    //flat: true
  //}

  static mapPropsToStyle = {
    titleStyle: {
      size: ({state, prop}) => state(prop),
      //color: ({prop}) => {
        //return {color: prop}
      //}
    },
    numberStyle: {
      size: ({state, prop}) => state(prop)
    }
  }

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
    titleStyle: {
      color: 'red'
    }
  }

  render() {
    const {
      style,
      align,
      color,
      bold,
      value,
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

    const title = (
      <SimpleLabel
        align={align}
        bold={bold}
        color={color}
        ellipsis={ellipsis}
        style={titleStyle}>
        {this.props.children}
      </SimpleLabel>
    )

    const num = (
      <SimpleLabel
        align={align}
        bold={bold}
        ellipsis={ellipsis}
        style={numberStyle}>
        {value.toString()}
      </SimpleLabel>
    )

    return (
      <View center={center} style={style}>
        {title}
        {num}
      </View>
    )
  }
}

export default Prism(ChildStateStyle)
