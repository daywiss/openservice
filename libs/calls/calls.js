const highland = require('highland')
const assert = require('assert')
const lodash = require('lodash')
const Events = require('../events')
const { parseError, cleanStack } = require('../utils')

module.exports = (channel = 'requests') => {
  const calls = new Map()
  const streams = new Map()
  const outstream = highland()
  const { create } = Events(channel)

  const input = highland.pipeline(s => {
    return s
      .filter(event => {
        return calls.has(event.id) || streams.has(event.id)
      })
      .each(event => {
        // console.log('call got response',event)
        const call = calls.get(event.id)
        //discard
        if (event.channel === channel) {
          return
          // return event
        } else if (event.channel === 'errors') {
          // event.args[0].stack + '\n' + cleanStack(call.stack)
          call.rej(event.args[0])
          // call.rej(...event.args)
          calls.delete(event.id)
        } else if (event.channel === 'responses') {
          call.res(...event.args)
          calls.delete(event.id)
        } else if (event.channel === 'streams') {
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
        } else {
          throw new Error('inputs must be one of errors, responses or streams')
        }
      })
      .compact()
      .pipe(outstream)
  })

  function call(path, ...args) {
    return new Promise((res, rej) => {
      const event = create(path, ...args)
      // console.log('making call',event)
      const wait = { res, rej, ts: Date.now(), event }
      Error.captureStackTrace(wait)
      calls.set(event.id, wait)
      outstream.write(event)
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

  input.call = call
  input.getPending = getPending

  // call.stream = ()=> input
  // call.emit = ()=> emits
  // call.calls = ()=> calls

  return input
}
