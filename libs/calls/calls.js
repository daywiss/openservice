const highland = require('highland')
const assert = require('assert')
const lodash = require('lodash')
const Events = require('../events')
const { parseError, cleanStack } = require('../utils')

module.exports = (channel='requests', emit=x=>x) => {
  const calls = new Map()
  const streams = new Map()
  const { create } = Events(channel)

  function call(path, ...args) {
    return new Promise((res, rej) => {
      const event = create(path, ...args)
      const wait = { res, rej, ts: Date.now(), event }
      // Error.captureStackTrace(wait)
      calls.set(event.id, wait)
      emit(event)
    })
  }

  function getPending(age, now = Date.now()) {
    assert(age, 'requires age in ms')
    const thresh = now - age
    const result = []
    calls.forEach((value, key) => {
      if (value.ts < thresh) result.push(value)
    })
    return result
  }

  function respond(event){
    if(!calls.has(event.id) && !streams.has(event.id)) return
    const call = calls.get(event.id)
    switch(event.channel){
      case 'errors':
        // event.args[0].stack += '\n' + cleanStack(call.stack)
        call.rej(event.args[0])
        calls.delete(event.id)
        return
      case 'streams':
        if (!streams.has(event.id)) {
          const stream = highland()
          streams.set(event.id, stream)
          //return stream first
          call.res(stream)
          calls.delete(event.id)
        }
        const stream = streams.get(event.id)
        const [data] = event.args
        if (data === 'terminate!') {
          // console.log('stream ending',event)
          stream.end()
          streams.delete(event.id)
        } else {
          stream.write(data)
        }
        return
      case 'responses':
        call.res(...event.args)
        calls.delete(event.id)
        return
      default:
    }
  }

  return {
    call,
    getPending,
    respond
  }
}

