"use strict";
const defaultMethods = ['then', 'catch'];
const originPromise  = Promise;

/**
 * return a getter function (only {Function} can be called by handle.apply())
 * @param  {Promise}  target
 * @param  {String}   path
 * @return {Function} getter
 */
function setter(target, path) {
  Object.defineProperty(target, '__chainPath', {value: path});

  return () => target;
}

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
      const targetP = getter();
      const path    = Reflect.get(targetP, '__chainPath');

      if (prop === '__type') return 'promixy';
      if (prop === '__chainPath') return path;
      if (prop === '__promise') return targetP;

      //promise method
      if (promiseMethods.includes(prop) && Reflect.has(targetP, prop)) {
        return new Proxy(setter(
          Promise.resolve(Reflect.get(targetP, prop).bind(targetP)),
          `${path}.[Promise: ${prop.toString()}]`,
          targetP
        ), handler);
      }

      //get target's property
      return new Proxy(setter(
        targetP.then(function (target) {
          if (target == null) throw new TypeError(`can't read property '${prop}' in ${path}, it got a ${target}`);
          const value = Reflect.get(target, prop);

          if (typeof value === 'function')
            return value.bind(target);
          else
            return value;
        }),
        `${path}.${prop.toString()}`
      ), handler);
    },

    set(getter, prop, value, receiver){
      const targetP = getter();

      targetP.then(function (target) {
        Reflect.set(target, prop, value);
      });
      return true;
    },


    apply(getter, thisArg, argList){
      const targetP    = getter();
      const path       = Reflect.get(targetP, '__chainPath');

      //get function and run
      return new Proxy(setter(
        targetP.then(function (target) {
          if (target == null || typeof target !== 'function')
            throw new TypeError(`${path} is not function, got a ${typeof target}: ${target}`);

          //try use origin promise
          argList = argList.map(a => Promise.resolve(a && a.__promise || a).catch(e => e));

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