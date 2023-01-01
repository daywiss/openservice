import highland from "highland";
import lodash from "lodash";
import assert from "assert";
import * as utils from "../utils";

type Config = {
  name: string;
};
type Methods = (...args: unknown[]) => unknown;
type EventData = {
  id: string;
  channel: string;
  path: string[];
  args: unknown[];
};
type Event = {
  id: string;
  path: string[];
  args: unknown[];
};
type Emit = (channel: string, data: EventData) => void;

export default (config: Config, methods: Methods, emit: Emit) => {
  const { name } = config;

  function makeEmit(channel: string, result: unknown, event: Event) {
    const msg = {
      id: event.id,
      channel,
      path: event.path,
      args: event.args ? [result, ...event.args] : [result],
    };
    emit(channel, msg);
  }
  function handleEvent(event: Event) {
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
      if (reject.message && reject.stack) {
        makeEmit("errors", utils.parseError(reject), event);
      } else {
        makeEmit("errors", reject, event);
      }
    }
  }
};

//  return async function (event) {
//    try {
//      const { path, args } = event;
//      let call;
//      if (path.length > 0) {
//        call = lodash.get(methods, path);
//      } else {
//        assert(lodash.isFunction(methods), "Root path is not a function");
//        call = methods;
//      }
//      if (!lodash.isFunction(call)) {
//        throw new Error(
//          `Call to non existent function on ${name}.${path.join(
//            "."
//          )}(${JSON.stringify(args)})`
//        );
//      }
//      var resolve;
//      //this is checking if we are making a call on a mocked client
//      //if so calling .apply will not work for whatever reason,
//      //so call directly, otherwise apply with "this" object
//      if (call.isMock) {
//        resolve = await call(...args);
//      } else {
//        resolve = await call.apply(methods, args);
//      }

//      if (highland.isStream(resolve)) {
//        resolve
//          .doto((x) => {
//            makeEmit("streams", x, event);
//          })
//          .errors((err, next) => {
//            next(err);
//            resolve.destroy();
//          })
//          .done(() => {
//            makeEmit("streams", "terminate!", event);
//            resolve.destroy();
//          });
//      } else {
//        makeEmit("responses", resolve, event);
//      }
//    } catch (reject) {
//      if (reject.message && reject.stack) {
//        makeEmit("errors", utils.parseError(reject), event);
//      } else {
//        makeEmit("errors", reject, event);
//      }
//    }
//  };
//};
