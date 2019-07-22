const assert = require('assert')
const lodash = require('lodash')
const moment = require('moment')
const highland = require('highland')

const Client = require('../client')
const Server = require('../server')
const { timeout, RelativePath } = require('../utils')

module.exports = async (Service,config={},transports)=>{

  const {timeoutms=60000} = config
  assert(config.path !== undefined, 'service requires path')
  assert(transports,'requires transports')

  // const clientNames = lodash.castArray(config.clients || [])
  const servicePath = config.path
  const relativePath = RelativePath(servicePath)

  const clients = config.clients.reduce((result,client)=>{
    const path = relativePath(client.path)
    const transport = lodash.get(transports,client.transport)
    assert(transport,'transport configuration not defined for: ' + client.transport)
    assert(
      !lodash.has(result, path),
      'Conflict between service client names: ' +
      path +
      ' in ' +
      config.name,
    )
    lodash.set(result, path, Client({name:client.name}, transport, config.name))
    return result
  },{})


  // const clients = lodash.reduce(clientNames,(result,name)=>{
  //     const path = relativePath(name)
  //     assert(
  //       !lodash.has(result, path),
  //       'Conflict between service client names: ' +
  //         path +
  //         ' in ' +
  //         config.name,
  //     )
  //     lodash.set(result, path, Client({name}, transport, config.name))
  //     return result
  // },{})

  const events = highland()
  let service = await timeout(
    Service(config, clients, (...args)=>events.write(args)),
    timeoutms,
    'Service Timeout On Init: ' + config.name + ' after ' + timeout + 'ms'
  )
  const utils = {
    id(){
      return config.name
    },
    discover(){
      return lodash.keys(service)
    },
    echo(x){
      return x
    },
    log(...args){
      console.log(...args)
    },
    shutdown(ms=1000){
      events.write(['shutdown',ms])
      setTimeout(x => {
        process.exit()
      }, ms)
    },
  }

  const transport = lodash.get(transports,config.transport)
  assert(transport,'Transport is not defined: ' + config.transport)
  const server = Server(config, {...utils,...service}, transport)
  events.each(args=> server.emit(...args))
  
  return Client(config, transport, config.name)
}
