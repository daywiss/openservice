const lodash = require('lodash')
const assert = require('assert')
const defaults = require('./defaults')

module.exports = channel => {
  assert(channel, 'requires channel name')

  function create(path, ...args) {
    if (path === null || path === undefined || path === '') path = []
    path = lodash.castArray(path)
    return defaults({
      channel,
      path,
      args,
    })
  }

  return {
    create,
  }
}
