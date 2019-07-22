module.exports = config => {
  const Service = {
    [config.transport]:'string',
    [config.start]:{type:'array',items:'string'},
    [config.config]:{type:'object',optional:true},
    [config.require]:'string',
    [config.clients]:{type:'array',items:'string',optional:true},
  }
  const Transport = {
    [config.require]:'string',
    [config.config]:{type:'object',optional:true},
  }
  const Config = {
    [config.start]:{type:'array',items:'string'},
    [config.transports]:{type:'object'},
    [config.config]:{type:'object',optional:true},
  }
  const Client = {
    [config.path]:{type:'array',items:'string'},
    [config.transport]:{type:'object',props:Transport},
  }
  return {
    Service,
    Client,
    Config,
    Transport
  }
}
