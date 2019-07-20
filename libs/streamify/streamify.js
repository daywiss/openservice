const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

const Events = require('../events')
const utils = require('../utils')

function Wrap(methods, cb) {
  return async function(event) {
    try {
      const { path, id, args } = event
      let call
      if (path.length > 0) {
        call = lodash.get(methods, path)
      } else {
        assert(lodash.isFunction(methods), 'Root path is not a function')
        call = methods
      }
      // console.log('streamify call',path,args)
      if (!lodash.isFunction(call)) {
        console.log(
          'calling invalid function',
          JSON.stringify(event, undefined, 2)
        )
        throw new Error(
          'Invalid call on ' +
            JSON.stringify(path.toString()) +
            ' ' +
            JSON.stringify(args.toString())
        )
      }
      const resolve = await call(...args)
      // console.log('streamify result',path,args,resolve)
      if (highland.isStream(resolve)) {
        resolve
          .doto(x => {
            cb('streams', x, event)
          })
          .done(() => {
            cb('streams', 'terminate!', event)
          })
      } else {
        cb('responses', resolve, event)
      }
    } catch (reject) {
      // console.log('stremify error',{reject,event})
      cb('errors', utils.parseError(reject), event)
    }
  }
}

module.exports = methods => {
  const errors = highland()
  // .filter(x=>{
  //   return x.channel == 'errors'
  // })
  const responses = highland()
  // .filter(x=>{
  // return x.channel == 'responses'
  // })
  const streams = highland()
  // .filter(x=>{
  //   return x.channel == 'streams'
  // })

  const wrap = Wrap(methods, (channel, result, event) => {
    const msg = {
      id: event.id,
      channel,
      path: event.path,
      args: [result, ...(event.args || [])],
    }
    // console.log('streamify request',{event,result:msg})
    switch (channel) {
      case 'responses':
        responses.write(msg)
        break
      case 'errors':
        // console.log('streamify error',result.message,result.stack)
        errors.write(msg)
        break
      case 'streams':
        streams.write(msg)
        break
      default:
        throw Error('unknown event channel')
    }
  })

  //non blocking event stream
  // const requests = highland().each(x => {
  //   return wrap(x)
  // })

  const requests = highland()

  //turn requests stream into a blocking call
  //so we can have some determinism
  requests
    .map(wrap)
    .flatMap(highland)
    .resume()

  //these functions hacked in to be compatible with transport
  function get(type) {
    if (type == 'requests') return requests
    if (type == 'responses') return responses
    if (type == 'errors') return errors
    if (type == 'streams') return streams
  }
  function publish(name, type) {
    return get(type)
  }
  function subscribe(name, type) {
    return get(type)
  }
  return {
    requests,
    responses,
    errors,
    streams,
    publish,
    subscribe,
  }
}
