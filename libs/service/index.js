module.exports = require('./service')

//const assert = require('assert')
//const lodash = require('lodash')

//const Client = require('./client')
//const Server = require('./server')
//const Services = require('./services')
//const Mock = require('mock')
//const { timeout, RelativePath } = require('utils')
//const Logger = require('logger')
//const moment = require('moment')

//const Events = require('events')

//module.exports = async (config = {}, transport, logPath) => {
//  // console.log('loading', config)
//  let { clients, file, name } = config

//  assert(name !== undefined, 'service requires name')
//  assert(file !== undefined, 'service requires filename for ' + name)

//  const Service = Services(file)

//  clients = clients || []
//  clients = lodash.castArray(clients)

//  const servicePath = name.split('.')
//  const relativePath = RelativePath(servicePath)

//  const mocks = lodash.reduce(
//    clients,
//    (result, name) => {
//      relName = relativePath(name.split('.'))
//      assert(
//        !lodash.has(result, relName),
//        'Conflict between service client names: ' +
//          relName +
//          ' in ' +
//          config.name
//      )
//      // console.log('creating mock',name,'for',servicePath)
//      lodash.set(result, relName, Client(name, transport, config.name))
//      return result
//    },
//    {}
//  )

//  let logclient = Logger()

//  if (logPath) {
//    logclient = Client(logPath, transport, config.name)
//    lodash.set(mocks, logPath, logclient)
//  }

//  const logger = function(...args) {
//    logclient.emit(moment().format('L LTS'), config.name, ...args)
//    return args[0]
//  }

//  const events = new Events()
//  let service = await timeout(
//    Service(config, mocks, events.emit.bind(events, 'event'), logger),
//    5 * 15000,
//    'Service Timeout On Init: ' + name
//  )
//  service = service || {}
//  // console.log({ name, service, events, transport })
//  service.discover = function() {
//    return lodash.keys(service)
//  }
//  service.echo = function(x) {
//    return x
//  }
//  service.shutdown = function(ms = 1000) {
//    setTimeout(x => {
//      process.exit()
//    }, ms)
//  }
//  Server(name, service, transport)

//  // return service
//  //wrap server to create a testable interface
//  return Client(name, transport, service)
//}
