import PropTypes from 'prop-types'

const position = {
  top: PropTypes.number,
  right: PropTypes.number,
  bottom: PropTypes.number,
  left: PropTypes.number
}

const boxModelType = PropTypes.oneOfType([
  // All sides are equal
  PropTypes.number,
  // {top: 2, left: 4}
  PropTypes.shape(position),
  // Array is vertical/horizontal: [5, 10]
  PropTypes.arrayOf(PropTypes.number)
])

// TODO: find definition for react native color type
const colorType = PropTypes.string

const sides = {
  left: PropTypes.number,
  right: PropTypes.number
}

const propTypes = {
  style: PropTypes.oneOfType([
    // NOTE: we need number for compiled stylesheets
    PropTypes.number,
    PropTypes.array,
    PropTypes.object
  ]),
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  flex: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.shape({
      row: PropTypes.bool,
      grow: PropTypes.number,
      wrap: PropTypes.bool
    })
  ]),
  direction: PropTypes.oneOf(['row', 'column']),
  wrap: PropTypes.bool,
  justify: PropTypes.oneOf([
    'center', 'start', 'end', 'between', 'around'
  ]),
  padding: boxModelType,
  margin: boxModelType,
  position: PropTypes.shape(position),
  background: colorType,
  border: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.shape({
      color: PropTypes.string,
      ...position
    })
  ]),
  radius: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      top: PropTypes.shape(sides),
      bottom: PropTypes.shape(sides)
    })
  ])
}

export default propTypes
