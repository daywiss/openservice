const highland = require('highland')
const lodash = require('lodash')
const Promise = require('bluebird')
const assert = require('assert')
const Service = require('../service')
const Config = require('../config')


module.exports = async config => {
  //sets directories to search for files, 
  //researched from https://gist.github.com/branneman/8048520
  //allows user to load external files easier
  if(config.paths) require.main.paths = [...require.main.paths, ...lodash.castArray(config.paths)]

  const result = []
  const {compile} = Config(config.config)

  let transports = lodash.mapValues(config.transports,(value,key)=>{
    return require.main.require(value.require)(value.config)
  })

  transports = await Promise.props(transports)

  return Promise.map(compile(config),config=>{
    return Service(require.main.require(config.require),config,transports)
  })
}

