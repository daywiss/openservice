require('dotenv').config()
const lodash = require("lodash");
const test = require("tape");
const App = require("../libs/app");
const env = require('openenv')(process.env)
const {loopWhile,timeout} = require('../libs/utils')

const mainConfig = {
  openservice:{
    testing:true,
  },
  paths:[],
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
    server: {
      transport:'natss',
      require: Server,
    },
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
function Server(config,clients,emit,meta){
  async function echo(...args){
    await new Promise(res=>setTimeout(res,3000))
    return args
  }
  async function shutdown(){
    console.log('starting shutdown')
    meta.server().stopRequests()
    try{
      await timeout(loopWhile(()=>{
        console.log(meta.server().pendingRequests())
        return meta.server().pendingRequests()
      },1000),10000)
    }catch(err){
      console.log(err)
    }finally{
      console.log('shutdown ok')
      process.exit()
    }
  }
  // process.on('exit', shutdown)

  //catches ctrl+c event
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  // catches "kill pid" (for example: nodemon restart)
  // process.on('SIGUSR1', shutdown)
  // process.on('SIGUSR2', shutdown)

  //catches uncaught exceptions
  // process.on('uncaughtException', shutdown)
  // process.on('unhandledRejection', shutdown)
  return {
    echo,
  }
}
test('e2e nats test',t=>{
  let server
  t.test('init',async t=>{
    server = (await App(serverConfig))[0]
    t.ok(server)
    t.end()
  })
})

