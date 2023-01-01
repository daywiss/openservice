import {reduce, get, castArray, isArray, isString} from 'lodash'
import assert from 'assert'

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ONE_DAY_MAS = 24 * ONE_HOUR_MS;

//type Filter = Record<string,unknown>

//export const objectFilter = (filter={})  => (obj:Record<string,unknown>) => {
//  return reduce(filter,(result,value,key)=>{
//     //did the filter pass
//     if (result === false) return false;
//     const valueArray = castArray(value);
//     //check the object for the key
//     const check = get(obj, key);
//     if (isArray(check)) {
//       if (check.length === 0 && valueArray.length === 0) return true;
//       //this is saying if we specified an empty array to filter
//       //only match if the event has an empty array
//       // console.log('filter',filter,'check',check,'key',key,'value',value)
//       if (valueArray.length === 0) return false;
//       // check each value in the path to ensure complete match.
//       return valueArray.reduce((result, val, i) => {
//         if (val == check[i]) return result;
//         return false;
//       }, true);
//     } else if(isString(check)) {
//       return valueArray.includes(check);
//     }
//  },true)
//}
//exports.objectFilter = (filter = {}) => (obj) => {
//  return lodash.reduce(
//    filter,
//    (result, value, key) => {
//      //did the filter pass
//      if (result === false) return false;
//      //cast filter params to an array
//      value = lodash.castArray(value);
//      //check the object for the key
//      const check = lodash.get(obj, key);

//      if (lodash.isArray(check)) {
//        if (check.length === 0 && value.length === 0) return true;
//        //this is saying if we specified an empty array to filter
//        //only match if the event has an empty array
//        // console.log('filter',filter,'check',check,'key',key,'value',value)
//        if (value.length === 0) return false;
//        // return lodash.intersection(check, value).length > 0
//        // check each value in the path to ensure complete match.
//        return value.reduce((result, val, i) => {
//          if (val == check[i]) return result;
//          return false;
//        }, true);
//      } else {
//        return value.includes(check);
//      }
//    },
//    true
//  );
//};

//exports.timeout = (promise, delay, message) => {
//  return Promise.race([
//    promise,
//    new Promise((res, rej) => setTimeout(() => rej(message), delay)),
//  ]);
//};

//exports.loopWhile = async (promise, delay, ...args) => {
//  const result = await promise(...args);
//  if (!result) return;
//  await new Promise((resolve) => setTimeout(resolve, delay));
//  return exports.loopWhile(promise, delay, ...args);
//};
//exports.delay = (delay = 0) => {
//  return new Promise((resolve) => setTimeout(resolve, delay));
//};

//exports.loop = async (fn, delay = 1000, max, count = 0, result) => {
//  assert(lodash.isFunction(fn), "loop requires a function");
//  if (max && count >= max) return result;
//  result = await fn(count);
//  await new Promise((res) => setTimeout(res, delay));
//  return exports.loop(fn, delay, max, count + 1, result);
//};

//exports.difference = (oldState, newState) => {
//  return lodash.omitBy(newState, function (v, k) {
//    return lodash.isEqual(oldState[k], v);
//  });
//};

//exports.flattenJson = (json = {}, path = [], result = []) => {
//  if (!lodash.isObject(json) || lodash.isArray(json)) {
//    return result.push(path.join(".") + "=" + json);
//  }

//  lodash.each(json, (value, key) => {
//    exports.flattenJson(value, path.concat(key), result);
//  });

//  return result;
//};

export const CleanStack = (ignore:RegExp[] = []) => (stack:string, start:number= 0, end?:number) => {
  return stack
    .split("\n")
    .slice(start, end)
    .filter((line) => {
      return ignore.reduce((result, regex) => {
        return result && !regex.test(line);
      }, true);
    })
    .join("\n");
};

export const cleanStack = CleanStack([
  /node_modules/,
  /streamify/,
  /calls\.js/,
  /client\.js/,
  /mock\.js/,
  /<anonymous>/,
  /internal\/process/,
]);

//exports.cleanStack = cleanStack;

export const parseError = (err:Error & {code?:string}) => {
  assert(err.message, "requires error message");
  try {
    return {
      message: err.message,
      code: err.code || null,
      stack: cleanStack(err.stack || ""),
    };
  } catch (e) {
    console.log(e);
  }
};

//exports.RelativePath = (mypath) => (path) => {
//  return path.reduce((result, part, i) => {
//    if (result.length > 0 || mypath[i] !== part) result.push(part);
//    return result;
//  }, []);
//};

