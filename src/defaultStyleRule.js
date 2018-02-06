import Plugin from './Plugin'

// This is the logic for computing the initial
// styles. An earlier version looked in defaultProps
// but it is problematic so we just find a style rule
// based on the component class name.
//
// Respect for invariants is required.
export default new Plugin(
  'defaultStyleRule',
  ({ns, registry, isPrimaryStyle, attrName}) => {
    const {styleSheet, invariants} = registry
    let sheets = []
    let styleRuleName = ns.componentClassName
    if (!isPrimaryStyle) {
      // Add child class name style sheet
      styleRuleName = ns.getChildClassName(attrName)
      if (invariants[styleRuleName]) {
        sheets.push(invariants[styleRuleName])
      }
    }
    if (styleSheet[styleRuleName]) {
      sheets.push(styleSheet[styleRuleName])
      if (invariants[styleRuleName]) {
        sheets.push(invariants[styleRuleName])
      }
    }
    return sheets
  }
)
