'use strict';

var assert = require('assert');
var constantinople = require('constantinople');
var runtime = require('jade-runtime');
var stringify = require('js-stringify');
var halts = require('halting-problem');

function isConstant(src) {
  return constantinople(src, {jade: runtime, 'jade_interp': undefined});
}
function toConstant(src) {
  return constantinople.toConstant(src, {jade: runtime, 'jade_interp': undefined});
}

module.exports = compileAttrs;
/**
 * options:
 *  - terse
 *  - runtime
 *  - format ('html' || 'object')
 */
function compileAttrs(attrs, options) {
  assert(Array.isArray(attrs), 'Attrs should be an array');
  assert(attrs.every(function (attr) {
    return attr &&
      typeof attr === 'object' &&
      typeof attr.name === 'string' &&
      (typeof attr.val === 'string' || typeof attr.val === 'boolean') &&
      typeof attr.escaped === 'boolean';
  }), 'All attributes should be supplied as an object of the form {name, val, escaped}');
  assert(options && typeof options === 'object', 'Options should be an object');
  assert(typeof options.terse === 'boolean', 'Options.terse should be a boolean');
  assert(
    typeof options.runtime === 'function',
    'Options.runtime should be a function that takes a runtime function name and returns the source code that will evaluate to that function at runtime'
  );
  assert(
    options.format === 'html' || options.format === 'object',
    'Options.format should be "html" or "object"'
  );

  var buf = [];
  var classes = [];
  var classEscaping = [];

  function addAttribute(key, val, escaped, buf) {
    if (isConstant(val)) {
      if (options.format === 'html') {
        var str = stringify(runtime.attr(key, toConstant(val), escaped, options.terse));
        var last = buf[buf.length - 1];
        if (last && last[last.length - 1] === str[0]) {
          buf[buf.length - 1] = last.substr(0, last.length - 1) + str.substr(1);
        } else {
          buf.push(str);
        }
      } else {
        val = toConstant(val);
        if (escaped) {
          val = runtime.escape(val);
        }
        buf.push(stringify(key) + ': ' + stringify(val));
      }
    } else {
      if (options.format === 'html') {
        buf.push(options.runtime('attr') + '("' + key + '", ' + val + ', ' + stringify(escaped) + ', ' + stringify(options.terse) + ')');
      } else {
        if (escaped) {
          val = options.runtime('escape') + '(' + val + ')';
        }
        buf.push(stringify(key) + ': ' + val);
      }
    }
  }

  attrs.forEach(function(attr){
    var key = attr.name;
    var val = attr.val;
    var escaped = attr.escaped;

    if (key === 'class') {
      classes.push(val);
      classEscaping.push(escaped);
    } else {
      if (key === 'style') {
        if (isConstant(val)) {
          val = stringify(runtime.style(toConstant(val)));
        } else {
          val = options.runtime('style') + '(' + val + ')';
        }
      }
      addAttribute(key, val, escaped, buf);
    }
  });
  var classesBuf = [];
  if (classes.length) {
    if (classes.every(isConstant)) {
      addAttribute(
        'class',
        stringify(runtime.classes(classes.map(toConstant), classEscaping)),
        false,
        classesBuf
      );
    } else {
      classes = classes.map(function (cls, i) {
        if (isConstant(cls)) {
          cls = stringify(classEscaping[i] ? runtime.escape(toConstant(cls)) : toConstant(cls));
          classEscaping[i] = false;
        }
        return cls;
      });
      addAttribute(
        'class',
        options.runtime('classes') + '([' + classes.join(',') + '], ' + stringify(classEscaping) + ')',
        false,
        classesBuf
      );
    }
  }
  buf = classesBuf.concat(buf);
  if (options.format === 'html') return buf.length ? buf.join('+') : '""';
  else return '{' + buf.join(',') + '}';
}
