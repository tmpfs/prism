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

const registry = new StyleRegistry({theme})
Prism.configure(
  registry,
  {
    debug: true,
    extendedProperties: true,
    experimentalPlugins: true,
    textTransform: true,
    colorNames: true,
    tintColor: true
  }
)

export default class App extends Component<{}> {
  render () {
    return (
      <ScrollView padding={20} background='base01'>

        <Panel label='Basic number stack'>
          <ChildStateStyle
            value={21}
            color='cream'
            size='small'
          >
          Small Style
          </ChildStateStyle>
          <ChildStateStyle
            value={21}
            color='cream'
            size='medium'
          >
          Medium Style
          </ChildStateStyle>
        </Panel>

        <Panel label='tintColor'>
          <Label>
            This is a component using tintColor from the Activity rule.
          </Label>
          <View justify='center' padding={15}>
            <Activity />
          </View>
          <Label>
            This is a component using tintColor from a className.
          </Label>
          <View justify='center' padding={15}>
            <Activity className='activity-tint' />
          </View>
          <Label>
            This is a component using tintColor from a property.
          </Label>
          <View justify='center' padding={15}>
            <Activity tintColor='blue' />
          </View>
        </Panel>

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
        <Panel label='className'>
          <Label className='highlight'>
            This is some text using the styles from className which override the class rule.
          </Label>
        </Panel>
        <Panel label='color'>
          <Label className='highlight' color='green'>
            This is some text using a color property to override the className and class rule.
          </Label>
        </Panel>
        <Panel label='style'>
          <Label className='highlight' color='green' style={{color: 'orange'}}>
            This is some text using an inline style to override color, className and the class rule.
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
      </ScrollView>
    )
  }
}

            //<Activity tintColor='base1' />
