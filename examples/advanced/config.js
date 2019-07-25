module.exports = {
  name:'advanced',
  start:[
    'advanced',
  ],
  //add both directories to search for required files
  paths:[__dirname,process.cwd()],
  transports:{
    local:{
      require:'transport',
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
