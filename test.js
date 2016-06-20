//var Promise = require('bluebird');
var _ = require('./index').setDefault({
  methods: ['tap', 'map', 'value'],
  Promise
});
//
//var test = _({a: 12345});
//var aaa  = test.a;
//
//setTimeout(function () {
//  test.a = 2333;
//  test.then(console.log);
//}, 200);
//
//setTimeout(function () {
//  aaa.then(console.log);
//}, 400);
//
//_({a: 12333})
//  .a.toString().split('')[0].toString()
//  .then(a=>a + 'yes')
//  .replace('1', 'replaceStr')
//
//
//  .then(console.log.bind(null, 'result:'), console.error.bind(null, 'catch error:'));


//var a  = _({b: {c: 123}});
//var b  = a.b;
//var x = a.b.c.toString();
//
//a.b.c = 456;
//
//a.then(console.log, console.error);
//b.then(console.log, console.error);
//x.then(console.log, console.error);
var times = 0;

var a = _({run: ()=>times++});
a.run().then(console.log, console.error);
a.run().then(console.log, console.error);

var b = a.run;
b().then(console.log, console.error);
b().then(console.log, console.error);

var c = a.run();
c.then(console.log, console.error);
c.then(console.log, console.error);
