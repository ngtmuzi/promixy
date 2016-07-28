"use strict";
const setter         = (targetP, path)=> ()=>({targetP, path});
const defaultMethods = ['then', 'catch'];
const originPromise  = Promise;

/**
 * @param opts {Object}
 * @param opts.Promise {Promise}
 * @param opts.methods {[String]}
 * @returns {*}
 */
function makePromixy(opts = {}) {
  let promiseMethods = [].concat(defaultMethods, opts.methods || []);
  let Promise        = opts.Promise || originPromise;

  const handler = {
    get(getter, prop, receiver){

      let {targetP, path} = getter();

      if (prop === '__chainPath') return path;
      if (prop === '__promise') return targetP;

      //promise method
      if (promiseMethods.includes(prop) && targetP[prop]) {
        return new Proxy(setter(
          Promise.resolve(targetP[prop].bind(targetP)),
          `${path}.[Promise: ${prop}]`
        ), handler);
      }

      //target property
      return new Proxy(setter(
        targetP.then(function (target) {
          if (target == null) throw new TypeError(`can't read property '${prop}' in ${path}, it got a ${target}`);

          if (typeof target[prop] === 'function')
            return target[prop].bind(target);
          else
            return target[prop];
        }),
        `${path}.${prop}`
      ), handler);
    },

    set(getter, prop, value, receiver){
      let {targetP, path} = getter();
      targetP.then(function (target) {
        Reflect.set(target, prop, value);
      });
      return true;
    },


    apply(getter, thisArg, argList){
      let {targetP, path} = getter();

      //get function and run
      return new Proxy(setter(
        targetP.then(function (target) {
          if (target == null || typeof target !== 'function')
            throw new TypeError(`${path} is not function, got a ${typeof target}: ${target}`);
          
          //try use origin promise
          argList = argList.map(a=> a.__promise || a);

          //try to calculate the promise value 
          return Promise.all(argList)
            .then(function (argList) {
              try {
                return Reflect.apply(target, thisArg, argList);
              } catch (err) {
                //add the call chain path
                if (err.stack && !err.__alreadyCatch) {
                  err.stack = `${err.stack}\n\tPromixy chain: ${path}(${argList.length} args)`;
                  Object.defineProperty(err, '__alreadyCatch', {value: true});
                }
                return Promise.reject(err);
              }
            });

        }),
        `${path}(${argList.length} args)`
      ), handler);
    },

    getPrototypeOf(target){
      return Promise;
    }
  };

  return val => new Proxy(setter(Promise.resolve(val), '{Promixy}'), handler);
}

/**
 * @param val
 * @return {Promise}
 */
module.exports = makePromixy();
module.exports.setDefault = makePromixy;