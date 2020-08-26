const lodash = require("lodash");
const assert = require("assert");
module.exports = (cb) => {
  assert(lodash.isFunction(cb), "Requires callback function");
  return PathProxy(cb);
};

function PathProxy(cb, path = []) {
  const handlers = {
    get(target, prop) {
      if (prop === "then") return;
      if (prop === "isMock") return true;
      if (typeof prop !== "string") {
        return () => {
          throw new Error(
            "Unable to access property on path: " +
              [...path, String(prop)].join(".")
          );
        };
      }
      return PathProxy(cb, [...path, prop]);
    },
    set(obj, prop, value) {
      return cb("set", [...path, prop], value);
    },
    // deleteProperty(target,prop){
    //   return cb('delete',[...path,prop])
    // },
    // has(target,prop){
    //   return cb('has',[...path,prop])
    // },
    apply(target, thisArg, args) {
      return cb("apply", path, args);
    },
    // construct(){
    //   throw new Error('construct not supported in mock')
    // },
    // defineProperty(){
    //   throw new Error('defineProperty not supported in mock')
    // },
    // getOwnPropertyDescriptor(){
    //   throw new Error('getOwnPropertyDescriptor not supported in mock')
    // },
    // getPrototypeOf(...args){
    //   return cb('getPrototypeOf',path,...args)
    // console.log(args.toString())
    // throw new Error('getPrototypeOf not supported in mock')
    // },
    // ownKeys(){
    //   throw new Error('ownKeys not supported in mock')
    // },
    // preventExtension(){
    //   throw new Error('preventExtension not supported in mock')
    // },
    // setPrototypeOf(){
    //   throw new Error('setPrototypeOf not supported in mock')
    // },
  };
  return new Proxy((x) => x, handlers);
}
