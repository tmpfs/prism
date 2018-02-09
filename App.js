import React, {Component} from 'react';
import {ScrollView as NativeScrollView} from 'react-native'
import {Prism, StyleRegistry} from './src/Prism'

import View from './app/View'
import Panel from './app/Panel'
import Activity from './app/Activity'
import Label from './app/Label'
import StateChange from './app/StateChange'
import NumberStack from './app/NumberStack'
import Bundle from './app/Bundle'

import NamespaceExample from './app/NamespaceExample'

import theme from './app/theme'

const ScrollView = Prism(NativeScrollView)

const Rectangle = Prism.style(
  View,
  {
    flex: 0,
    width: 20,
    height: 20,
    backgroundColor: 'green'
  }
)

const registry = new StyleRegistry({theme})
Prism.configure(
  registry,
  {
    extendedProperties: true,
    fontProperties: true,
    experimentalPlugins: true,
    textTransform: true,
    colorNames: true,
    withState: true,
    pure: false
  }
)

export default class App extends Component<{}> {
  render () {
    return (
      <ScrollView padding={20} background='base01'>

        <Panel label='State Change'>
          <StateChange>
            State Text
          </StateChange>
        </Panel>

        <Panel label='Extended Properties'>
          <Label
            background='magenta'
            color='base3'
            align='center'
            bold
            size='large'
            radius={5}
            padding={15}>
            This is a label to test various extended properties, it sets background, color, radius and padding.
          </Label>
        </Panel>

        <Panel label='Style Bundle'>
          <Bundle>
            This is an example of bundling default component styles. The <Label color='base1'>bundle.js</Label> file is supplied with the component and we selectively overwrite the color property in <Label color='base1'>theme.js</Label>.
          </Bundle>
        </Panel>

        <Panel label='Quick Components'>
          <Label>
            This example demonstrates use of Prism.style() to quickly create shapes.
          </Label>
          <View flex={1} justify='center' style={{alignItems: 'center'}}>
            <Rectangle
              width={50}
              height={50}
              background='blue'
              margin={{top: 20}}
              justify='center'
              style={{alignItems: 'center'}}>
              <Rectangle />
            </Rectangle>
          </View>
        </Panel>


        <Panel label='Namespace'>
          <NamespaceExample>
            This is an example using the <Label color='base3'>com.example.text</Label> namespace for a component, the <Label color='base3'>com.example.text.Label</Label> style rule defines the component styles.
          </NamespaceExample>
        </Panel>

        <Panel label='Inheritance'>
          <Label margin={[5]}>
            This is some text using the class style declaration.
          </Label>
          <Label margin={[5]} className='highlight'>
            This is some text using the styles from className which override the class rule.
          </Label>
          <Label margin={[5]} className='highlight' color='green'>
            This is some text using a color property to override the className and class rule.
          </Label>
          <Label margin={[5]} className='highlight' color='green' style={{color: 'orange'}}>
            This is some text using an inline style to override color, className and the class rule.
          </Label>
        </Panel>

        <Panel label='Child Component' color='base00'>
          <Label>
            This is an example that illustrates routing a property to a child component, the text for this panel header should be a grey value extracted from the base00 color.
          </Label>
        </Panel>

        <Panel label='Child State'>
          <Label>
            This is an example that routes a size property to multiple child components which each resolve to state styles. It also routes textTransform to the child title component.
          </Label>
          <NumberStack
            value={21}
            color='base3'
            size='small'>
            Small Style
          </NumberStack>
          <NumberStack
            value={21}
            color='base3'
            size='medium'>
            Medium Style
          </NumberStack>

        </Panel>

        <Panel label='Invariant Inheritance'>
          <Label>
            This is an example to illustrate inheritance with the tintColor invariant. Colors should be the muted RGB values from the color names not the bright default HTML color names.
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
            <Activity className='activity-tint' tintColor='blue' />
          </View>
        </Panel>

        <Panel label='Text Transform'>
          <Label textTransform='uppercase'>
            This is some uppercase text <Label textTransform='lowercase'>with some lowercase text in a Label</Label> in a paragraph. <Label textTransform='capitalize'>We can capitalize too</Label>. But we cannot apply none (undo) once a parent is transformed :(
          </Label>
        </Panel>

        <Panel label='font'>
          <View font={{size: 'large', color: 'base3'}}>
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

      </ScrollView>
    )
  }
}

            //<Activity tintColor='base1' />
