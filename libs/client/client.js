const Mock = require('../mock')
const Calls = require('../calls')
const Emits = require('../emits')
const Listen = require('../listen')
const lodash = require('lodash')
const assert = require('assert')
const moment = require('moment')

module.exports = (config, transport, service) => {
  const {name,old=10000,emit='_emit',listen='_listen',stream='_stream',on='on'} = config
  assert(name, 'requires name')
  assert(transport, 'requires transport')

  const requests = transport.publish(name, 'requests')
  const responses = transport.subscribe(name, 'responses')
  const streams = transport.subscribe(name, 'streams')
  const errors = transport.subscribe(name, 'errors')

  assert(requests, 'requires requests stream')
  assert(responses, 'requires responses stream')
  assert(streams, 'requires streams stream')
  assert(errors, 'requires errors stream')

  const callStream = Calls()
  const emitStream = Emits()
  const listenStream = Listen()

  emitStream.pipe(requests)
  callStream.pipe(requests)

  responses.pipe(callStream)
  streams.pipe(callStream)
  errors.pipe(callStream)

  responses.observe().pipe(listenStream)

  setInterval(x => {
    const pending = callStream.getPending(old)
    const now = Date.now()
    pending.forEach(event => {
      const duration = moment.duration(now - event.ts, 'ms').humanize()
      console.log(
        `Warning: Service ${service} waiting ${duration} for response from ${name}.${event.event.path.join(
          '.'
        )}`
      )
    })
  }, old)

  return Mock((type,path, args) => {
    const [fun] = path.slice(-1)
    const prefix = path.length > 1 ? path.slice(0, -1) : []

    if(type !== 'apply') return 

    if(path.length === 1 && (path[0] === on || path[0] === listen)){
      return listenStream.listen(...args)
    }

    if(path.length === 1 && path[0] === stream){
      return listenStream.stream(...args)
    }

    if(path.length === 1 && path[0] === emit){
      return emitStream.call(...args)
    }

    return callStream.call(path, ...args)
  })
}
