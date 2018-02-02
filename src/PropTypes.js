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
  color: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([
      'xx-small',
      'x-small',
      'small',
      'medium',
      'large',
      'x-large',
      'xx-large'])
  ]),
  lineHeight: PropTypes.number,
  style: PropTypes.oneOf(['normal', 'italic']),
  align: PropTypes.oneOf(['auto', 'left', 'right', 'center', 'justify']),
  weight: PropTypes.oneOf([
    'normal',
    'bold',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900'
  ]),
  decoration: PropTypes.oneOf([
    'none', 'underline', 'line-through', 'underline line-through']),
  // Android only
  valign: PropTypes.oneOf(['normal', 'top', 'bottom', 'center']),
  padding: PropTypes.bool,

  // IOS only
  variant: PropTypes.oneOf([
    'small-caps',
    'oldstyle-nums',
    'lining-nums',
    'tabular-nums',
    'proportional-nums']),
  letterSpacing: PropTypes.number,
  decorationColor: PropTypes.string,
  decorationStyle: PropTypes.oneOf(['solid', 'double', 'dotted', 'dashed']),
  writingDirection: PropTypes.oneOf(['auto', 'ltr', 'rtl'])
}

const fontShapeMap = {
  family: 'fontFamily',
  color: 'color',
  size: 'fontSize',
  lineHeight: 'lineHeight',
  style: 'fontStyle',
  align: 'textAlign',
  weight: 'fontWeight',
  decoration: 'textDecorationLine',
  valign: 'textAlignVertical',
  padding: 'includeFontPadding',
  variant: 'fontVariant',
  letterSpacing: 'letterSpacing',
  decorationColor: 'textDecorationColor',
  decorationStyle: 'textDecorationStyle',
  writingDirection: 'writingDirection'
}

const fontPropType = PropTypes.shape(fontShape)

const fontShapeColors = ['color', 'decorationColor']

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
  row: PropTypes.bool,
  wrap: PropTypes.bool,
  justify: PropTypes.oneOf([
    'center', 'start', 'end', 'between', 'around'
  ]),
  padding: boxModelType,
  margin: boxModelType,
  position: PropTypes.shape(position),
  background: colorType,
  color: colorType,
  font: fontPropType,
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
propTypes.fontShapeColors = fontShapeColors
propTypes.fontShapeMap = fontShapeMap
propTypes.fontPropType = fontPropType

export default propTypes
