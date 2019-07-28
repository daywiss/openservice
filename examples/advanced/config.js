module.exports = {
  name:'advanced',
  start:[
    'advanced',
  ],
  config:{
    test:'test',
  },
  //add both directories to search for required files
  paths:[__dirname,process.cwd(),process.cwd() + '/transports'],
  transports:{
    local:{
      require:'local'
    },
    natss:{
      require:'natss',
      config:{
        url:'nats://localhost:4223',
        clusterid:'test-cluster',
        clientid:'open-service',
      }
    }
  },
  start:[
    'advanced'
  ],
  advanced:{
    start:[
      'transactions.wallets',
      'transactions',
      // 'actions',
      // 'express'
    ],
    transactions:{
      transport:'natss',
      require:'transaction',
      config:{ },
      clients:['wallets'],
      wallets:{
        transport:'local',
        require:'./wallets',
        config:{ },
        clients:[]
      },
    },
    actions:{
      require:'./actions',
      config:{ },
      clients:['wallets','transactions'],
    },
    express:{
      require:'express',
      config:{ },
      clients:['actions'],
    },
  }
}
