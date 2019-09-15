const test = require('tape')
const { parseEnv } = require('.')

test('parseEnv',t=>{
  t.test('defaults',t=>{
    const result = parseEnv({
      NotOk:true,
      ok:true
    })
    t.ok(result.ok)
    t.notOk(result.NotOk)
    t.end()
  })
  t.test('custom',t=>{
    const result = parseEnv({
      NotOk:true,
      alsoNotOk:true,
      '_custom':true,
      'bad_custom':true
    },'^_')
    t.notOk(result.NotOk)
    t.notOk(result.alsoNotOk)
    t.notOk(result.bad_custom)
    t.ok(result['_custom'])
    t.end()
  })
})
