const assert = require('assert')
module.exports = (config,services,emit) => {
  assert(services.wallets,'requires wallet service')

  return async function(from,to,amount){
    return [
      await services.wallets.withdraw(from,amount),
      await services.wallets.deposit(to,amount)
    ]
  }
}

