# jade-attrs

Generate code for jade attributes

[![Build Status](https://img.shields.io/travis/jadejs/jade-attrs/master.svg)](https://travis-ci.org/jadejs/jade-attrs)
[![Dependency Status](https://img.shields.io/gemnasium/jadejs/jade-attrs.svg)](https://gemnasium.com/jadejs/jade-attrs)
[![NPM version](https://img.shields.io/npm/v/jade-attrs.svg)](https://www.npmjs.org/package/jade-attrs)

## Installation

    npm install jade-attrs

## Usage

```js
var assert = require('assert');
var compileAttrs = require('jade-attrs');
var runtime = require('jade-runtime');

assert.strictEqual(Function('jade', 'return ' + compileAttrs([
  {name: 'foo', val: '"bar"', escaped: true}
], {
  terse: true,
  format: 'html',
  runtime: function (name) { return 'jade.' + name; }
}))(runtime), ' foo="bar"');
assert.deepEqual(Function('jade', 'return ' + compileAttrs([
  {name: 'foo', val: '"bar"', escaped: true}
], {
  terse: true,
  format: 'object',
  runtime: function (name) { return 'jade.' + name; }
}))(runtime), {foo: 'bar'});
```

## License

  MIT
