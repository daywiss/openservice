const assert = require('assert')
const lodash = require('lodash')
const Events = require('events')

const Client = require('../client')
const Server = require('../server')
const { timeout, RelativePath } = require('../utils')

module.exports = async (Service,config={},transports,osConfig={})=>{

  const {timeoutms=60000} = config
  assert(config.path !== undefined, 'service requires path')
  assert(transports,'requires transports')
  assert(Service,'Service not found for: ' + config.path)
  assert(lodash.isFunction(Service),`Service is not a function: ${config.path} (${config.require})`)

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
    lodash.set(result, path, Client({...osConfig,name:client.name}, transport, config.name))
    return result
  },{})


  const events = new Events()
  let service = await timeout(
    Service(config.config, clients, (...args)=>events.emit('event',args)),
    timeoutms,
    'Service Timeout On Init: ' + config.name + ' after ' + timeoutms + 'ms'
  )

  service = service || {}

  if(lodash.isObject(service)){
    service.utils = {
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
        events.emit('event',['shutdown',ms])
        setTimeout(x => {
          process.exit()
        }, ms)
      },
    }
  }

  const transport = lodash.get(transports,config.transport)
  assert(transport,'Transport is not defined: ' + config.transport)
  const server = Server({...osConfig,...config}, service, transport)
  events.on('event',args=> server.emit(...args))
  
  return Client({...osConfig,...config}, transport, 'Open Service')
}
