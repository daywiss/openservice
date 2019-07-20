const test = require('tape')
const Client = require('.')
const Transport = require('../transport')


test('client',t=>{
  let client,transport
  t.test('init',t=>{
    transport = Transport('local')()
    t.ok(transport)
    client = Client({name:'test'},transport)
    t.ok(client)
    t.end()
  })
  t.test('echo',t=>{
    const msg = 'test'
    transport.subscribe('test','requests').once('data',result=>{
      t.equal(result.args[0],msg)
      t.end()
    })
    client.echo('test')
  })
  t.test('log',t=>{
    try{
      console.log(client.dne)
    }catch(err){
      console.log(err.message)
      t.end()
    }

  })
  t.test('numbers',t=>{
    transport.subscribe('test','requests').once('data',result=>{
      t.ok(result)
      t.end()
    })
    client[0]()
  })
  t.test('promise',async t=>{
    transport.subscribe('test','requests').once('data',result=>{
      t.ok(result)
      t.end()
    })
    await client()
  })
})
