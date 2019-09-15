const assert = require('assert')
const { objectFilter } = require('../utils')
const lodash = require('lodash')
const highland = require('highland')

module.exports = (channel = 'responses') => {
  const listener = highland()
  listener.setMaxListeners(0)
  listener.resume()

  const listen = (path, cb) => {
    const filter = { channel }

    if (path && path.length) {
      path = lodash.castArray(path)
      filter.path = path
    }

    const f = objectFilter(filter)

    listener.on('data', async data => {
      if (f(data)) {
        if (cb) {
          try {
            await cb(...data.args)
          } catch (err) {
            console.log('error in listener', err)
            process.exit(1)
          }
        }
      }
    })
  }

  const stream = path =>{
    const filter = { channel }

    if (path && path.length) {
      path = lodash.castArray(path)
      filter.path = path
    }

    const f = objectFilter(filter)

    const result = highland()

    listener.on('data', data => {
      if (f(data)) {
        result.write(data)
      }
    })

    return result
  }

  listener.listen = listen
  listener.stream = stream

  return listener
}
