const test = require('tape')
const Calls = require('.')
const Events = require('events')
const highland = require('highland')
const Streamify = require('../streamify')
const lodash = require('lodash')

const methods = {
  error: x => {
    throw new Error(x)
  },
  echo: x => x,
  stream: x => highland(lodash.times(x)),
}

test('calls', t => {
  let calls
  let stream = highland()
  const api = Streamify(methods)

  t.test('init', t => {
    calls = Calls()()
    t.ok(calls)
    t.end()
  })
  t.test('pipe', t => {
    api.pipe(calls.stream()).pipe(api)
    t.end()
  })
  t.test('call', async t => {
    const x = 'test'
    const result = await calls('echo', x)
    t.equal(result, x)
    t.end()
  })
  t.test('error', async t => {
    const x = 'test'
    try {
      const result = await calls('error', x)
    } catch (e) {
      t.equal(e.message, x)
      t.end()
    }
  })
  t.test('stream', async t => {
    const x = 10
    const stream = await calls('stream', x)
    const result = await stream.collect().toPromise(Promise)
    t.equal(result.length, x)
    t.end()
  })
  t.test('get calls', t => {
    t.equal(calls.calls().size, 0)
    t.end()
  })
})
