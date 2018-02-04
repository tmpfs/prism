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
    bold: {
      fontFamily: fonts.medium
    }
  }
}
