import util from './util'
const {isObject} = util

class Rule {
  constructor (name, fn, properties, useProp) {
    this.name = name
    // Handler called when the property is encountered
    this.fn = fn
    // Name of the property in a style declaration
    this.properties = properties
    // Mark as executing when the property is defined
    this.useProp = useProp
  }
}

class Processor {
  config = null
  hasPreProcessors = false
  map = {}
  keys = []
  propertyNames = []

  collate (config) {
    const {processors} = config
    if (!processors || !processors.length) {
      return
    }
    processors.forEach((proc) => {
      let val = proc.properties
      if (val && !Array.isArray(val)) {
        val = [val]
      }
      //proc.properties = val
      val.forEach((v) => {
        this.map[v] = this.map[v] || []
        this.map[v].push(proc)
      })
      if (proc.useProp) {
        this.propertyNames = this.propertyNames.concat(val)
      }
      this.hasPreProcessors = true
    })

    this.keys = Object.keys(this.map)

    this.config = config
  }

  get (propName) {
    return this.map[propName]
  }

  run (proc, target, propName, propValue, pluginOptions) {
    const {config} = this
    const {registry} = config
    const expansions = {}
    const hasOptions = pluginOptions !== undefined
    let expanded = false

    const move = (newValue, newPropName, expand = false) => {
      newPropName = newPropName || propName
      if (expand) {
        expansions[newPropName] = newValue
        if (hasOptions) {
          pluginOptions.additionalProperties[newPropName] = newValue
        }
        expanded = true
      } else {
        target[newPropName] = newValue
      }
      // Writing a new property (expansion)
      // so delete the old one
      if (expand || (newPropName !== propName)) {
        delete target[propName]
      }
    }

    pluginOptions = pluginOptions || {}

    const procOptions = {
      ...pluginOptions,
      ...registry,
      propName,
      propValue,
      move
    }
    proc.fn(procOptions)

    if (expanded) {
      return expansions
    }
  }

  process (target, pluginOptions) {
    const {config} = this
    const {processors} = config
    if (!this.hasPreProcessors) {
      return
    }

    let expansions = {}

    this.keys.forEach((processorName) => {
      const procList = this.map[processorName]
      procList.forEach((proc) => {
        proc.properties.forEach((propName) => {
          let isProperty = false
          propValue = target[propName]

          if (pluginOptions) {
            const {props, definition} = pluginOptions
            // This mutates the preprocessor value
            // for when we want to operate on properties
            if (definition && props && ~this.propertyNames.indexOf(propName)) {
              if (props[propName] && !propValue)  {
                propValue = props[propName]
              }
            }
          }

          if (propValue !== undefined) {
            const expanded = this.run(
              proc, target, propName, propValue, pluginOptions, isProperty)
            if (expanded) {
              expansions = Object.assign(expansions, expanded)
            }
          }
        })
      })
    })

    return expansions
  }

  // Called by a registry to extract rules with invariants
  // prior to compiling the styles
  extract (target) {
    const {config} = this
    const extracted = {}
    let selector, rule
    for (selector in target) {
      rule = target[selector]
      const expansions = this.process(rule)
      const keys = Object.keys(expansions)
      if (keys.length) {
        extracted[selector] = expansions
      }
    }
    return extracted
  }
}

// Singleton
const processor = new Processor()

export {processor, Rule}
