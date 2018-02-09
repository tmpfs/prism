import {Platform, StyleSheet} from 'react-native'

import util from './util'
const {isFunction, isObject, isString} = util

import {processor} from './Processor'

export default class StyleRegistry {
  fonts = {}
  // Must not be the empty object
  sizes = undefined
  colors = {}
  colorNames = []
  styles = {}
  invariants = {}

  _styleSheet = {}
  _selectors = []
  _proxySheet = {}

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

  get styleSheet () {
    return this._proxySheet
  }

  set styleSheet (styles) {
    this._selectors = Object.keys(styles)
    this._styleSheet = StyleSheet.create(styles)
    // Configure proxies so named access always
    // resolves invariants
    this._selectors.forEach((selector) => {
      Object.defineProperty(this._proxySheet, selector, {
        enumerable: true,
        configurable: false,
        get: () => {
          return this.resolve(selector)
        }
      })
    })
  }

  get selectors () {
    return this._selectors
  }

  // Used when merging bundled styles
  assign (registry) {
    const bundle = registry._bundle
    // Compute preliminaries for bundle
    registry.addColors(registry._bundle.colors)
    registry.addFonts(registry._bundle.fonts)

    // Merge into this instance - if we already have it, it wins
    this.mergeColors(registry.colors)
    this.mergeFonts(registry.fonts)

    // Assign updated values before computing styles()
    registry.colors = this.colors
    registry.fonts = this.fonts
    registry.addStyleSheet(registry._bundle.styles)

    // Selective merge with this registry styles
    this.mergeStyles(this.styles, registry.styles)
  }

  mergeColors (colors) {
    this.colors = Object.assign({}, colors, this.colors)
    this.colorNames = Object.keys(this.colors)
  }

  mergeFonts (fonts) {
    this.fonts = Object.assign({}, fonts, this.fonts)
  }

  mergeStyles (receiver, styles, overrides = false) {
    for (const selector in styles) {
      // Doesn't exist so create it
      if (receiver[selector] === undefined) {
        receiver[selector] = styles[selector]
      // Selective merge === this registry wins
      } else {
        const target = receiver[selector]
        const source = styles[selector]
        for (const decl in source) {
          if (overrides || target[decl] === undefined) {
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
    if (map && !isObject(map)) {
      throw new Error('Prism registry fonts must be an object')
    }
    if (map) {
      for (const k in map) {
        const font = map[k]
        if(isString(font)) {
          this.fonts[k] = font
        } else if (isObject(font)) {
          this.fonts[k] = Platform.select(font)
        } else {
          throw new Error(
            `Prism unexpected font declaration, need string or object, got ${typeof(font)}`)
        }
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

    const {ios, android} = this.styles

    if (ios) {
      delete this.styles.ios
    }

    if (android) {
      delete this.styles.android
    }

    if (ios || android) {
      this.mergeStyles(this.styles, Platform.select({ios, android}), true)
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

  has (selector) {
    return this.styleSheet[selector] || this.invariants[selector]
  }

  getChildClassName (ns, childClassName) {
    childClassName = childClassName.replace(/Style$/, '')
    return ns.getClassName() + ' ' + childClassName
  }

  pseudo (name, ns, child) {
    if (ns) {
      let selector
      // This gives us the top-level component
      if (child === 'style') {
        selector = ns.getClassName() + ':' + name
      } else{
        selector = this.getChildClassName(ns, child) + ':' + name
      }
      return selector
    }
    return name
  }

  id (name, ns, child) {
    return '#' + name
  }

  className (name, ns, child) {
    return '.' + name
  }

  type (name, ns, child) {
    // TODO: support mutating in namespace context
    return name
  }

  resolve (selector) {
    const sheets = []
    const {_styleSheet, invariants} = this
    if (_styleSheet[selector]) {
      sheets.push(_styleSheet[selector])
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
    //return sheets
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

    //console.log(Object.keys(this.invariants))
    this.styleSheet = this.styles

    if (config.debug) {
      const keys = Object.keys(this.invariants)
      if (keys.length) {
        console.log(`Invariants ${keys.length}`)
      }
      keys.forEach((selector) => {
        console.log(` | "${selector}"`)
      })

      if (this.selectors.length) {
        console.log(`Selectors ${this.selectors.length}`)
      }
      this.selectors.forEach((selector) => {
        console.log(` | "${selector}"`)
      })
    }
  }
}
