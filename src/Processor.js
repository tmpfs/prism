import util from './util'
const {isObject} = util

class Rule {
  constructor (fn, properties) {
    // Handler called when the property is encountered
    this.fn = fn
    // Name of the property in a style declaration
    this.properties = properties
  }
}

class Processor {
  config = null
  hasPreProcessors = false
  map = {}

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
      val.forEach((v) => {
        this.map[v] = this.map[v] || []
        this.map[v].push(proc)
        //this.map[v] = proc
      })
      this.hasPreProcessors = true
    })

    this.config = config
  }

  get (propName) {
    return this.map[propName]
  }

  run (list, target, propName, propValue) {
    const {config} = this
    const {registry} = config
    //console.log('Found preprocessor for: ' + propName)
    //console.log('Found preprocessor for: ' + propValue)
    const expansions = {}
    let expanded = false

    // Run all preprocessors for a given property
    list.forEach((proc) => {

      const write = (newValue, newPropName, expand = false) => {
        newPropName = newPropName || propName
        if (expand) {
          expansions[newPropName] = newValue
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

      const procOptions = {
        propName,
        propValue,
        write,
        ...registry
      }
      proc.fn(procOptions)
    })

    if (expanded) {
      return expansions
    }
  }

  process (target) {
    const {config} = this
    const {processors} = config
    if (!this.hasPreProcessors) {
      return
    }
    let expansions = {}
    let propName, propValue, proc
    for (propName in target) {
      console.log(propName)
      propValue = target[propName]
      proc = this.get(propName)
      if (proc) {
        const expanded = this.run(proc, target, propName, propValue)
        if (expanded) {
          expansions = Object.assign(expansions, expanded)
        }
      }
      // Recurse for initial style declarations
      if (isObject(propValue)) {
        this.process(propValue)
      }
    }
    return expansions
  }
}

// Singleton
const processor = new Processor()

export {processor, Rule}
