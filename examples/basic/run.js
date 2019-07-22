const App = require('../..')
const config = require('./config')

App(config).then(async ([app])=>{
  console.log(await app.hello())
}).catch(err=>{
  console.log(err)
})


