const highland = require('highland')
const lodash = require('lodash')
const assert = require('assert')

//wrap nats into a stream with some default config
//and json encoding
function Natss(config,emit=x=>x){
  const natss = require('node-nats-streaming')
  let stan = null
  const now = Date.now()
  function publish(channel) {
    assert(channel, 'requires channel')
    const stream = highland()

    let last
    stream
      .map(JSON.stringify)
      // .doto(console.log)
      .map(data => {
        return new Promise((res, rej) => {
          last = data
          stan.publish(channel, data, (err, guid) => {
            if (err) return rej(err)
            res(guid)
          })
        })
      })
      .flatMap(highland)
      .errors((err, next) => {
        if (err) emit('error',err) 
        next()
      })
      .resume()
    return stream
  }

  function subscribe(channel, durableName) {
    assert(channel, 'requires channel')
    var opts = stan.subscriptionOptions()
    const {durable=false} = config

    if (durable) {
      opts.setDurableName(durableName)
      opts.setDeliverAllAvailable()
    }else{
      opts.setStartTime(now)
    }

    const sub = stan.subscribe(channel, opts)

    return (
      highland('message', sub)
        .map(msg => {
          return JSON.parse(msg.getData())
        })
        // .doto(console.log)
        .errors((err, next) => {
          if (err) emit('error',err) 
          next()
        })
    )
  }

  function disconnect() {
    return stan.close()
  }

  function connect(config) {
    assert(config.url, 'natss requires server url')
    assert(config.clusterid, 'natss requires clusterid')
    assert(config.clientid, 'natss requires clientid')
    stan = natss.connect(
      config.clusterid,
      config.clientid,
      config.url
    )
    return new Promise((res, rej) => {
      stan.once('connect', x => {
        res({ publish, subscribe, disconnect })
      })
      stan.once('error', rej)
    })
  }

  return connect(config)
}

module.exports = async config => {
  const publishers = new Map()
  const subscribers = new Map()

  const transport = await Natss(config,(type,data)=>{
    if(type === 'error'){
      console.log('nats transport error:', data)
      throw data
    }
  })

  function publish(service, channel) {
    const id = [service, channel].join('.')
    if (publishers.has(id)) return publishers.get(id)
    const pub = transport.publish(id)
    publishers.set(id, pub)
    return pub
  }

  function subscribe(service, channel, origin) {
    const id = [service, channel].join('.')
    const sid= [service,channel,origin].join('!')
    //each originating client gets their own subscription to a service channel
    if (subscribers.has(sid)) return subscribers.get(sid).observe()
    const sub = transport.subscribe(id, origin)
    subscribers.set(sid, sub)
    return sub
  }

  return {
    publish,
    subscribe,
    transport,
  }
}

module.exports.Natss = Natss
