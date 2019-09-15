const lodash = require('lodash')

exports.isEnvArray = (value = '') => {
  return value.toString().includes(',')
}

const isLower = '^[a-z0-9]'

exports.IsEnvParsable = regex => key => {
  return regex.test(key)
}

exports.parseEnvArray = value => {
  return lodash(value.split(','))
    .map(x => x.trim())
    .compact()
    .value()
}

exports.MapKey = regex => key => {
  return key.replace(regex,'')
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

exports.parseEnv = (env,regex=isLower) => {
  regex = new RegExp(regex)
  const isEnvParsable = exports.IsEnvParsable(regex)
  return lodash.reduce(
    env,
    (result, value, key) => {
      if (!isEnvParsable(key)) return result
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
