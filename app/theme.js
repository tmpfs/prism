export default {
  colors: {
    cream: '#fdfbdf',
    muted: '#9a9a9a',
    orange: '#ff3300',
    textColor: '#666666',
    bodyTextColor: '#000000'
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      SimpleLabel: {
        fontFamily: fonts.regular
      },
      mySimpleLabel: {
        fontFamily: fonts.medium,
        fontSize: 18,
        color: 'green'
      },
      DefaultStyleLabel: {
        fontSize: 18,
        color: 'orange'
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
