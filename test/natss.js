require('dotenv').config()
const test = require("tape");
const Transport = require('../transports/natss')
const config = require('openenv')(process.env)

config.test.natss.clientid='openservice-test'
// config.test.natss.durable=true

test('natss',t=>{
  let transport, pub, sub
  t.test('init',async t=>{
    transport = await Transport(config.test.natss)
    t.ok(transport)
    t.end()
  })
  t.test('pub',t=>{
    pub = transport.publish('a','req','test')
    t.ok(pub)
    t.end()
  })
  t.test('sub',t=>{
    sub = transport.subscribe('a','req','test')
    t.ok(sub)
    t.end()
  })
  t.test('write',t=>{
    t.plan(1)
    sub.once('data',t.ok)
    pub.write('a')
  })
  t.test('write many',t=>{
    let count = 0
    const max = 1000
    const cancel = setInterval(()=>{
      count++
      pub.write({
        count,
        string:'this is a test',
      })
      if(count >= max){
        console.log('ending')
        clearInterval(cancel)
        t.end()
      }
    },1)
  })
  t.test('sub',t=>{
    sub.each(x=>{
      console.log(x)
    })
    setTimeout(()=>{
      sub.close().then(t.end)
    },10)
    pub.write({
      string:'shouldnt see',
    })
  })

  t.test('close',async t=>{
    await transport.close()
    t.end()
  })
})
