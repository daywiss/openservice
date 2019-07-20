const test = require('tape')
const Calls = require('.')
const Emits = require('.')
const highland = require('highland')
const Stream = require('../streamify')
const lodash = require('lodash')

const methods = {
  error: x => {
    throw new Error(x)
  },
  echo: x => x,
  stream: x => highland(lodash.times(x)),
}

test('emits', t => {
  let emit
  t.test('init', t => {
    emit = Emits()()
    t.ok(emit)
    t.end()
  })
  t.test('isStream', t => {
    t.ok(highland.isStream(emit.stream()))
    t.end()
  })
  t.test('emit', t => {
    // console.log(emit)
    emit.stream().on('data', e => {
      console.log(e)
      t.ok(e)
      t.end()
    })
    emit('test', 'test')
  })
})
