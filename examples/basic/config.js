module.exports = {
  transports:{
    local:{
      require:'openservice-transport-local',
    }
  },
  services:[
    'express',
  ],
  express:{
    require:'./express'
  }
}
