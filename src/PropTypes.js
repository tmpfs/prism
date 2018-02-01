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

const colorType = PropTypes.string

const fontShape = {
  // Common properties
  family: PropTypes.string,
  size: PropTypes.number,
  lineHeight: PropTypes.number,
  style: PropTypes.oneOf(['normal', 'italic']),
  align: PropTypes.oneOf(['auto', 'left', 'right', 'center', 'justify']),
  weight: PropTypes.oneOf([
    'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']),
  decoration: PropTypes.oneOf([
    'none', 'underline', 'line-through', 'underline line-through']),
  // Android only
  valign: PropTypes.oneOf(['normal', 'top', 'bottom', 'center']),
  padding: PropTypes.bool,
}

const fontShapeMap = {
  family: 'fontFamily',
  size: 'fontSize',
  lineHeight: 'lineHeight',
  style: 'fontStyle',
  align: 'textAlign',
  weight: 'fontWeight',
  decoration: 'textDecorationLine',
  valign: 'textAlignVertical',
  padding: 'includeFontPadding',
}

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
  color: colorType,
  font: PropTypes.shape(fontShape),
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
  ]),
  colorNames: {
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string
  }
}

propTypes.fontShape = fontShape
propTypes.fontShapeMap = fontShapeMap

export default propTypes
