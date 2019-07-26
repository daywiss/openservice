module.exports = {
  name:'advanced',
  start:[
    'advanced',
  ],
  //add both directories to search for required files
  paths:[__dirname,process.cwd(),process.cwd() + '/transports'],
  transports:{
    local:{
      require:'local'
      // require:'natss',
      // config:{
      //   url:'nats://localhost:4223',
      //   clusterid:'test-cluster',
      //   clientid:'open-service',
      // }
    },
  },
  config:{},
  start:[
    'advanced'
  ],
  advanced:{
    transport:'local',
    start:[
      'wallets',
      'transactions',
      // 'actions',
      // 'express'
    ],
    wallets:{
      require:'wallets',
      config:{ },
      clients:[]
    },
    transactions:{
      require:'transaction',
      config:{ },
      clients:['wallets']
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
