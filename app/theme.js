export default {
  colors: {
    base03:    '#002b36',
    base02:    '#073642',
    base01:    '#586e75',
    base00:    '#657b83',
    base0:     '#839496',
    base1:     '#93a1a1',
    base2:     '#eee8d5',
    base3:     '#fdf6e3',
    yellow:    '#b58900',
    orange:    '#cb4b16',
    red:       '#dc322f',
    magenta:   '#d33682',
    violet:    '#6c71c4',
    blue:      '#268bd2',
    cyan:      '#2aa198',
    green:     '#859900',
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      android: {
        Label: {
          // This tests selective merge
          // on platform-specific styles
          //color: 'red'
        }
      },
      Label: {
        fontSize: 17,
        fontFamily: fonts.regular,
        color: colors.base1
      },
      Bundle: {
        color: 'cyan'
      },
      'StateChange:active': {
        backgroundColor: 'red'
      },
      'example|Label': {
        fontSize: 17,
        fontFamily: fonts.regular,
        color: colors.magenta
      },
      '.highlight': {
        color: colors.cyan
      },
      DefaultStyleLabel: {
        fontSize: 18
      },
      'Panel': {
        marginBottom: 30,
      },
      'Panel header': {
        backgroundColor: colors.base02,
        padding: 10,
        textTransform: 'capitalize'
      },
      'Panel body': {
        backgroundColor: colors.base03,
        padding: 20
      },
      'Panel label': {
        fontFamily: fonts.medium,
        color: colors.base2,
        fontSize: 18
        //textTransform: 'uppercase'
      },
      'CompositeLabel': {
        margin: 20
      },
      'CompositeLabel header': {
        fontSize: 18,
        color: 'green',
        marginBottom: 5
      },
      'CompositeLabel body': {
        fontSize: 20,
        color: colors.base01
      },
      'CompositeLabel footer': {
        fontSize: 16,
        marginTop: 10
      },
      'Activity': {
        tintColor: 'red'
      },
      '.activity-tint': {
        tintColor: 'green'
      },
      'NumberStack title:small': {
        fontSize: 16
      },
      'NumberStack number:small': {
        fontSize: 40
      },
      'NumberStack title:medium': {
        fontSize: 20
      },
      'NumberStack number:medium': {
        fontSize: 55
      },
      'NumberStack title:large': {
        fontSize: 24
      },
      'NumberStack number:large': {
        fontSize: 70
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
