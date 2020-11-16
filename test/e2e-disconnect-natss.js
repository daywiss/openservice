require('dotenv').config()
const lodash = require("lodash");
const test = require("tape");
const App = require("../libs/app");
const env = require('openenv')(process.env)
const {loop} = require('../libs/utils')

function Client(config,{server},emit,meta){
  function echo(...args){
    return server.echo(...args)
  }
  // function shutdown(){
  //   console.log(meta)
  //   return meta.transport.close()
  // }
  return {
    echo,
    // shutdown
  }
}
function Server(config,clients,emit,meta){
  function echo(...args){
    return args
  }
  function pause(){
    return meta.server().stopRequests()
  }
  function shutdown(){
    return meta.transport.close()
  }
  return {
    echo,
    pause,
    shutdown
  }
}

const mainConfig = {
  openservice:{
    testing:true,
  },
  transports: {
    natss: {
      require: "../transports/natss",
      config:{
        durable:true,
        ...env.test.natss
      }
    },
    local: {
      require: "../transports/local",
    },
  },
  test: {
    client: {
      transport: "local",
      require: Client,
      clients: ["server"],
    },
    server: {
      transport:'natss',
      require: Server,
    },
  },
}
const clientConfig = {
  ...mainConfig,
  start: ["test.client"],
  transports:{
    ...mainConfig.transports,
    natss:{
      ...mainConfig.transports.natss,
      config:{
        ...mainConfig.transports.natss.config,
        clientid:'test-client'
      }
    }
  },
}
const serverConfig = {
  ...mainConfig,
  start: ["test.server"],
  transports:{
    ...mainConfig.transports,
    natss:{
      ...mainConfig.transports.natss,
      config:{
        ...mainConfig.transports.natss.config,
        clientid:'test-server'
      }
    }
  }
}
test('e2e nats test',t=>{
  let client
  t.test('init',async t=>{
    client = (await App(clientConfig))[0]
    t.ok(client)
    t.end()
  })
  t.test('echo',async t=>{
    const result = await client.echo('test')
    t.equal(result[0],'test')
    t.end()
  })
  t.test('simulate disconnect',t=>{
    let i = 0
    loop(async ()=>{
      i++
      const result = await client.echo('test' + i)
      console.log(result)
    },1)
  })
  t.test('close',async t=>{
    // await client.shutdown()
    await server.shutdown()
    t.end()
  })
})

