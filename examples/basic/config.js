module.exports = {
  name:'basic',
  cwd:process.cwd(),
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
