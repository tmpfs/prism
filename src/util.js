const isObject = (o) => o && o.toString() === '[object Object]'
const isString = (o) => o && typeof(o) === 'string'
const isNumber = (o) => typeof(o) === 'number'
const isFunction = (fn) => (fn instanceof Function)
const isArray = Array.isArray

const ucfirst = (s) => {
  if (s && s.length) {
    return s.charAt(0).toUpperCase() + s.substr(1)
  }
  return s
}

const lcfirst = (s) => {
  if (s && s.length) {
    return s.charAt(0).toLowerCase() + s.substr(1)
  }
}

// FIXME: naive implementation
const ucword = (s) => {
  if (s) {
    return s.split(' ').map((word) => {
      return ucfirst(word)
    }).join(' ')
  }
  return s
}

export default {
  isObject,
  isFunction,
  isString,
  isArray,
  isNumber,
  ucfirst,
  ucword,
  lcfirst}
