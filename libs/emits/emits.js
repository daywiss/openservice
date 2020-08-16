const highland = require('highland')
const lodash = require('lodash')
const Events = require('../events')
const assert = require('assert')

module.exports = (channel = 'requests', emit=x=>x) => {
  assert(channel, 'requires channel name')

  const { create } = Events(channel)

  function call(path, ...args) {
    // console.log('emits',channel,path,...args)
    const event = create(path, ...args)
    return emit(event)
  }
  return {
    call
  }

}
