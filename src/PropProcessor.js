import util from './util'
const {isObject} = util

class PropProcessor {

  static hasPreProcessors = false

  static map = {
    // Preprocessors keyed by styleName
    styles: {},
    // Preprocessors keyed by propStyleName
    props: {}
  }

  constructor (fn, styleName, propStyleName) {
    // Handler called when the property is encountered
    this.fn = fn
    // Name of the property in a style declaration
    this.styleName = styleName
    // Name of the property on a component
    this.propStyleName = propStyleName
  }

  static collate (config) {
    const {processors} = config
    if (!processors || !processors.length) {
      return
    }
    processors.forEach((proc) => {
      if (proc.styleName) {
        PropProcessor.map.styles[proc.styleName] = proc
      }
      if (proc.propStyleName) {
        PropProcessor.map.props[proc.propStyleName] = proc
      }

      PropProcessor.hasPreProcessors = true
    })
  }

  static get (propName, styles) {
    const {map} = PropProcessor
    return styles ? map.styles[propName] : map.props[propName]
  }

  static rewrite (config, target, styles = true) {
    const {processors} = config
    if (!PropProcessor.hasPreProcessors) {
      return
    }

    const {registry} = config

    let propName, propValue, proc
    for (propName in target) {
      propValue = target[propName]
      proc = PropProcessor.get(propName, styles)
      if (proc) {
        console.log('Found preprocessor for: ' + propName)
        console.log('Found preprocessor for: ' + propValue)
        //console.log(registry.colors)
        const res = proc.fn(
          {...registry, propName, propValue, ...proc})
        if (res !== undefined) {
          target[propName] = res
          //console.log('assigning result: ' + res)
        }
      }
      // Recurse for initial style declarations
      if (isObject(propValue)) {
        PropProcessor.rewrite(config, propValue, styles)
      }
    }
  }
}

export default PropProcessor
