const Mock = require("../mock");
const Calls = require("../calls");
const Emits = require("../emits");
const Listen = require("../listen");
const assert = require("assert");
const moment = require("moment");

module.exports = (config = {}, transport, service) => {
  const {
    name,
    old = 10000,
    emit = "emit",
    listen = "listen",
    stream = "stream",
    on = "on",
  } = config;

  assert(name, "requires name");
  assert(transport, "requires transport");

  const requests = transport.publish(name, "requests", service);
  const responses = transport.subscribe(name, "responses", service);
  const streams = transport.subscribe(name, "streams", service);
  const errors = transport.subscribe(name, "errors", service);

  assert(requests, "requires requests stream");
  assert(responses, "requires responses stream");
  assert(streams, "requires streams stream");
  assert(errors, "requires errors stream");

  const emitStream = Emits("requests", (event) => requests.write(event));
  const listenStream = Listen();

  const callStream = Calls("requests", (event) => requests.write(event));

  responses.map(callStream.respond).resume();

  streams.map(callStream.respond).resume();

  errors.map(callStream.respond).resume();

  responses.observe().pipe(listenStream);

  setInterval(() => {
    const pending = callStream.getPending(old);
    const now = Date.now();
    pending.forEach((event) => {
      const duration = moment.duration(now - event.ts, "ms").humanize();
      console.log(
        `Warning: Service ${service} waiting ${duration} for response from ${name}.${event.event.path.join(
          "."
        )}`
      );
    });
  }, old);

  return Mock((type, path, args) => {
    if (type !== "apply") return;

    if (path.length === 1 && (path[0] === on || path[0] === listen)) {
      return listenStream.listen(...args);
    }

    if (path.length === 1 && path[0] === stream) {
      return listenStream.stream(...args);
    }

    if (path.length === 1 && path[0] === emit) {
      return emitStream.call(...args);
    }
    return callStream.call(path, ...args);
  });
};
