const App = require('../..')
const config = require('./config')

App(config).then(async ([users,transactions,wallets,nested,actions,express])=>{
  // transactions.listen('deep.change',result=>{
  //   console.log('tx listen change',result)
  // })
  // transactions.on(['deep','change'],result=>{
  //   console.log('tx on deep change',result)
  // })
  transactions.on('change',result=>{
    console.log('regular change',result)
  })
  await wallets.create({id:'a',balance:1})
  await wallets.create({id:'b',balance:0})
  // console.log('transactions',await transactions('a','b',.5))
  console.log('nested',await nested('a','b',.5))
  // console.log(await wallets.values())
  // console.log(await wallets.config())

}).catch(err=>{
  console.log(err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
