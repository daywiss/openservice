const test = require('tape')
const Config = require('.')
const example = {
  start:[
    'misc',
    'advanced',
  ],
  transports:{
    local:{
      require:'openservice-transport-local',
    },
    nats1:{
      require:'openservice-transport-nats',
    },
    nats2:{
      require:'openservice-transport-nats',
    }
  },
  global:{
    transport:'nats2',
    auth:{ }
  },
  misc:{
    start:['utils'],
    transport:'nats1',
    utils:{
      require:'./utils',
    }
  },
  advanced:{
    transport:'nats1',
    start:['wallets','users','actions'],
    wallets:{
      transport:'nats1',
      require:'./wallets',
      config:{ },
      start:['db','cache'],
      clients:['misc.utils'],
      cache:{
        transport:'local',
        require:'./wallets-cache',
        config:{ },
        clients:[],
      },
      db:{
        transport:'local',
        require:'./wallets-db',
        config:{ },
        clients:[],
      },
    },
    users:{
      require:'./users',
      config:{ },
      clients:['wallets']
    },
    actions:{
      require:'./actions',
      config:{ },
      clients:['global.auth','advanced.users','advanced.wallets'],
    },
  }
}


test('config',t=>{
  let config
  t.test('init',t=>{
    config=Config()
    t.ok(config)
    t.end()
  })
  t.test('expand',t=>{
    // const result = config.expandService(example,['advanced','wallets'],config.makeDefaults(example.advanced))
    const result = config.expandService(example,['advanced','users'],config.makeDefaults(example.advanced))
    // console.log(result)
    t.ok(result)
    t.end()
  })
  t.test('listServices',t=>{
    const result = config.listServices(example)
    // console.log(result)
    t.ok(result.length)
    t.end()
  })
  t.test('compile',t=>{
    const result = config.compile(example)
    console.log(result)
    t.ok(result.length)
    t.end()
  })
})
