import {Platform, StyleSheet} from 'react-native'

export default class StyleRegistry {
  fonts = {}
  colors = {}
  colorNames = []
  colorProperties = []
  styles = {}
  styleSheet = null

  addColors (colors) {
    this.colors =
      Object.assign(this.colors, colors)
    this.colorNames = Object.keys(this.colors)
  }

  addFonts (map) {
    for (let k in map) {
      const fn = map[k]
      this.fonts[k] = fn(Platform.OS)
    }
  }

  addStyleSheet (styleSheet) {
    const {colors, fonts, colorNames, colorProperties} = this

    // styleSheet should be a function
    this.styles = Object.assign(
      {},
      styleSheet({colors, fonts, colorNames, colorProperties})
    )

    // Compile the raw styles
    this.styleSheet = StyleSheet.create(this.styles)
  }
}
