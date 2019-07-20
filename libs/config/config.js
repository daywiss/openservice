const lodash = require('lodash')
const assert = require('assert')

module.exports = config =>{
  const keys = {
    services:'start',
    transports:'transports',
    transport:'transport',
    clients:'clients',
    require:'require',
    config:'config',
    path:'path',
  }

  function makeDefaults(config){
    return {
      [keys.transport]:config[keys.transport],
      [keys.config]:config[keys.config],
      [keys.clients]:config[keys.clients],
    }
  }
  function findService(currPath,name,root){
    const path = [...currPath,...lodash.toPath(name)]
    if(lodash.has(root,path)) return path
    if(currPath.length === 0) return null
    return findService(currPath.slice(0,-1),name,root)
  }

  function expandService(root={},path=[],defaults={}){
    const strPath = path.join('.')

    assert(lodash.has(root,path),'No service definition for path: ' + strPath)
    assert(path.length > 1,'Service require a namespace: ' + strPath)

    let config = lodash.get(root,path)
    config = lodash.defaults(config,defaults)

    const transports = root[keys.transports]
    let transportid = config[keys.transport]
    let file = config[keys.require]

    assert(file,'missing service file for: '+ strPath)
    assert(transportid,'missing transport type for: '+ strPath)

    // const transport = transports[transportid]
    // assert(transport,'Transport definition missing for ' + transportid + ' in ' + strPath)

    let clients = config[keys.clients] || []
    let services = config[keys.services] || []

    let parentPath = path.slice(0,-1)

    clients = [...services,...clients].reduce((result,name)=>{
      // let clientPath = [...path,name].join('.')
      const clientPath = findService(path,name,root)
      assert(clientPath,'Unable to find client definition: ' + name + ' in ' + strPath)
      const client = lodash.get(root,clientPath)
      // const transportid = client[keys.transport]
      const transportPath = findService(clientPath,keys.transport,root)
      const transportid = lodash.get(root,transportPath)
      assert(transportid,'Unable to find client transport definition: ' + name + ' in ' + strPath)
      result[clientPath] = transportid
      assert(result[clientPath],'Transport definition missing for ' + transportid + ' in ' + strPath)
      return result
    },{})

    const result = {
      path,
      [keys.clients]:clients,
      [keys.transport]:config[keys.transport],
      [keys.require]:config[keys.require],
      [keys.config]:config[keys.config] || {},
    }

    return validateService(result,path)
  }
  function validateRoot(config,path){
    assert(path.length === 0,'Root path must be empty')
    assert(config[keys.services],'requires list of services to start')
    assert(config[keys.transports],'requires table of at least 1 transport defined')
    return config
  }

  function validateService(config,path){
    const strPath = path.join('.')
    assert(path.length > 1,'Sevice paths must be under a namspace')
    assert(config[keys.path],'requires full service path: ' + strPath + '.' + keys.path)
    assert(config[keys.transport],'requires a transport name: ' + strPath + '.' + keys.transport)
    assert(config[keys.require],'requires a service file: ' + strPath + '.' + keys.require)
    return config
  }
  function validateNamespace(config,path){
    assert(path.length === 1,'Namespace paths can only be top level')
    assert(!config[keys.require],'Namespace cannot have a service file')
    return config
  }

  function listServices(root,path=[],result=[]){
    // if(index && index > result.length) return result
    const services = lodash.get(root,[...path,keys.services],[])
    // console.log(path,services)
    if(services.length == 0){
      result.push(path)
      return result
    }
    if(path.length == 1) result.push(path)
    services.map(service=>{
      listServices(root,[...path,...lodash.toPath(service)],result)
    })
    if(path.length > 1) result.push(path)
    return result
  }

  function compile(root,path=[],stack=[],result=[]){
    assert(root,'requires full config object')
    validateRoot(root,path)

    const paths = listServices(root)

    const {list} = paths.reduce((result,path)=>{
      if(path.length == 1){
        result.default = makeDefaults(validateNamespace(lodash.get(root,path),path))
      }else{
        const expanded = expandService(result.services,path,result.default)
        lodash.set(result.services,path,expanded)
        result.list.push(expanded)
      }
      return result
    },{default:makeDefaults(root),services:lodash.cloneDeep(root),list:[]})

    return list

  }

  function merge(configs,path=[],result={}){
    const keys = lodash(configs,config=>{
      if(path.length===0){
        return lodash.keys(config)
      }else{
        return lodash.keys(lodash.get(config,path))
      }
    }).flatten().compact().uniq().value()

    const tree = lodash.reduce(keys,key=>{
      return [key,lodash.map(configs,[...path,key])]
    })

    const value = values.reduce((result,value,i)=>{
      if(result === null) return value
      if(value === undefined) return result
      if(lodash.isString(value)){
        assert(result == value,'Conflict of values in config on path ' + path + ' and config ' + i + 'values: ' + value + ' vs ' + result )
      }
      return result
    },null)


    keys.forEach(key=>{
      merge(...configs,[...path,key],result)
    })


  }



  return {
    expandService,
    compile,
    listServices,
    makeDefaults,
    merge,
  }
}
