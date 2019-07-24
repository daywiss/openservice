module.exports = {
  start:[
    'advanced',
  ],
  cwd:process.cwd(),
  transports:{
    local:{
      require:'local',
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
      require:'./wallets',
      config:{ },
      clients:[]
    },
    transactions:{
      require:'./transaction',
      config:{ },
      clients:['wallets']
    },
    actions:{
      require:'./actions',
      config:{ },
      clients:['wallets','transactions'],
    },
    express:{
      require:'./express',
      config:{ },
      clients:['actions'],
    },
  }
}
