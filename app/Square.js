import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Prism} from '../src/Prism'

import Layout from './Layout'
import Colors from './Colors'

class Rectangle extends Component {
  static styleOptions = () => {
    return {
      merge: ['style'],
      styleProperties: {
        style: ['width', 'height']
      }
    }
  }

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
  }

  static defaultProps = {
    width: 20,
    height: 20,
    background: Colors.cream
  }

  render () {
    const {style, background} = this.props
    return (
      <Layout flex={0} background={background} style={style} />
    )
  }
}

export default Prism(Rectangle)
