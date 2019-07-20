const assert = require('assert')
const lodash = require('lodash')
const highland = require('highland')

const Calls = require('../calls')
const Emits = require('../emits')
const Listen = require('../listen')
const Streamify = require('../streamify')
const utils = require('../utils')


module.exports = (config, service, transport) => {
  const {name} = config
  assert(name, 'requires service name')
  assert(service, 'requires service')
  assert(transport, 'requires transport')

  const requests = transport.subscribe(name, 'requests')
  const responses = transport.publish(name, 'responses')
  const streams = transport.publish(name, 'streams')
  const errors = transport.publish(name, 'errors')

  const serviceStream = Streamify(service)

  requests.pipe(serviceStream.requests)
  serviceStream.responses.pipe(responses)
  serviceStream.streams.pipe(streams)
  serviceStream.errors.pipe(errors)

  const responseStream = Emits('responses')
  responseStream.pipe(responses)

  return {
    emit(...args){
      responseStream.call(...args)
    }
  }
}
