const App = require('../..')
const config = require('./config')

App(config).then(async ([producer,main])=>{
}).catch(err=>{
  console.log(err)
})



