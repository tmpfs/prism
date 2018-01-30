export default ({colors, fonts}) => {
  return {
    Layout: {
      flex: 1
    },
    Label: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.cream
    },
    ImageLabel: {
      flex: 1,
      alignItems: 'center'
    },

    // Utils
    row: {
      flexDirection: 'row'
    },
    error: {
      color: 'red'
    }
  }
}
