module.exports = {
  name:'advanced',
  start:[
    // 'advanced',
    'advanced.transactions',
    'advanced.transactions.wallets',
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
  advanced:{
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
