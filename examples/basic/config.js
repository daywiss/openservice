module.exports = {
  name:'basic',
  paths:[__dirname,process.cwd(),process.cwd() + '/transports'],
  transports:{
    local:{
      require:'local',
    }
  },
  start:[
    'basic.service',
  ],
  basic:{
    service:{
      transport:'local',
      require:'basic'
    }
  }
}
