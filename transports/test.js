require('dotenv').config()
const config = require('openenv')(process.env)
const test = require('tape')
const Local = require('./local')
const Natss = require('./natss')

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
  t.test('natss durable',t=>{
    let server, client
    t.test('init',async t=>{
      server = await Natss({...config.natss,clientid:'test-server'})
      t.ok(server)
      t.end()
    })
    t.test('publish',async t=>{
      await server.publish('a','test').write('hello')
      t.end()
    })
    t.test('durable subscribe',async t=>{
      t.plan(1)
      client = await Natss({...config.natss,durable:true,clientid:'test-client'})
      await client.subscribe('a','test','testclient').each(x=>{
        console.log(x)
        t.equal(x,'hello')
      })
    })
    t.test('close',async t=>{
      await client.transport.disconnect()
      await server.transport.disconnect()
      t.end()
    })
  })
  t.test('natss not durable',t=>{
    let server, client
    t.test('init',async t=>{
      server = await Natss({...config.natss,clientid:'test-server-not-durable'})
      client = await Natss({...config.natss,clientid:'test-client-not-durable'})
      t.ok(server)
      t.end()
    })
    t.test('subscribe',async t=>{
      t.plan(1)
      await client.subscribe('b','test','testclient').each(x=>{
        t.equal(x,'hello')
      })
      await server.publish('b','test').write('hello')
    })
    t.test('close',async t=>{
      await client.transport.disconnect()
      await server.transport.disconnect()
      t.end()
    })
  })
})

