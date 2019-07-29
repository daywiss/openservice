# Open Service Microservice Framework
A modern micro-service framework meant to simplify and improve your application development, testing, deployment
and maintenance. 

## Install
`npm install -g openservice`

## Run
You must have a configuration file, env, or json and your service code. See the API section for more information.

`openservice config.js`

## Quick Start
Quick reference for getting started.
### Service Definition

```js
//in service.js
module.exports = async (config,services,emit)=>{
  return {
  }
}

```
### Config Definition
```js
//in config.js
module.exports = {
  name:'quickstart',
  paths:[process.cwd()],
  start:[
    'quickstart.service'
  ],
  transports:{
    local:{
      require:'openservice/transports/local'
    },
    natss:{
      require:'openservice/transports/natss'
      config:{
        clusterid:'test-cluster',
        clientid:'quickstart',
      }
    }
  },
  quickstart:{
    service:{
      require:'service',
      transport:'local',
      clients:[],
      config:{},
    }
  }
}
```

### Secret ENV
In .env file or environment variables
```
transports.natss.config.url=nats://localhost:4223
quickstart.service.config.secret=12345
```

### Starting Service
From the command line:
`openservice config.js`

Or from within a js file
```js
const OpenService = require('openservice')
const config = require('./config')

OpenService(config).then(([service])=>{
  console.log('Services started')
}).catch(err=>console.log(err)

```


## Features
- Streaming pluggable transport layer. Works best with durable stream like Kafka or Nats-Streaming. Allows user to 
  add new transports as long as they can be transfomed to a publish/subscribe stream. 
- Promise based interface for service to service communication but also supports streaming, listening and emitting events.
- Very simple API, expose new services as a function which returns methods. 
- Seperates environment for wiring and for secrets. Wiring can be persisted in repo, secrets can be merged through envs.
- Create a single docker container to deploy multiple services.

## Motivation
Microservices can be confusing to design and implement. This framework is a collection of conventions informed from 
years of experience which give you the flexibility to create powerful applications while while 
keeping the complexity low. OpenService allows you to write code in natural js with async/await, callbacks, event emitters 
and streams. Ultimately we want to remove the overhead of designing a good architecture and lets you focus on
writing application code. 

## Getting Started
### Create A Service
In this framework a service is a single function which returns some methods. You can imagine it
as a library accessible over some kind of transport or inter process communication layer. The functions
your service returns are the public functions accessible to any other service on the network. 

#### Service Signature
The top level function of the service expects some special arguments. These are standard within
the OpenService framework. First is the config object, a plain json object which you can put in
any arbitrary data from your configs or envs. Second is a special object which has access other services.
Third is a function, similar to Nodes `events.emit` function, which the service can call to emit events to
the network. This convention is useful not only for services but libraries or classes in general and allows for flexibilty
and testability of the service. 

`async function(config,services,emit) => {}`

* config - This is a plain js object with options specified by the user. In practice these will map
to environment variables to allow configuration of the service at run time. 

* services - this is a js object keyed by external service names. These represent external services
which the current service is dependent on and are injected in when the service starts. Each service has
a client which allows the developer to call functions in the typical async await pattern.

* emit - this is a function which allows the service to emit messages for interested listeners. You will treat
this similiar to a node event emitter in which you specify the topic and then the data. 


#### Service Example
Create a service with a function signature like this, which you can find in `examples/basic/basic.js`:

```js
//services are exposed as an asyncronous function with some standard parameters.
//this allows the service to take in all the information about the world it needs
module.exports = async (config,services,emit)=>{
  //services return a set of functions which the outside world can call
  return {
    hello(text='world'){
      return ['hello',text].join(' ')
    }
  }
}
```

#### Service Output
A service has the option of returning serveral things:
* nothing - service returns nothing on instantiation, this means nothing can call it externally
* a function - service returns a single function which can be called by other services
* a class - service returns a class or key value object of functions, this will be exposed to external services as its api

### Service Clients API
The framework takes care of wrapping up your services and exposing them to the transport layer, and a client
is created and injected into your service as a dependency if you specify a service needs it. Clients 
connect to the transport for you and create an interface to allow local-like interactions with an external service.

#### Async/Await Calls
You can call your external service as if it was a local library. This is achieved through JS Proxy which 
takes your path and calls the remote service behind the scenes. This is an example of what it looks like
to make calls to other clients.
```js
//imagine you have a service with some dependencies
//one of your clients is a users table with some on it.
module.exports = async (config,services) => {
  //services has users, wallets, notify clients 
  async function withdraw(userid,amount){
    //first make sure the user exists
    const user = await services.users.get(userid)
    //get withdraw from users wallet, which has same id as user
    const wallet = await services.wallets.withdraw(userid,amount)
    //send a notification to the user
    return services.notify.success(userid,'You successfully withdrew ' + amount)
  }
  ...

  return {
    withdraw
  }
}
```

#### Listening to Events
All services produce events as they get called and return data. We can tap into this data stream using a
callback API. This will be called when services return data from calls.

`services.wallets.withdraw.listen((result,...arguments)=>{})`
or
`services.wallets.on('listen',(result,...arguments)=>{})`

In an example in a statistics service:

```js
module.exports = async (config,services) => {
  //services has wallets
  const stats = {
    totalWithdrawn:0
  }

  services.wallets.on('withdraw',(wallet,userid,amount)=>{
    //update total withdrawn amount
    stats.totalWithdrawn += amount
  })

  return {
    getStats(){
      return stats
    }
  }
}
```

#### Listening to Event Streams
OpenService uses the node stream compatible library highland to wrap streams and give you some
extra functionality. We can access the underlying service streams to do processing on rather
than the event emitter. The stream give you extra meta data about the event.

`const stream = services.wallets.listen()`

An event object has this schema

```js
{
  //event channel: requests, responses, streams, errors
  channel: 'string',
  //service function path like, ['withdraw']
  path: { type: 'array', items: 'string' },
  //function arguments, for requests this is simply the arguments to the function
  //for responses, the response is first, and the arguments start at args[1]
  args: 'array',
}
```

```js
module.exports = async (config,services) => {
  //services has wallets
  const stats = {
    totalWithdrawn:0
  }

  const walletStream = services.wallets.listen()

  //highland exposes the each callback
  walletStream.each(({path,args})=>{
    //we can switch on path, this will listen for all
    //calls to the wallet
    switch(path[0]){
      case 'withdraw':
        stats.totalWithdrawn += args[2] //result, userid, amount
        break
    }
  })

  return {
    getStats(){
      return stats
    }
  }
}
```

### Service Client Example
Here is an example of the flexibility of a service client:

```js
//imagine we have a service where we have injected
//a service dependency.
module.exports = async (config,services)=>{
  //we have an external service called time
  const { time } = services

  //there are several ways to interface with this

  //we can make a request response call
  let now = await time.getTime()

  //we can emit a fire and forget message. Time has a function called sync, and this framwork
  //attaches a utility to "emit" to the function by emiting a 1 way message where we dont care
  //about the response. We still await though as network needs to confirm message sent.
  await time.sync.emit(Date.now(),'my service')

  //we can listen for updates. The time service is emitting an event on the channel
  //called "tick". The client uses the keyword "listen" to listen on that channel
  //and callback the updates.
  await time.tick.listen(current=>{
    now = current
  })


  //streams are also available to you, wrapped wiht the highland js library
  //in this instance we want to know if sync is being called by other services
  //streams give you access to a more advanced event structure. 

  const syncStream = time.sync.listen()

  //the event structure contains the services response to the call
  //as well as any of the callers arguments. Events are also available
  //for request response calls

  syncStream.filter(event=>{
    //args: [service response, caller argument 1, caller argument 2]
    const {args:[response,time,serviceid]} = event

    //highland has a filter operation which works like js filter. 
    //here we just filer out our own calls to sync
    return serviceid != 'my service'
  }).each(event=>{
    const {args:[response,time,serviceid]} = event
    console.log(serviceid,'synced the time')
  })

  return {
    now(){
      return now
    }
  }

}
```

### Starting Services
Services start through the openservice app and pass it a config file, .env or environment variables.
This is as simple as running the app and passing in your configuration files. These
files are optional as the entire configuration can be defined through environment variables.
As complexity of the project grows, its recommended you break out wiring into commitable files
vs secrets as environment variables.

`openservice ./service-config.js ./service-secrets.js`

#### The Configuration File
Configs can be represented through env vars or through a JS object. The configuration tells openservice
where to find your services files, what dependencies they need and any additional data the service needs. 
Configurations should be able to be merged together. In order to facilitate this theres a specific 
convention to define environment variables.

```js
//this is the top level of the config file
module.exports = {
  name:string,    //required, gives a name for logs and errors for this service
  start:string[], //the services you want to start in this processs using the string path
  config:object,  //global configuration you want passed into every service defined
  paths:string[], //paths to where your service files are located
  transports:object, //key value of all available transports
}
```

Each individual service configuration is defined in the json object at a path. Services need
to be namespaced in a top level directory in the config. This can be achieved like this.

```js
require:string,   //the path of the service file
transport:string, //the name of the transport this service uses
clients:string[], //the path to any clients this service needs
config:object,    //configuration object passed into this service
```

See examples/basic/config.js or examples/advanced/config.js

#### Environment and Secrets
Environment variables are very important for configuring your services and this architecture accepts a 
convention for injecting variables into your service defintion. For example if you need to pass sensitive
data you do not want committed to your project you can specify it in an .env file or your env variables.
The convetion for injecting variables follows lodash's `set` interface. Furthermore the architecture
will ignore any envs which begin with an uppercase, so only lowercase envs will be observed. In practice it
produces something like this:

```
express.cookieSecret=1234qwerty
users.username=admin
users.password=qwerty
auth.systemToken=abcdefg
```

These key strings get parsed and merged into your configuration object using lodash's set producing this 
ultimate configuration:

```
{
  ...,
  users:{
   file:'./services/users', 
   clients:[],
   //additional configuration for database table
   table:'users',
   //merged from env:
   username:'admin',
   password:'querty',
  },
  auth:{
   file:'./services/auth', 
   clients:['users'],
   //merged from env:
   systemToken:abcdefg
  },
  express:{
   file:'./services/express', 
   clients:['api'],
   port:80,
   //merged from env:
   cookieSecret:1234qwerty
  },
  ...
}
```

### Transports
In order to do a lot of interesting microservice stuff the architecture has abstracted the transport into
a collection of streams. The developer doesnt need to delve into the technical aspects of it, but this abstraction
allows flexibility to wrap almost any specific networking messaging system, or even run locally within the 
same process without the underlying service logic ever changing. The real power comes in when using
an ordering logging based messaging system like Kafka or Nats Streaming. This will give the entire 
architecture durability for events, allowing services to go offline without affecting consistency of the
rest of the system.  

#### Transport Driver
Messaging systems are abstracted into streams with a particular API. This is all you need is a publsh
and subscribe stream to define a custom transport. This is an example of wrapping a local stream
into a compatible streaming transport. Using a local stream allows you to test your entire
architecture locally in a single process without using IPC. If your architecture is fairly
low power, this is a highly performant way of wiring services together and can always be replaced
later with more robust messaging system.

```js
const highland = require('highland')

module.exports = config => {
  const transports = {}
  const streams = new Map()

  function publish(service, channel) {
    const id = [service, channel].join('.')
    if (streams.has(id)) return streams.get(id)
    const pub = highland()
    pub.resume()
    streams.set(id, pub)
    return pub
  }

  function subscribe(service, channel) {
    const id = [service, channel].join('.')
    if (streams.has(id)) return streams.get(id).observe()
    const sub = highland()
    streams.set(id, sub)
    return sub
  }

  //transports just require that you output functions to
  //get publish and subscribe streams for unique services
  return {
    publish,
    subscribe,
  }
}
```

### Service Streams and Channels
Under the hood there is a basic philosophy for isolating and exposing service chatter. Services
are represented as streams of events. Each service has 3 types of streams we call channels: "Request" "Response" and "Error".
These channels are isolated from each other and can be written to or listened to independently. Typically
a service only writes to its response and error channels, while other services can write to the request channel and
listen to the other two.

Function calls ultimately are the subject of these streams, and you can imagine request streams are incoming
to a service and call its functions. Response streams are outgoing and write function responses. Error streams,
also outgoing, writes thrown errors. These are represented as events which are funnelled 
to the transport layer. Anyone with access to the transport can observe the events in a raw form on all channels
for all services. This has some limited utility but in practive a dev will want to interpret the streams back 
into a typical promise based api. This architecture handles that for you by presenting service clients
directly injected into the service. 

As a streaming event based architecture, its best paired (though not required) with an ordered and 
durable transport layer to allow deterministic and consistent behavior through the rest of the system.

### Service Multiplexing
Traditionally services are thought of as 1 to 1 to an application, kubenetes pod or docker container.
This architecture discards that notion. It has no opinion on how many services you run in a single application.
This allows flexibilty for economizing server usage by intelligently bundling many services together into
a single container or pod. The downside is that this leads to yet another container configuration specification, as these
services are much like containers, but hopefully a bit simpler. Most of these specifications can be bundled with
the source code as it defines mainly service names and dependencies.

### Configuring the Application
Services typically need to talk to other services. This architecture requires the developer do this explicitly.
Each application will require its own service definitions. These specify which services you want to run,
where to find them, what you want to name them, how to configure them, and what dependencies. These are all
specified in a json object.

```js
module.exports = {
  //these are the services you want to run in your application. These names are what is exposed
  //in your service dependencies, so name carefully. You want your services names to be unique.
  //This also has a side effect of ordering the startup of each service. So place the most important
  //services first so that they can be relied on as dependents of other services. Otherwise
  //the application may deadlock on startup.
  services:[
    'users',
    'auth',
    'api',
    'express',
  ],
  //here is where you specificy transport type. We are using a nats streaming driver.
  //it has certain configuration requirments which you pass in here.
  transport:{
    type:'natss'
    clientid: 'mysite',
  },
  //all of these represent configuration for each service and get passed
  //in the service as the first argument "config".
  users:{
   //the service file is found here
   file:'./services/users', 
   clients:[],
   //additional configuration for database table
   table:'users',
  },
  auth:{
   file:'./services/auth', 
   clients:['users'],
  },
  api:{
   file:'./services/api', 
   //you can also specify remote services by name. Wallets could run in a seperate application
   //but is avaialble through the transport layer.
   clients:['auth','users','wallets'],
  },
  express:{
   file:'./services/express', 
   clients:['api'],
   port:80
  },
}

```




