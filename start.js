require('dotenv').config()
const { parseEnv } = require('./libs/utils')
const args = require('minimist')(process.argv.slice(2))
const assert = require('assert')
const lodash = require('lodash')
const App = require('./libs/app')
const Path = require('path')

const paths = args._ || []

let config = lodash.reduce(
  paths,
  (result, fn) => {
    return lodash.merge(result, Path.resolve(process.cwd(),fn))
  },
  {}
)

const env = parseEnv(process.env)
//do not try to merge env if pm2 is detected because it pollutes env space
if (!env.pm_id) config = lodash.merge(config, env)

App(config)
  .then(x => {
    console.log(config.name, 'Online')
  })
  .catch(e => {
    console.log('Error Loading', config.name, e)
    process.exit(1)
  })

process.on('unhandledRejection', function(err, promise) {
  console.log(err)
  process.exit(1)
})

process.on('uncaughtException', function(err) {
  console.log(err.stack)
  process.exit(1)
})

