const Mock = require('mock')
module.exports = driver => {
  return Mock((service, call, ...args) => {})
}
