import Plugin from './Plugin'

// This is the logic for computing the initial styles.
//
// Respect for invariants is required.
export default new Plugin(
  'defaultStyleRule',
  ({ns, registry, isPrimaryStyle, attrName}) => {
    let selector = ns.getClassName()
    if (!isPrimaryStyle) {
      // Add child class name style sheet
      selector = registry.getChildClassName(ns, attrName)
    }
    return registry.resolve(selector)
  }
)
