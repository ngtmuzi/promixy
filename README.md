# promixy
A module help you make sync calling chain on Promise.
Talk is cheap, show you the code.

# Usage
## Get and Apply
You can use it like:

```javascript
var _ = require('promixy');

_({a: 12333})
  .a.toString().split('')[0].toString()
  .then(a=>a + 'yes')
  .replace('1', 'replaceStr')
  .then(console.log, console.error);
```
If you want get the origin promise object just use `a.__promise`,
if you want get the calling chain just use `a.__chainPath`,
otherwise promixy object always return a Proxy with Promise,
so you must attention if you want get the value of Promise you must use `.then`.

## Set

You can set property value to promixy like that:
```javascript
var a  = _({b: {c: 123}});
var b  = a.b;
var x = a.b.c.toString();

a.b.c = 456;

a.then(console.log, console.error);
b.then(console.log, console.error);
x.then(console.log, console.error);

//{ b: { c: { as: 456 } } }
//{ c: { as: 456 } }
//123
```

# Options
You can set default value through `require('promixy').setDefault` like that:

```javascript
var _ = require('promixy').setDefault({
  methods: ['tap', 'map'],
  Promise: require('bluebird')
});
```
##methods
If you use some module like `bluebird` that provide many method to Promise, you can choose what method can use on promixy.
##Promise
And you can define the what Promise Library that promixy use.

# Note
This module only can run in Node 6.x because it use `Proxy`.
