export default {
  colors: {
    cream: '#fdfbdf',
    muted: '#9a9a9a'
  },
  fonts: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium'
  },
  styles: ({colors, fonts}) => {
    return {
      Label: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.cream
      },
      bold: {
        fontFamily: fonts.medium
      }
    }
  }
}
