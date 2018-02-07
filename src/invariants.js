import {Rule} from './Processor'

// Register invariant handling, these non-standard
// style property names must be removed at two points.
//
// 1. Before the style sheet is compiled
// 2. Before the computed style sheet is passed.
//
// The first case is dealt with in StyleRegistry.
//
// The second case is what this deals with, be registering
// a processor for each invariant name we can ensure it
// will never exist in the final computed style sheet.
//
// Users of the non-standard property can use mapStyleToProps
// to redirect the style property to a standard property.
//
// There is a performance overhead as it requires
// a flat object of computed styles.
export default (config) => {
  if (config.invariants && config.invariants.length) {
    config.invariants.forEach((name) => {
      config.processors.push(
        new Rule(
          name,
          ({move, propValue}) => {
            move(propValue, null, true)
          },
          [name]
        )
      )
    })
  }
}
