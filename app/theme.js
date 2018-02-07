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
      Label: {
        fontSize: 17,
        fontFamily: fonts.regular,
        color: colors.base1
      },
      Bundle: {
        color: 'cyan'
      },
      'com.example.text.Label': {
        fontSize: 17,
        fontFamily: fonts.regular,
        color: colors.magenta
      },
      highlight: {
        color: colors.cyan
      },
      DefaultStyleLabel: {
        fontSize: 18
      },
      'Panel': {
        marginBottom: 30,
      },
      'Panel.Header': {
        backgroundColor: colors.base02,
        padding: 10,
        textTransform: 'capitalize'
      },
      'Panel.Body': {
        backgroundColor: colors.base03,
        padding: 20
      },
      'Panel.Label': {
        fontFamily: fonts.medium,
        color: colors.base2,
        fontSize: 18
        //textTransform: 'uppercase'
      },
      'CompositeLabel': {
        margin: 20
      },
      'CompositeLabel.Header': {
        fontSize: 18,
        color: 'green',
        marginBottom: 5
      },
      'CompositeLabel.Body': {
        fontSize: 20,
        color: colors.base01
      },
      'CompositeLabel.Footer': {
        fontSize: 16,
        marginTop: 10
      },
      'Activity': {
        tintColor: 'red'
      },
      'activity-tint': {
        tintColor: 'green'
      },
      'NumberStack.Title:small': {
        fontSize: 16
      },
      'NumberStack.Number:small': {
        fontSize: 40
      },
      'NumberStack.Title:medium': {
        fontSize: 20
      },
      'NumberStack.Number:medium': {
        fontSize: 55
      },
      'NumberStack.Title:large': {
        fontSize: 24
      },
      'NumberStack.Number:large': {
        fontSize: 70
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
