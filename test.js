var Promise = require('bluebird');
var _       = require('./index').setDefault({
  methods: ['tap', 'then', 'catch', 'map', 'value'],
  Promise
});

var test = _({a: 12345});
var aaa  = test.a;

setTimeout(function () {
  test.a = 2333;
  test.then(console.log);
}, 200);

setTimeout(function () {
  aaa.then(console.log);
}, 400);