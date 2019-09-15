const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

const Events = require('../events')
const utils = require('../utils')

function Wrap(name, methods, cb) {
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
      if (!lodash.isFunction(call)) {
        throw new Error(`Call to non existent function on ${name}.${path.join('.')}(${JSON.stringify(args)})`)
      }
      const resolve = await call.apply(methods,args)

      if (highland.isStream(resolve)) {
        resolve
          .doto(x => {
            cb('streams', x, event)
          })
          .errors((err,next)=>{
            next(err)
            resolve.destroy()
          })
          .done(() => {
            cb('streams', 'terminate!', event)
            resolve.destroy()
          })
      } else {
        cb('responses', resolve, event)
      }
    } catch (reject) {
      cb('errors', utils.parseError(reject), event)
    }
  }
}

module.exports = (name,methods) => {
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

  const wrap = Wrap(name,methods, (channel, result, event) => {
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
