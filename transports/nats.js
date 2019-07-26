const highland = require('highland')
const lodash = require('lodash')
const Natss = require('nats-transport')

module.exports = async config => {
  const publishers = new Map()
  const subscribers = new Map()
  const transport = await Natss(config)
  // const sub = transport.subscribe('test')
  // sub.resume()
  // const pub = transport.publish('test')

  function publish(service, channel) {
    const id = [service, channel].join('.')
    if (publishers.has(id)) return publishers.get(id)
    const pub = transport.publish(id)
    publishers.set(id, pub)

    return pub

    // stream
    //  .map(x=>{
    //    x.service = service
    //    return x
    //  })
    //  // .doto(x=>{
    //  //    console.log('publishing',x)
    //  // })
    //  .pipe(pub)

    // return stream
  }

  function subscribe(service, channel) {
    const id = [service, channel].join('.')
    const sub = transport.subscribe(id)
    if (subscribers.has(id)) return subscribers.get(id).observe()
    subscribers.set(id, sub)
    return sub
  }

  // function publish(service,channel){
  //   const id = [service,channel].join('.')
  //   console.log('natss publisher transport',id)
  //   if(publishers.has(id)) return publishers.get(id)
  //   const pub = transport.publish(id)
  //   publishers.set(id,pub)
  //   return pub
  // }

  // function subscribe(service,channel){
  //   const id = [service,channel].join('.')
  //   console.log('natss susbscribe transport',id)
  //   if(subscribers.has(id)) return subscribers.get(id)
  //   const sub =  transport.subscribe(id)
  //   sub.resume()
  //   subscribers.set(id,sub)
  //   return sub
  // }

  return {
    publish,
    subscribe,
  }
}
