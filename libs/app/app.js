const highland = require('highland')
const lodash = require('lodash')
const Promise = require('bluebird')
const assert = require('assert')
const Transports = require('../transports')
const Service = require('../service')
const Config = require('../config')

module.exports = async config => {
  const result = []
  const {compile} = Config(config.config)

  let transports = lodash.mapValues(config.transports,(value,key)=>{
    return Transports(value.require)(value.config)
  })

  transports = await Promise.props(transports)

  return Promise.map(compile(config),config=>{
    return Services(config,transports)
  })
}

