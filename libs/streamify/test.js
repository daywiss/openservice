const test = require('tape')
const Streamify = require('.')
const highland = require('highland')
const lodash = require('lodash')

const methods = {
  echo: x => x,
  stream: x => highland(lodash.times(x)),
  error: x => {
    throw new Error(x)
  },
}

test('streamify', t => {
  let stream
  t.test('init', t => {
    stream = Streamify(methods)
    t.ok(stream)
    t.end()
  })
  t.test('echo', t => {
    stream.write({ channel: 'requests', path: 'echo', args: ['test'] })
    stream.once('data', x => {
      t.equal(x.channel, 'responses')
      t.equal(x.args[0], 'test')
      t.end()
    })
  })
  t.test('error', t => {
    stream.write({ channel: 'requests', path: 'error', args: ['test'] })
    stream.once('data', x => {
      t.equal(x.channel, 'errors')
      t.equal(x.args[0].message, 'test')
      t.end()
    })
  })
  t.test('stream', t => {
    t.plan(11)
    stream.write({ channel: 'requests', path: 'stream', args: [10] })
    stream.on('data', x => {
      console.log(x)
      t.equal(x.channel, 'streams')
    })
  })
})
