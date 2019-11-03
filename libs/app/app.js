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

  //create a defaul object for openservice meta options
  const osConfig = lodash.merge(config.openservice,{})

  const result = []
  const {compile} = Config(osConfig)

  let transports = lodash.mapValues(config.transports,(value,key)=>{
    assert(value.require,`Transport ${key} missing "require" field to specify file`)
    const transport = require.main.require(value.require)
    assert(transport,'Transport file not found')
    return transport(value.config)
  })

  transports = await Promise.props(transports)

  return Promise.mapSeries(compile(config),compiledConfig=>{
    console.log('loading',config.name,compiledConfig.require)
    return Service(require.main.require(compiledConfig.require),compiledConfig,transports,osConfig)
  })
}

