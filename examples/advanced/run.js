const App = require('../..')
const config = require('./config')

App(config).then(async ([wallets,transactions,actions,express])=>{
  transactions.deep.change.listen(result=>{
    console.log('listen change',result)
  })
  transactions.on(['deep','change'],result=>{
    console.log('on change',result)
  })
  await wallets.create({id:'a',balance:1})
  await wallets.create({id:'b',balance:0})
  await transactions('a','b',.5)
  console.log(await wallets.values())

}).catch(err=>{
  console.log(err)
})



