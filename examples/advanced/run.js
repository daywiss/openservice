const App = require('../..')
const config = require('./config')

App(config).then(async ([transactions,wallets,actions,express])=>{
  transactions.deep.change.listen(result=>{
    console.log('tx listen change',result)
  })
  transactions.on(['deep','change'],result=>{
    console.log('tx on change',result)
  })
  await wallets.create({id:'a',balance:1})
  await wallets.create({id:'b',balance:0})
  await transactions('a','b',.5)
  console.log(await wallets.values())
  console.log(await wallets.config())

}).catch(err=>{
  console.log(err)
})



