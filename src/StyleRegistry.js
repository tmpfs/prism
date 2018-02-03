import {Platform, StyleSheet} from 'react-native'

import util from './util'
const {isFunction, isObject} = util

export default class StyleRegistry {
  fonts = {}
  sizes = {}
  colors = {}
  colorNames = []
  styles = {}
  styleSheet = {}
  styleInvariants = {}

  static assign (...registries) {
    const registry = new StyleRegistry()
    registries.forEach((reg) => {
      registry.addFonts(reg.fonts)
      registry.addColors(reg.colors)
      registry.addStyleSheet(reg.styles)

      registry.sizes = Object.assign(registry.sizes, reg.sizes)
      registry.styleInvariants = Object.assign(
        registry.styleInvariants, reg.styleInvariants)
    })
  }

  mergeColors (colors) {
    this.colors = Object.assign({}, colors, this.colors)
  }

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
    const {colors, fonts, colorNames} = this
    // TODO: validate style sheet is a function
    // styleSheet should be a function
    if (isFunction(styleSheet)) {
      this.styles = Object.assign(
        {},
        styleSheet({colors, fonts, colorNames})
      )
    } else if (isObject(styleSheet)) {
      this.styles = styleSheet
    }
  }


  // Lookup for font sizes is:
  //
  // 1. Component options `sizes`
  // 2. Style registry `sizes`
  // 3. Config `sizes`
  setFontSizes (sizes) {
    this.sizes = sizes
  }

  // Called to finalize the registry internally
  // do not call this directly
  compile ({config}) {
    const {invariants} = config
    if (invariants) {
      for (let decl in this.styles) {
        for (let styleProp in this.styles[decl]) {
          invariants.forEach((invariant) => {
            if (styleProp === invariant.stylePropName) {
              const value = this.styles[decl][styleProp]
              this.styleInvariants[decl] = Object.assign({}, invariant, {value})
              // Must delete to avoid StyleSheet.create() type validation error
              delete this.styles[decl][styleProp]
            }
          })
        }
      }
    }
    this.styleSheet = StyleSheet.create(this.styles)
  }
}
