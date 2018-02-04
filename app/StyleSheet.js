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
      color: 'blue',
    },
    'CompositeLabel.Footer': {
      marginTop: 10
    },
    'Activity': {
      tintColor: 'blue'
    },
    bold: {
      fontFamily: fonts.medium
    }
  }
}
