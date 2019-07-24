const App = require('../..')
const config = require('./config')

App(config).then(async ([wallets,transactions,actions,express])=>{
  await wallets.create({id:'a',balance:1})
  await wallets.create({id:'b',balance:0})
  await transactions('a','b',.5)
  console.log(await wallets.values())

}).catch(err=>{
  console.log(err)
})



