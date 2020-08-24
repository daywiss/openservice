const highland = require("highland");
const assert = require("assert");

//wrap nats into a stream with some default config
//and json encoding
function Natss(config, emit = (x) => x) {
  const natss = require("node-nats-streaming");
  let stan = null;
  const now = Date.now();
  // may add batch with time or count at some point, but not quite yet
  const {
    durable = false,
    batchCount = 1,
    batchTime = 1,
    // parallel = 100,
  } = config;
  function publish(channel) {
    assert(channel, "requires channel");
    const stream = highland();

    stream
      .batchWithTimeOrCount(batchTime, batchCount)
      .map(JSON.stringify)
      .map((data) => {
        return new Promise((res, rej) => {
          stan.publish(channel, data, (err, guid) => {
            if (err) return rej(err);
            res(guid);
          });
        });
      })
      .flatMap(highland)
      // .map(highland)
      // .parallel(parallel)
      .errors((err, next) => {
        if (err) emit("error", err);
        next();
      })
      .resume();
    return stream;
  }

  function subscribe(channel, durableName) {
    assert(channel, "requires channel");
    var opts = stan.subscriptionOptions();

    opts.setManualAckMode(true);
    if (durable) {
      opts.setDurableName(durableName);
      opts.setDeliverAllAvailable();
    } else {
      opts.setStartTime(now);
    }

    const sub = stan.subscribe(channel, opts);

    return (
      highland("message", sub)
        .map((msg) => {
          msg.ack();
          return JSON.parse(msg.getData());
        })
        .flatten()
        // .doto(console.log)
        .errors((err, next) => {
          if (err) emit("error", err);
          next();
        })
    );
  }

  function disconnect() {
    return stan.close();
  }

  function connect(config) {
    assert(config.url, "natss requires server url");
    assert(config.clusterid, "natss requires clusterid");
    assert(config.clientid, "natss requires clientid");
    stan = natss.connect(config.clusterid, config.clientid, config.url);
    return new Promise((res, rej) => {
      stan.once("connect", () => {
        res({ publish, subscribe, disconnect });
      });
      stan.once("error", rej);
    });
  }

  return connect(config);
}

module.exports = async (config) => {
  const publishers = new Map();
  const subscribers = new Map();

  const transport = await Natss(config, (type, data) => {
    if (type === "error") {
      console.log("nats transport error:", data);
      throw data;
    }
  });

  function publish(service, channel) {
    const id = [service, channel].join(".");
    if (publishers.has(id)) return publishers.get(id);
    const pub = transport.publish(id);
    publishers.set(id, pub);
    return pub;
  }

  function subscribe(service, channel, origin) {
    const id = [service, channel].join(".");
    const sid = [service, channel, origin].join("!");
    //each originating client gets their own subscription to a service channel
    if (subscribers.has(sid)) return subscribers.get(sid);
    const sub = transport.subscribe(id, origin);
    subscribers.set(sid, sub);
    return sub;
  }

  return {
    publish,
    subscribe,
    transport,
    close: transport.disconnect,
  };
};

module.exports.Natss = Natss;
