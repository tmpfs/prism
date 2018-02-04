export default {
  colors: {
    cream: '#fdfbdf',
    muted: '#9a9a9a'
  },
  fonts: {
    regular: (os) => {
      return os === 'ios' ? 'WorkSans-Regular' : 'worksans'
    },
    medium: (os) => {
      return os === 'ios' ? 'WorkSans-Medium' : 'worksans_medium'
    }
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
