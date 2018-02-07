export default {
  colors: {
    bg: 'steelblue',
    highlight: '#fdfbdf',
    normal: '#9a9a9a'
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      Label: {
        fontSize: 20,
        fontFamily: fonts.regular,
        color: colors.normal
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
