const assert = require("assert");
const highland = require("highland");

const Events = require("../events");
const Streamify = require("../streamify");

module.exports = (config, service, transport) => {
  const { name, parallel = 1 } = config;
  assert(name, "requires service name");
  assert(service, "requires service");
  assert(transport, "requires transport");

  const requests = transport.subscribe(name, "requests", name);
  const responses = transport.publish(name, "responses", name);
  const streams = transport.publish(name, "streams", name);
  const errors = transport.publish(name, "errors", name);

  const request = Streamify(config, service, (channel, msg) => {
    switch (channel) {
      case "errors":
        return errors.write(msg);
      case "streams":
        return streams.write(msg);
      case "responses":
        return responses.write(msg);
      default:
        throw Error("unknown event channel: " + channel);
    }
  });

  if (config.async) {
    requests.each(request);
  } else {
    requests.map(request).map(highland).parallel(parallel).resume();
  }

  const makeEvent = Events("responses");

  return {
    emit(...args) {
      responses.write(makeEvent.create(...args));
    },
  };
};
