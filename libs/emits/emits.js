const highland = require('highland')
const lodash = require('lodash')
const uuid = require('uuid/v4')
const Events = require('../events')
const assert = require('assert')

module.exports = (channel = 'requests') => {
  assert(channel, 'requires channel name')

  const stream = highland()
  const { create } = Events(channel)

  function call(path, ...args) {
    // console.log('emits',channel,path,...args)
    const event = create(path, ...args)
    stream.write(event)
    return event
  }
  stream.call = call
  return stream
}
