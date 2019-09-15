const highland = require('highland')
const lodash = require('lodash')

module.exports = async config => {
  const transports = {}
  const publishers = new Map()
  const subscribers = new Map()

  function publish(service, channel) {
    const id = [service, channel].join('.')
    if (publishers.has(id)) return publishers.get(id)
    const pub = highland()
    pub.resume()
    publishers.set(id, pub)
    return pub
  }

  function subscribe(service, channel) {
    const id = [service, channel].join('.')
    if (publishers.has(id)) return publishers.get(id).observe()
    const sub = highland()
    publishers.set(id, sub)
    return sub
  }

  return {
    publish,
    subscribe,
  }
}

