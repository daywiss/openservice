module.exports = {
  name:'stress',
  start:[
    'stress'
  ],
  //add both directories to search for required files
  paths:[__dirname,process.cwd(),process.cwd() + '/transports'],
  transports:{
    local:{
      require:'local'
    },
  },
  stress:{
    transport:'local',
    start:[
      'producer',
      'main',
    ],
    producer:{
      require:'./producer'
    },
    main:{
      require:'./main',
      clients:['producer']
    },
  }
}
