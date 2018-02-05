export default {
  colors: {
    cream: '#fdfbdf',
    muted: '#9a9a9a',
    orange: '#ff3300',
    textColor: '#666666',
    bodyTextColor: '#000000',

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
      highlight: {
        color: colors.cyan
      },
      DefaultStyleLabel: {
        fontSize: 18,
        color: colors.orange
      },
      'Panel': {
        marginBottom: 30,
        //textTransform: 'uppercase'
      },
      'Panel.Header': {
        backgroundColor: colors.base03,
        padding: 10,
        // FIXME: for child classes
        textTransform: 'uppercase'
      },
      'Panel.Body': {
        backgroundColor: colors.base02,
        padding: 10,
        textTransform: 'uppercase'
      },
      SimpleLabel: {
        fontFamily: fonts.regular
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
        color: colors.textColor
      },
      'CompositeLabel.Footer': {
        fontSize: 16,
        marginTop: 10
      },
      'Activity': {
        tintColor: 'blue'
      },
      'ChildStateStyle.Title:small': {
        fontSize: 16
      },
      'ChildStateStyle.Number:small': {
        fontSize: 40
      },
      'ChildStateStyle.Title:medium': {
        fontSize: 20
      },
      'ChildStateStyle.Number:medium': {
        fontSize: 55
      },
      'ChildStateStyle.Title:large': {
        fontSize: 24
      },
      'ChildStateStyle.Number:large': {
        fontSize: 70
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
