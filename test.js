/**
 * Created by xuezhongxiong on 2017/1/16.
 */
'use strict';
const P = require('./index');
const adapter = {
  deferred: function () {
    let resolve, reject;

    const promise = P(new Promise(function (resolve1, reject1) {
      resolve = resolve1;
      reject  = reject1;
    }));

    return {
      promise: promise,
      resolve: resolve,
      reject : reject
    };
  }
};

describe("Promises/A+ Tests", function () {
  require("promises-aplus-tests").mocha(adapter);
});