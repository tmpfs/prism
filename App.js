import React, {Component} from 'react';
import {ScrollView as NativeScrollView} from 'react-native'
import {Prism, StyleRegistry} from './src/Prism'

import View from './app/View'
import Panel from './app/Panel'
import Activity from './app/Activity'
import Label from './app/SimpleLabel'
import DefaultStyleLabel from './app/DefaultStyleLabel'
import CompositeLabel from './app/CompositeLabel'
import ChildStateStyle from './app/ChildStateStyle'
import theme from './app/theme'

const ScrollView = Prism(NativeScrollView)

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

        //<Panel label='Basic number stack'
          //background='grey'
          //separation={10}
          //color='white'
          //bg='black'
          //margin={20}
          //>
          //<ChildStateStyle
            //value={21}
            //color='cream'
            //size='large'
          //>
          //Statistic
          //</ChildStateStyle>
        //</Panel>
        //<SimpleLabel margin={10}>
          //This is label with color from defaultProps
        //</SimpleLabel>
        //<SimpleLabel className='mySimpleLabel' margin={10}>
          //This is label with color from className style
        //</SimpleLabel>
        //<SimpleLabel className='mySimpleLabel' color='blue' margin={10}>
          //This is label with color from property name which overrides className
        //</SimpleLabel>
        //<SimpleLabel className='mySimpleLabel' color='blue' style={{color: 'purple'}} margin={10}>
          //This is label with color from inline styles which overrides the property name and className
        //</SimpleLabel>
        //<SimpleLabel margin={10} padding={10} background='black' color='white'>
          //This is a label using some padding
        //</SimpleLabel>
        //<SimpleLabel
          //margin={10}
          //padding={10}
          //background='black'
          //color='white'
          //style={{color: 'black', backgroundColor:'grey'}}>

          //This is a label using some padding with inline style overrides

        //</SimpleLabel>
        //<DefaultStyleLabel margin={10}>
          //This is label with whose color is set from the DefaultStyleLabel css declaration which overrides the defaultProps for the wrapped SimpleLabel
        //</DefaultStyleLabel>

        //<CompositeLabel
          //color='bodyTextColor'
          //margin={10}
          //label='Composite label example'
          //footerColor='purple'
          //footer='Footer text with property routing and rewriting footerColor -> footerStyle.color'>
          //This is some body text for the composite label which should be red because we assigned it to the parent component which routes the property to bodyStyle. The header is styled green from a style sheet declaration and the footer uses a mapStyleToComponent to map footerColor -> footerStyle.color.
        //</CompositeLabel>
        //<View justify='center' padding={15}>
          //<Activity />
        //</View>

export default class App extends Component<{}> {
  render () {
    return (
      <ScrollView padding={20} background='base01'>

        <Panel label='font'>
          <View font={{size: 'large', color: 'cream'}}>
            <View>
              <Label>
                This is some text that illustrates how text style props are inherited
                from the parent hierarchy.

                We add a <Label bold textTransform='uppercase'>large</Label> size to the grandparent View which propagates through the children using childContext.
              </Label>

              <Label font={{size: 'medium'}}>
                When it reaches the Label component it is applied to the underlying Text component.
              </Label>

              <Label font={{color: 'skyblue', size: 'small'}}>
                This paragraph overrides the grandparent color and size.
              </Label>
            </View>
          </View>
        </Panel>

        <Panel label='textTransform'>
          <Label textTransform='uppercase'>
            This is some uppercase text <Label textTransform='lowercase'>with some lowercase text in a Label</Label> in a paragraph. <Label textTransform='capitalize'>We can capitalize too</Label>. But we cannot apply none (undo) once a parent is transformed :(
          </Label>
        </Panel>

        <Panel label='defaultProps'>
          <Label>
          This is some text using the styles from defaultProps.
          </Label>
        </Panel>
        <Panel label='className'>
          <Label className='highlight'>
            This is some text using the styles from className which override the defaultProps.
          </Label>
        </Panel>
        <Panel label='color'>
          <Label className='highlight' color='green'>
            This is some text using a color property to override the className and defaultProps.
          </Label>
        </Panel>
        <Panel label='style'>
          <Label className='highlight' color='green' style={{color: 'orange'}}>
            This is some text using an inline style to override color, className and defaultProps.
          </Label>
        </Panel>

        <Panel label='extended'>
          <Label
            background='base3'
            color='base03'
            radius={5}
            margin={5}
            padding={15}>
            This is a label to test various extended properties.
          </Label>
        </Panel>

        <Panel label='mapStyleToProp'>
          <Label textTransform='capitalize'>
            This is a component using mapStyleToProp to extract tintColor.
          </Label>
          <View justify='center' padding={15}>
            <Activity tintColor='green' />
          </View>
        </Panel>
      </ScrollView>
    )
  }
}

            //<Activity tintColor='base1' />
