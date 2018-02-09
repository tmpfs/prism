const isObject = (o) => o && o.toString() === '[object Object]'
const isString = (o) => o && typeof(o) === 'string'
const isNumber = (o) => typeof(o) === 'number'
const isFunction = (fn) => (fn instanceof Function)
const isArray = Array.isArray

export default {
  isObject,
  isFunction,
  isString,
  isArray,
  isNumber
}
