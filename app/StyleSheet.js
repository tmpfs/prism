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
      color: 'green'
    },
    'CompositeLabel.Body': {
      color: 'blue'
    },
    bold: {
      fontFamily: fonts.medium
    }
  }
}
