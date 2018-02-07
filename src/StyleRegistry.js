import {Platform, StyleSheet} from 'react-native'

import util from './util'
const {isFunction, isObject, isString} = util

import {processor} from './Processor'

export default class StyleRegistry {
  fonts = {}
  sizes = {}
  colors = {}
  colorNames = []
  styles = {}
  styleSheet = {}
  invariants = {}

  constructor ({theme, bundle} = {}) {
    if (theme) {
      if (!bundle) {
        this.addTheme(theme)
      // When bundling we want to call styles() with the parent
      // colors and fonts merged
      } else {
        this._bundle = theme
      }
    }
  }

  assign (registry) {
    const bundle = registry._bundle
    this.mergeColors(registry.colors)
    this.mergeFonts(registry.fonts)
    registry.colors = this.colors
    registry.fonts = this.fonts
    registry.addStyleSheet(registry._bundle.styles)
    this.mergeStyles(registry.styles)
  }

  mergeColors (colors) {
    this.colors = Object.assign({}, colors, this.colors)
    this.colorNames = Object.keys(this.colors)
  }

  mergeFonts (fonts) {
    this.fonts = Object.assign({}, fonts, this.fonts)
  }

  mergeStyles (styles) {
    for (const selector in styles) {
      // Doesn't exist so create it
      if (this.styles[selector] === undefined) {
        this.styles[selector] = styles[selector]
      // Selective merge === this registry wins
      } else {
        const target = this.styles[selector]
        const source = styles[selector]
        for (const decl in source) {
          if (target[decl] === undefined) {
            target[decl] = source[decl]
          }
        }
      }
    }
  }

  addColors (colors) {
    this.colors =
      Object.assign(this.colors, colors)
    this.colorNames = Object.keys(this.colors)
  }

  addFonts (map) {
    if (!isObject(map)) {
      throw new Error('Prism registry fonts must be an object')
    }
    for (let k in map) {
      const fn = map[k]
      if (isFunction(fn)) {
        this.fonts[k] = fn(Platform.OS)
      } else if(isString(fn)) {
        this.fonts[k] = fn
      }
    }
  }

  addStyleSheet (styleSheet) {
    const {colors, fonts, colorNames} = this
    if (!isFunction(styleSheet) && !isObject(styleSheet)) {
      throw new Error('Prism registry styles must be a function or object')
    }
    if (isFunction(styleSheet)) {
      this.styles = Object.assign(
        {},
        styleSheet({colors, fonts, colorNames})
      )
    } else {
      this.styles = styleSheet
    }
  }

  addTheme (theme) {
    if (!isObject(theme)) {
      throw new Error('Prism theme should be an object')
    }
    if (theme.colors && !isObject(theme.colors)) {
      throw new Error('Prism theme colors should be an object')
    }
    if (theme.fonts && !isObject(theme.fonts)) {
      throw new Error('Prism theme fonts should be an object')
    }
    if (theme.styles && !isFunction(theme.styles)) {
      throw new Error('Prism theme styles should be a function')
    }
    if (theme.colors) {
      this.addColors(theme.colors)
    }
    if (theme.fonts) {
      this.addFonts(theme.fonts)
    }
    if (theme.styles) {
      this.addStyleSheet(theme.styles)
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

  //registerProxy () {
    //const proxy = {}
    //this._compiled = this.styleSheet
    //const keys = Object.keys(this._compiled)
    //keys.forEach((selector) => {
      //console.log('Adding selector to proxy: ' + selector)
      //Object.defineProperty(
        //proxy,
        //selector,
        //get: () => {
          //console.log('Getting style: ' + selector)
          //return this._compiled[selector]
        //}
      //)
    //})
  //}
  //
  //
  //

  has (selector) {
    return this.styleSheet[selector] || this.invariants[selector]
  }

  resolve (selector) {
    const sheets = []
    const {styleSheet, invariants} = this
    if (styleSheet[selector]) {
      sheets.push(styleSheet[selector])
    }
    if (invariants[selector]) {
      sheets.push(invariants[selector])
    }
    return sheets
  }

  select (selector, sheets) {
    const found = this.resolve(selector)
    if (found.length) {
      sheets.push.apply(sheets, found)
    }
    return sheets
  }

  // Called by a registry to extract rules with invariants
  // prior to compiling the styles
  extract (target, invariants) {
    const {config} = this
    const extracted = {}
    let selector, rule

    const expand = (rule) => {
      const keys = []
      const decl = {}
      invariants.forEach((name) => {
        if (rule[name] !== undefined) {
          keys.push(name)
          decl[name] = rule[name]
          delete rule[name]
        }
      })
      return {keys, decl}
    }

    for (selector in target) {
      rule = target[selector]
      const {keys, decl} = expand(rule)
      if (keys.length) {
        extracted[selector] = decl
      }
    }
    return extracted
  }

  // Called to finalize the registry internally
  // do not call this directly
  compile ({config}) {
    const {invariants} = config

    // Extract invariants before compilation
    this.invariants = this.extract(this.styles, invariants)

    if (config.debug) {
      const keys = Object.keys(this.invariants)
      if (keys.length) {
        console.log(`Invariants ${keys.length}`)
      }
      keys.forEach((selector) => {
        console.log(` | "${selector}"`)
        //console.log(this.invariants[selector])
      })
    }

    //console.log(Object.keys(this.invariants))
    this.styleSheet = StyleSheet.create(this.styles)

    // Configure proxy for invariant and platform handling
    //this.registerProxy()
  }
}
