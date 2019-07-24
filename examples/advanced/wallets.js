const Cache = require('./cache')
const assert = require('assert')
const lodash = require('lodash')
module.exports = config => {
  const table = Cache()

  function get(id){
    const wallet = table.get(id)
    assert(wallet,'wallet does not exist')
    return wallet
  }
  function set(props){
    table.set(props.id,props)
    return props
  }

  function create(props={}){
    if(props.id) assert(!table.has(props.id),'wallet exists')
    return set({
      id:lodash.uniqueId(),
      balance:0,
      ...props
    })
  }

  function getOrCreate(id){
    try{
      return get(id)
    }catch(err){
      return create({id})
    }
  }

  return {
    ...table,
    deposit(id,amount=0){
      assert(amount > 0,'deposit amount must be positive')
      const wallet = get(id)
      wallet.balance += amount
      return set(wallet)
    },
    withdraw(id,amount){
      const wallet = get(id)
      assert(amount > 0,'withdraw amount must be positive')
      assert(wallet.balance >= amount,'insufficient funds')
      wallet.balance -= amount
      return set(wallet)
    },
    set,
    get,
    create,
  }
}
