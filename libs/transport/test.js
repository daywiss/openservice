const test = require('tape')
const Transport = require('.')

test('transport',t=>{
  let transport
  t.test('local',t=>{
    t.test('init',t=>{
      transport = Transport('local')
      t.ok(transport)
      transport = transport()
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
