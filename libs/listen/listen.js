const assert = require('assert')
const { objectFilter } = require('../utils')
const lodash = require('lodash')
const highland = require('highland')

module.exports = (channel = 'responses') => {
  const stream = highland()
  stream.setMaxListeners(0)

  const listen = (path, cb) => {
    const filter = { channel }

    if (path && path.length) {
      path = lodash.castArray(path)
      filter.path = path
    }

    const result = highland()

    const f = objectFilter(filter)
    stream.on('data', async data => {
      if (f(data)) {
        if (cb) {
          try {
            await cb(...data.args)
          } catch (err) {
            console.log('error in listener', err)
            process.exit(1)
          }
        }
        result.write(data)
      }
    })

    return result
  }

  stream.listen = listen

  return stream
}
