const lodash = require('lodash')
const assert = require('assert')
// const cleanstack = require('clean-stack')
const StackUtils = require('stack-utils')
const stack = new StackUtils({
  cwd: process.cwd(),
  internals: [/node_modules/, /streamify/],
})

exports.ONE_MINUTE_MS = 60 * 1000
exports.ONE_HOUR_MS = 60 * exports.ONE_MINUTE_MS
exports.ONE_DAY_MAS = 24 * exports.ONE_HOUR_MS

exports.objectFilter = (filter = {}) => obj => {
  return lodash.reduce(
    filter,
    (result, value, key) => {
      //did the filter pass
      if (result === false) return false
      //cast filter params to an array
      value = lodash.castArray(value)
      //check the object for the key
      const check = lodash.get(obj, key)
      // console.log(obj,filter)
      if (lodash.isArray(check)) {
        if (check.length === 0 && value.length === 0) return true
        // return lodash.intersection(check, value).length > 0
        // check each value in the path to ensure complete match.
        return value.reduce((result, val, i) => {
          if (val == check[i]) return result
          return false
        }, true)
      } else {
        return value.includes(check)
      }
    },
    true
  )
}

exports.timeout = (promise, delay, message) => {
  return Promise.race([
    promise,
    new Promise((res, rej) => setTimeout(x => rej(message), delay)),
  ])
}

exports.loopWhile = async (promise, delay, ...args) => {
  const result = await promise(...args)
  if (!result) return
  await new Promise((resolve, reject) => setTimeout(resolve, delay))
  return exports.loopWhile(promise, delay, ...args)
}
exports.delay = (delay = 0) => {
  return new Promise(resolve => setTimeout(resolve, delay))
}

exports.loop = async (fn, delay = 1000, max, count = 0, result) => {
  assert(lodash.isFunction(fn), 'loop requires a function')
  if (max && count >= max) return result
  result = await fn(count)
  await new Promise(res => setTimeout(res, delay))
  return exports.loop(fn, delay, max, count + 1, result)
}

exports.isEnvArray = (value = '') => {
  return value.toString().includes(',')
}

const isLower = new RegExp('^[a-z0-9]')
exports.isEnvParsable = key => {
  return isLower.test(key)
}

exports.parseEnvArray = value => {
  return lodash(value.split(','))
    .map(x => x.trim())
    .compact()
    .value()
}

exports.mapValues = (kv, valueFn) => {
  return lodash.reduce(
    kv,
    (result, value, key) => {
      result[key] = valueFn(value)
      return result
    },
    {}
  )
}

exports.difference = (oldState, newState) => {
  return lodash.omitBy(newState, function(v, k) {
    return lodash.isEqual(oldState[k], v)
  })
}

// exports.makeCalls = (streams) =>{
//   return lodash.reduce(streams,(result,stream,name)=>{
//     result[name] = Calls(stream)
//     return result
//   },{})
// }

// exports.makeEmits = (streams) =>{
//   return lodash.reduce(streams,(result,stream,name)=>{
//     result[name] = Emits(stream)
//     return result
//   },{})
// }

// exports.makeListen = (streams)=>{
//   return lodash.reduce(streams,(result,stream,name)=>{
//     result[name] = Listen(stream)
//     return result
//   },{})
// }

exports.parseEnv = env => {
  return lodash.reduce(
    env,
    (result, value, key) => {
      if (!exports.isEnvParsable(key)) return result
      const path = key.split('.')
      let val = value
      if (exports.isEnvArray(value)) {
        val = exports.parseEnvArray(value)
      }
      lodash.set(result, path, val)
      return result
    },
    {}
  )
}

exports.flattenJson = (json = {}, path = [], result = []) => {
  if (!lodash.isObject(json) || lodash.isArray(json)) {
    return result.push(path.join('.') + '=' + json)
  }

  lodash.each(json, (value, key) => {
    exports.flattenJson(value, path.concat(key), result)
  })

  return result
}

exports.CleanStack = (ignore = []) => (stack, start = 0, end) => {
  return stack
    .split('\n')
    .slice(start, end)
    .filter(line => {
      return ignore.reduce((result, regex) => {
        return result && !regex.test(line)
      }, true)
    })
    .join('\n')
}

const cleanStack = exports.CleanStack([
  /node_modules/,
  /streamify/,
  /calls\.js/,
  /client\.js/,
  /mock\.js/,
  /\<anonymous\>/,
  /\internal\/process/,
])

exports.cleanStack = cleanStack

exports.parseError = err => {
  assert(err.message, 'requires error message')
  try {
    return {
      message: err.message,
      code: err.code || null,
      stack: cleanStack(err.stack || ''),
    }
  } catch (e) {
    console.log(e)
  }
}

exports.decodeExpresstradeOffer = (offer, type) => {
  assert(offer, 'requires expresstrade offer')
  assert(type, 'requires trade type')

  switch (offer.state) {
    //offer accpeted
    case 3:
      return `${type} Accepted`
    //expired
    case 5:
      throw new Error(`${type} Expired`)
    //cancelled
    case 6:
      throw new Error(`${type} Cancelled`)
    //declined
    case 7:
      throw new Error(`${type} Declined`)
    //invalid items
    case 8:
      throw new Error(`Invalid Items`)
    case 10:
      throw new Error(`Expired Case Open`)
    case 12:
      throw new Error(`Failed Case Open`)
  }
}

exports.RelativePath = mypath => path => {
  return path.reduce((result, part, i) => {
    if (result.length > 0 || mypath[i] !== part) result.push(part)
    return result
  }, [])
}

exports.makeGameUser = (user, defaultImage) => {
  return {
    level: user.level || 0,
    id: user.id,
    name:
      user.username ||
      lodash.get(user, 'steam.username', user.steamid) ||
      lodash.get(user, 'opskins.username'),
    image: user.avatar || lodash.get(user, 'steam.avatar.medium', defaultImage),
  }
}

exports.makeGameItem = item => {}

// exports.relativeObject = mypath => obj => {
//   const relativePath = exports.relativePath(mypath)
//   return lodash.reduce(obj,(result,value,key)=>{
//     const path = relativePath
//   },{})
// }

exports.paginate = function(collection = [], page = 1, numItems = 100) {
  assert(collection, 'the provided collection is not an array!')
  if (lodash.isObject(collection)) {
    collection = lodash.values(collection)
  }
  var currentPage = parseInt(page)
  var perPage = parseInt(numItems)
  var offset = (page - 1) * perPage
  var paginatedItems = collection.slice(offset, offset + perPage)

  return {
    currentPage: currentPage,
    perPage: perPage,
    total: collection.length,
    totalPages: Math.ceil(collection.length / perPage),
    data: paginatedItems,
  }
}
