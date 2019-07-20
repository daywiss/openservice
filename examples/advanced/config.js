module.exports = {
  start:[
    'advanced',
  ],
  transports:{
    local:{
      require:'openservice-transport-local',
    },
    nats1:{
      require:'openservice-transport-nats',
    },
    nats1:{
      require:'openservice-transport-nats',
    }
  },
  config:{},
  global:{
    transport:'nats2',
    auth:{
    }
  },
  advanced:{
    transport:'nats1',
    start:['wallets','users','actions'],
    wallets:{
      require:'./wallets',
      config:{ },
      start:['db','cache'],
      clients:[].

      cache:{
        require:'./wallets-cache',
        config:{ },
        clients:[].
      },
      db:{
        require:'./wallets-db',
        config:{ },
        clients:[].
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
