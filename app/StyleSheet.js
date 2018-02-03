export default ({colors, fonts}) => {
  return {
    Label: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.cream,
      tintColor: colors.orange,
      textTransform: 'uppercase'
    },
    bold: {
      fontFamily: fonts.medium
    }
  }
}
