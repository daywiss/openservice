module.exports = {
  name:'basic',
  cwd:__dirname,
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
