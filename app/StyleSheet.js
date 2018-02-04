export default ({colors, fonts}) => {
  return {
    Label: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.cream
    },
    mySimpleLabel: {
      color: 'green'
    },
    DefaultStyleLabel: {
      color: 'orange'
    },
    'CompositeLabel': {
      margin: 20
    },
    'CompositeLabel.Header': {
      color: 'green',
      marginBottom: 5
    },
    'CompositeLabel.Body': {
      color: colors.textColor
    },
    'CompositeLabel.Footer': {
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
