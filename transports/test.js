const test = require('tape')
const Local = require('./local')

test('transport',t=>{
  let transport
  t.test('local',t=>{
    t.test('init',async t=>{
      transport = await Local()
      t.ok(transport)
      t.end()
    })
    t.test('pub/sub',t=>{
      const msg = 'test'
      transport.subscribe('test','test').once('data',result=>{
        t.equal(result,msg)
        t.end()
      })
      transport.publish('test','test').write(msg)
    })
  })
})