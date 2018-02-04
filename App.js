import React, {Component} from 'react';
import {ScrollView} from 'react-native'
import {Prism, StyleRegistry} from './src/Prism'

import View from './app/View'
import Panel from './app/Panel'
import Activity from './app/Activity'
import SimpleLabel from './app/SimpleLabel'
import DefaultStyleLabel from './app/DefaultStyleLabel'
import CompositeLabel from './app/CompositeLabel'
import ChildStateStyle from './app/ChildStateStyle'

import theme from './app/theme'
const registry = new StyleRegistry()
registry.addTheme(theme)
Prism.configure(
  registry,
  {
    debug: true,
    extendedProperties: true,
    experimentalPlugins: true
  }
)

export default class App extends Component<{}> {
  render () {
    return (
      <ScrollView>
        <Panel label='Basic number stack'
          background='grey'
          separation={10}
          color='white'
          bg='black'
          margin={20}
          >
          <ChildStateStyle
            value={21}
            color='cream'
            size='large'
          >
          Statistic
          </ChildStateStyle>
        </Panel>
        <SimpleLabel margin={10}>
          This is label with color from defaultProps
        </SimpleLabel>
        <SimpleLabel className='mySimpleLabel' margin={10}>
          This is label with color from className style
        </SimpleLabel>
        <SimpleLabel className='mySimpleLabel' color='blue' margin={10}>
          This is label with color from property name which overrides className
        </SimpleLabel>
        <SimpleLabel className='mySimpleLabel' color='blue' style={{color: 'purple'}} margin={10}>
          This is label with color from inline styles which overrides the property name and className
        </SimpleLabel>
        <SimpleLabel margin={10} padding={10} background='black' color='white'>
          This is a label using some padding
        </SimpleLabel>
        <SimpleLabel
          margin={10}
          padding={10}
          background='black'
          color='white'
          style={{color: 'black', backgroundColor:'grey'}}>

          This is a label using some padding with inline style overrides

        </SimpleLabel>
        <DefaultStyleLabel margin={10}>
          This is label with whose color is set from the DefaultStyleLabel css declaration which overrides the defaultProps for the wrapped SimpleLabel
        </DefaultStyleLabel>

        <CompositeLabel
          color='bodyTextColor'
          margin={10}
          label='Composite label example'
          footerColor='purple'
          footer='Footer text with property routing and rewriting footerColor -> footerStyle.color'>
          This is some body text for the composite label which should be red because we assigned it to the parent component which routes the property to bodyStyle. The header is styled green from a style sheet declaration and the footer uses a mapStyleToComponent to map footerColor -> footerStyle.color.
        </CompositeLabel>
        <View justify='center' padding={15}>
          <Activity />
        </View>
      </ScrollView>
    )
  }
}
