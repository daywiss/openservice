const highland = require("highland");
const lodash = require("lodash");
const assert = require("assert");

const utils = require("../utils");

module.exports = function (config, methods, emit = (x) => x) {
  const { name } = config;
  assert(name, "requires stream name");
  function makeEmit(channel, result, event) {
    const msg = {
      id: event.id,
      channel,
      path: event.path,
      args: event.args ? [result, ...event.args] : [result],
    };
    emit(channel, msg);
  }

  return async function (event) {
    try {
      const { path, args } = event;
      let call;
      if (path.length > 0) {
        call = lodash.get(methods, path);
      } else {
        assert(lodash.isFunction(methods), "Root path is not a function");
        call = methods;
      }
      if (!lodash.isFunction(call)) {
        throw new Error(
          `Call to non existent function on ${name}.${path.join(
            "."
          )}(${JSON.stringify(args)})`
        );
      }
      var resolve;
      //this is checking if we are making a call on a mocked client
      //if so calling .apply will not work for whatever reason,
      //so call directly, otherwise apply with "this" object
      if (call.isMock) {
        resolve = await call(...args);
      } else {
        resolve = await call.apply(methods, args);
      }

      if (highland.isStream(resolve)) {
        resolve
          .doto((x) => {
            makeEmit("streams", x, event);
          })
          .errors((err, next) => {
            next(err);
            resolve.destroy();
          })
          .done(() => {
            makeEmit("streams", "terminate!", event);
            resolve.destroy();
          });
      } else {
        makeEmit("responses", resolve, event);
      }
    } catch (reject) {
      if (reject instanceof Error) {
        makeEmit("errors", utils.parseError(reject), event);
      } else {
        makeEmit("errors", reject, event);
      }
    }
  };
};
