const highland = require('highland')
const lodash = require('lodash')

module.exports = async config => {
  const publishers = new Map()

  function publish(service, channel) {
    const id = [service, channel].join('.')
    if (publishers.has(id)) return publishers.get(id)
    const pub = highland()
    pub.resume()
    publishers.set(id, pub)
    return pub
  }

  function subscribe(service, channel) {
    return publish(service,channel).observe()
  }

  return {
    publish,
    subscribe,
  }
}
