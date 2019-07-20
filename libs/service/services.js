const assert = require('assert')
const lodash = require('lodash')
const Events = require('events')

module.exports = name => {
  assert(name, 'requires service filename')
  const Service = require(name)

  assert(Service, 'Service Not Found with filename: ' + name)

  // const service = await Service(config,services,(path,...args)=>{
  //   events.emit('event',path,...args)
  // })

  return Service
}
