import Plugin from './Plugin'

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
    }
    return sheets
  }
)
