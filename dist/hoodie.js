!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Hoodie=e():"undefined"!=typeof global?global.Hoodie=e():"undefined"!=typeof self&&(self.Hoodie=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],3:[function(require,module,exports){
/* global open:true */

// Hoodie Core
// -------------
//
// the door to world domination (apps)
//
//
var events = require('./hoodie/events');
var promises = require('./hoodie/promises');
var request = require('./hoodie/request');
var connection = require('./hoodie/connection');
var UUID = require('./hoodie/utils/uuid');
var dispose = require('./hoodie/utils/dispose');
var open = require('./hoodie/open');
var store = require('./hoodie/store');
var task = require('./hoodie/task');
var config = require('./hoodie/config');
var account = require('./hoodie/account');
var remote = require('./hoodie/remote_store');
var account = require('./hoodie/account');

// Constructor
// -------------

// When initializing a hoodie instance, an optional URL
// can be passed. That's the URL of the hoodie backend.
// If no URL passed it defaults to the current domain.
//
//     // init a new hoodie instance
//     hoodie = new Hoodie
//

module.exports = function Hoodie(baseUrl) {
  var hoodie = this;

  // enforce initialization with `new`
  if (!(hoodie instanceof Hoodie)) {
    throw new Error('usage: new Hoodie(url);');
  }

  if (baseUrl) {
    // remove trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }


  // hoodie.extend
  // ---------------

  // extend hoodie instance:
  //
  //     hoodie.extend(function(hoodie) {} )
  //
  this.extend = function extend(extension) {
    extension(hoodie);
  };


  //
  // Extending hoodie core
  //

  // * hoodie.bind
  // * hoodie.on
  // * hoodie.one
  // * hoodie.trigger
  // * hoodie.unbind
  // * hoodie.off
  this.bind = events.bind;
  this.on = events.on;
  this.one = events.one;
  this.trigger = events.trigger;
  this.unbind = events.unbind;
  this.off = events.off;


  // * hoodie.defer
  // * hoodie.isPromise
  // * hoodie.resolve
  // * hoodie.reject
  // * hoodie.resolveWith
  // * hoodie.rejectWith
  this.defer = promises.defer;
  this.isPromise = promises.isPromise;
  this.resolve = promises.resolve;
  this.reject = promises.reject;
  this.resolveWith = promises.resolveWith;


  // * hoodie.request
  this.request = request;

  // * hoodie.isOnline
  // * hoodie.checkConnection
  this.isOnline = connection.isOnline;
  this.checkConnection = connection.checkConnection;

  // * hoodie.uuid
  this.UUID = UUID;

  // * hoodie.dispose
  this.dispose = dispose;

  // * hoodie.open
  this.open = open;

  // * hoodie.store
  this.store = store;

  // * hoodie.task
  this.task = task;

  // * hoodie.config
  this.config = config;

  // * hoodie.account
  this.account = account;

  // * hoodie.remote
  this.remote = remote;


  //
  // Initializations
  //

  // set username from config (local store)
  this.account.username = config.get('_account.username');

  // check for pending password reset
  this.account.checkPasswordReset();

  // clear config on sign out
  events.on('account:signout', config.clear);

  // hoodie.store
  this.store.patchIfNotPersistant();
  this.store.subscribeToOutsideEvents();
  this.store.bootstrapDirtyObjects();

  // hoodie.remote
  this.remote.subscribeToEvents();

  // hoodie.task
  this.task.subscribeToStoreEvents();

  // authenticate
  // we use a closure to not pass the username to connect, as it
  // would set the name of the remote store, which is not the username.
  this.account.authenticate().then(function( /* username */ ) {
    remote.connect();
  });

  // check connection when browser goes online / offline
  window.addEventListener('online', this.checkConnection, false);
  window.addEventListener('offline', this.checkConnection, false);

  // start checking connection
  this.checkConnection();

  //
  // loading user extensions
  //
  applyExtensions(hoodie);
};

// Extending hoodie
// ------------------

// You can either extend the Hoodie class, or a hoodie
// instance during runtime
//
//     Hoodie.extend('magic1', funcion(hoodie) { /* ... */ })
//     hoodie = new Hoodie
//     hoodie.extend('magic2', function(hoodie) { /* ... */ })
//     hoodie.magic1.doSomething()
//     hoodie.magic2.doSomethingElse()
//
// Hoodie can also be extended anonymously
//
//     Hoodie.extend(funcion(hoodie) { hoodie.myMagic = function() {} })
//
var extensions = [];

Hoodie.extend = function(extension) {
  extensions.push(extension);
};

//
function applyExtensions(hoodie) {
  for (var i = 0; i < extensions.length; i++) {
    extensions[i](hoodie);
  }
}


},{"./hoodie/account":4,"./hoodie/config":5,"./hoodie/connection":6,"./hoodie/events":8,"./hoodie/open":9,"./hoodie/promises":10,"./hoodie/remote_store":11,"./hoodie/request":12,"./hoodie/store":15,"./hoodie/task":16,"./hoodie/utils/dispose":17,"./hoodie/utils/uuid":18}],4:[function(require,module,exports){

// Hoodie.Account
// ================

//
var events = require('./events');
var promises = require('./promises');
var uuid = require('./utils/uuid');
var config = require('./config');
var remote = require('./remote_store');

module.exports = function () {
  // public API
  var account = {};

  // flag whether user is currently authenticated or not
  var authenticated;

  // cache for CouchDB _users doc
  var userDoc = {};

  // map of requestPromises. We maintain this list to avoid sending
  // the same requests several times.
  var requests = {};

  // default couchDB user doc prefix
  var userDocPrefix = 'org.couchdb.user';

  // add events API
  events({
    context: account,
    namespace: 'account'
  });

  // Authenticate
  // --------------

  // Use this method to assure that the user is authenticated:
  // `hoodie.account.authenticate().done( doSomething ).fail( handleError )`
  //
  account.authenticate = function authenticate() {
    var sendAndHandleAuthRequest;

    // already tried to authenticate, and failed
    if (authenticated === false) {
      return promises.reject();
    }

    // already tried to authenticate, and succeeded
    if (authenticated === true) {
      return promises.resolveWith(account.username);
    }

    // if there is a pending signOut request, return its promise,
    // but pipe it so that it always ends up rejected
    //
    if (requests.signOut && requests.signOut.state() === 'pending') {
      return requests.signOut.then(promises.rejectWith);
    }

    // if there is a pending signIn request, return its promise
    //
    if (requests.signIn && requests.signIn.state() === 'pending') {
      return requests.signIn;
    }

    // if username is not set, make sure to end the session
    if (account.username === undefined) {
      return sendSignOutRequest().then(function() {
        authenticated = false;
        return promises.reject();
      });
    }

    // send request to check for session status. If there is a
    // pending request already, return its promise.
    //
    sendAndHandleAuthRequest = function() {
      return account.request('GET', '/_session').then(
        handleAuthenticateRequestSuccess,
        handleRequestError
      );
    };

    return withSingleRequest('authenticate', sendAndHandleAuthRequest);
  };


  // sign up with username & password
  // ----------------------------------

  // uses standard CouchDB API to create a new document in _users db.
  // The backend will automatically create a userDB based on the username
  // address and approve the account by adding a 'confirmed' role to the
  // user doc. The account confirmation might take a while, so we keep trying
  // to sign in with a 300ms timeout.
  //
  account.signUp = function signUp(username, password) {

    if (password === undefined) {
      password = '';
    }

    if (!username) {
      return promises.rejectWith({
        error: 'username must be set'
      });
    }

    if (account.hasAnonymousAccount()) {
      return upgradeAnonymousAccount(username, password);
    }

    if (account.hasAccount()) {
      return promises.rejectWith({
        error: 'you have to sign out first'
      });
    }

    // downcase username
    username = username.toLowerCase();

    var options = {
      data: JSON.stringify({
        _id: userDocKey(username),
        name: userTypeAndId(username),
        type: 'user',
        roles: [],
        password: password,
        ownerHash: account.ownerHash,
        database: account.db(),
        updatedAt: now(),
        createdAt: now(),
        signedUpAt: username !== account.ownerHash ? now() : void 0
      }),
      contentType: 'application/json'
    };

    return account.request('PUT', userDocUrl(username), options).then(
      handleSignUpSucces(username, password),
      handleRequestError
    );
  };


  // anonymous sign up
  // -------------------

  // If the user did not sign up himself yet, but data needs to be transfered
  // to the couch, e.g. to send an email or to share data, the anonymousSignUp
  // method can be used. It generates a random password and stores it locally
  // in the browser.
  //
  // If the user signes up for real later, we 'upgrade' his account, meaning we
  // change his username and password internally instead of creating another user.
  //
  account.anonymousSignUp = function anonymousSignUp() {
    var password = uuid(10);
    var username = account.ownerHash;

    return account.signUp(username, password).done(function() {
      setAnonymousPassword(password);
      return account.trigger('signup:anonymous', username);
    });
  };


  // hasAccount
  // ---------------------

  //
  account.hasAccount = function hasAccount() {
    return !!account.username;
  };


  // hasAnonymousAccount
  // ---------------------

  //
  account.hasAnonymousAccount = function hasAnonymousAccount() {
    return getAnonymousPassword() !== undefined;
  };


  // set / get / remove anonymous password
  // ---------------------------------------

  //
  var anonymousPasswordKey = '_account.anonymousPassword';

  function setAnonymousPassword(password) {
    return config.set(anonymousPasswordKey, password);
  }

  function getAnonymousPassword() {
    return config.get(anonymousPasswordKey);
  }

  function removeAnonymousPassword() {
    return config.unset(anonymousPasswordKey);
  }


  // sign in with username & password
  // ----------------------------------

  // uses standard CouchDB API to create a new user session (POST /_session).
  // Besides the standard sign in we also check if the account has been confirmed
  // (roles include 'confirmed' role).
  //
  // NOTE: When signing in, all local data gets cleared beforehand (with a signOut).
  //       Otherwise data that has been created beforehand (authenticated with
  //       another user account or anonymously) would be merged into the user
  //       account that signs in. That applies only if username isn't the same as
  //       current username.
  //
  account.signIn = function signIn(username, password) {

    if (username === null) {
      username = '';
    }

    if (password === undefined) {
      password = '';
    }

    // downcase
    username = username.toLowerCase();

    if (username !== account.username) {
      return account.signOut({
        silent: true
      }).then(function() {
        return sendSignInRequest(username, password);
      });
    } else {
      return sendSignInRequest(username, password, {
        reauthenticated: true
      });
    }
  };


  // sign out
  // ---------

  // uses standard CouchDB API to invalidate a user session (DELETE /_session)
  //
  account.signOut = function signOut(options) {

    options = options || {};

    if (!account.hasAccount()) {
      return cleanup().then(function() {
        if (!options.silent) {
          return account.trigger('signout');
        }
      });
    }
    remote.disconnect();
    return sendSignOutRequest().then(cleanupAndTriggerSignOut);
  };


  // Request
  // ---

  // shortcut for `hoodie.request`
  //
  account.request = function request(type, path, options) {
    options = options || {};
    return request.apply(arguments);
  };


  // db
  // ----

  // return name of db
  //
  account.db = function db() {
    return 'user/' + account.ownerHash;
  };


  // fetch
  // -------

  // fetches _users doc from CouchDB and caches it in _doc
  //
  account.fetch = function fetch(username) {

    if (username === undefined) {
      username = account.username;
    }

    if (!username) {
      return promises.rejectWith({
        error: 'unauthenticated',
        reason: 'not logged in'
      });
    }

    return withSingleRequest('fetch', function() {
      return account.request('GET', userDocUrl(username)).then(
        null,
        handleRequestError
      ).done(function(response) {
        userDoc = response;
        return userDoc;
      });
    });
  };


  // change password
  // -----------------

  // Note: the hoodie API requires the currentPassword for security reasons,
  // but couchDb doesn't require it for a password change, so it's ignored
  // in this implementation of the hoodie API.
  //
  account.changePassword = function changePassword(currentPassword, newPassword) {

    if (!account.username) {
      return promises.rejectWith({
        error: 'unauthenticated',
        reason: 'not logged in'
      });
    }

    remote.disconnect();

    return account.fetch().then(
      sendChangeUsernameAndPasswordRequest(currentPassword, null, newPassword),
      handleRequestError
    );
  };


  // reset password
  // ----------------

  // This is kind of a hack. We need to create an object anonymously
  // that is not exposed to others. The only CouchDB API othering such
  // functionality is the _users database.
  //
  // So we actualy sign up a new couchDB user with some special attributes.
  // It will be picked up by the password reset worker and removeed
  // once the password was resetted.
  //
  account.resetPassword = function resetPassword(username) {
    var data, key, options, resetPasswordId;

    resetPasswordId = config.get('_account.resetPasswordId');

    if (resetPasswordId) {
      return account.checkPasswordReset();
    }

    resetPasswordId = '' + username + '/' + (uuid());

    config.set('_account.resetPasswordId', resetPasswordId);

    key = '' + userDocPrefix + ':$passwordReset/' + resetPasswordId;

    data = {
      _id: key,
      name: '$passwordReset/' + resetPasswordId,
      type: 'user',
      roles: [],
      password: resetPasswordId,
      createdAt: now(),
      updatedAt: now()
    };

    options = {
      data: JSON.stringify(data),
      contentType: 'application/json'
    };

    // TODO: spec that checkPasswordReset gets executed
    return withPreviousRequestsAborted('resetPassword', function() {
      return account.request('PUT', '/_users/' + (encodeURIComponent(key)), options).then(
        null, handleRequestError
      ).done(account.checkPasswordReset);
    });
  };

  // checkPasswordReset
  // ---------------------

  // check for the status of a password reset. It might take
  // a while until the password reset worker picks up the job
  // and updates it
  //
  // If a password reset request was successful, the $passwordRequest
  // doc gets removed from _users by the worker, therefore a 401 is
  // what we are waiting for.
  //
  // Once called, it continues to request the status update with a
  // one second timeout.
  //
  account.checkPasswordReset = function checkPasswordReset() {
    var hash, options, resetPasswordId, url, username;

    // reject if there is no pending password reset request
    resetPasswordId = config.get('_account.resetPasswordId');

    if (!resetPasswordId) {
      return promises.rejectWith({
        error: 'missing'
      });
    }

    // send request to check status of password reset
    username = '$passwordReset/' + resetPasswordId;
    url = '/_users/' + (encodeURIComponent(userDocPrefix + ':' + username));
    hash = btoa(username + ':' + resetPasswordId);

    options = {
      headers: {
        Authorization: 'Basic ' + hash
      }
    };

    return withPreviousRequestsAborted('passwordResetStatus', function() {
      return account.request('GET', url, options).then(
        handlePasswordResetStatusRequestSuccess,
        handlePasswordResetStatusRequestError
      ).fail(function(error) {
        if (error.error === 'pending') {
          window.setTimeout(account.checkPasswordReset, 1000);
          return;
        }
        return account.trigger('password_reset:error');
      });
    });
  };


  // change username
  // -----------------

  // Note: the hoodie API requires the current password for security reasons,
  // but technically we cannot (yet) prevent the user to change the username
  // without knowing the current password, so it's not impulemented in the current
  // implementation of the hoodie API.
  //
  // But the current password is needed to login with the new username.
  //
  account.changeUsername = function changeUsername(currentPassword, newUsername) {
    newUsername = newUsername || '';
    return changeUsernameAndPassword(currentPassword, newUsername.toLowerCase());
  };


  // destroy
  // ---------

  // destroys a user's account
  //
  account.destroy = function destroy() {
    if (!account.hasAccount()) {
      return cleanupAndTriggerSignOut();
    }

    return account.fetch().then(
      handleFetchBeforeDestroySuccess,
      handleFetchBeforeDestroyError
    ).then(cleanupAndTriggerSignOut);
  };


  // PRIVATE
  // ---------

  // setters
  function setUsername(newUsername) {
    if (account.username === newUsername) {
      return;
    }

    account.username = newUsername;

    return config.set('_account.username', newUsername);
  }

  function setOwner(newOwnerHash) {

    if (account.ownerHash === newOwnerHash) {
      return;
    }

    account.ownerHash = newOwnerHash;

    // `ownerHash` is stored with every new object in the createdBy
    // attribute. It does not get changed once it's set. That's why
    // we have to force it to be change for the `$config/hoodie` object.
    config.set('createdBy', newOwnerHash);

    return config.set('_account.ownerHash', newOwnerHash);
  }


  //
  // handle a successful authentication request.
  //
  // As long as there is no server error or internet connection issue,
  // the authenticate request (GET /_session) does always return
  // a 200 status. To differentiate whether the user is signed in or
  // not, we check `userCtx.name` in the response. If the user is not
  // signed in, it's null, otherwise the name the user signed in with
  //
  // If the user is not signed in, we difeerentiate between users that
  // signed in with a username / password or anonymously. For anonymous
  // users, the password is stored in local store, so we don't need
  // to trigger an 'unauthenticated' error, but instead try to sign in.
  //
  function handleAuthenticateRequestSuccess(response) {
    if (response.userCtx.name) {
      authenticated = true;
      setUsername(response.userCtx.name.replace(/^user(_anonymous)?\//, ''));
      setOwner(response.userCtx.roles[0]);
      return promises.resolveWith(account.username);
    }

    if (account.hasAnonymousAccount()) {
      return account.signIn(account.username, getAnonymousPassword());
    }

    authenticated = false;
    account.trigger('error:unauthenticated');
    return promises.reject();
  }


  //
  // standard error handling for AJAX requests
  //
  // in some case we get the object error directly,
  // in others we get an xhr or even just a string back
  // when the couch died entirely. Whe have to handle
  // each case
  //
  function handleRequestError(error) {
    var e;

    error = error || {};

    if (error.reason) {
      return promises.rejectWith(error);
    }

    var xhr = error;

    try {
      error = JSON.parse(xhr.responseText);
    } catch (_error) {
      e = _error;
      error = {
        error: xhr.responseText || 'unknown'
      };
    }

    return promises.rejectWith(error);
  }


  //
  // handle response of a successful signUp request.
  // Response looks like:
  //
  //     {
  //         'ok': true,
  //         'id': 'org.couchdb.user:joe',
  //         'rev': '1-e8747d9ae9776706da92810b1baa4248'
  //     }
  //
  function handleSignUpSucces(username, password) {

    return function(response) {
      account.trigger('signup', username);
      userDoc._rev = response.rev;
      return delayedSignIn(username, password);
    };
  }


  //
  // a delayed sign in is used after sign up and after a
  // username change.
  //
  function delayedSignIn(username, password, options, defer) {

    // delayedSignIn might call itself, when the user account
    // is pending. In this case it passes the original defer,
    // to keep a reference and finally resolve / reject it
    // at some point
    if (!defer) {
      defer = promises.defer();
    }

    window.setTimeout(function() {
      var promise = sendSignInRequest(username, password);
      promise.done(defer.resolve);
      promise.fail(function(error) {
        if (error.error === 'unconfirmed') {

          // It might take a bit until the account has been confirmed
          delayedSignIn(username, password, options, defer);
        } else {
          defer.reject.apply(defer, arguments);
        }
      });

    }, 300);

    return defer.promise();
  }


  //
  // parse a successful sign in response from couchDB.
  // Response looks like:
  //
  //     {
  //         'ok': true,
  //         'name': 'test1',
  //         'roles': [
  //             'mvu85hy',
  //             'confirmed'
  //         ]
  //     }
  //
  // we want to turn it into 'test1', 'mvu85hy' or reject the promise
  // in case an error occured ('roles' array contains 'error')
  //
  function handleSignInSuccess(options) {
    options = options || {};

    return function(response) {
      var defer, username;

      defer = promises.defer();
      username = response.name.replace(/^user(_anonymous)?\//, '');

      //
      // if an error occured, the userDB worker stores it to the $error attribute
      // and adds the 'error' role to the users doc object. If the user has the
      // 'error' role, we need to fetch his _users doc to find out what the error
      // is, before we can reject the promise.
      //
      if (response.roles.indexOf('error') !== -1) {
        account.fetch(username).fail(defer.reject).done(function() {
          return defer.reject({
            error: 'error',
            reason: userDoc.$error
          });
        });
        return defer.promise();
      }

      //
      // When the userDB worker created the database for the user and everthing
      // worked out, it adds the role 'confirmed' to the user. If the role is
      // not present yet, it might be that the worker didn't pick up the the
      // user doc yet, or there was an error. In this cases, we reject the promise
      // with an 'uncofirmed error'
      //
      if (response.roles.indexOf('confirmed') === -1) {
        return defer.reject({
          error: 'unconfirmed',
          reason: 'account has not been confirmed yet'
        });
      }

      setUsername(username);
      setOwner(response.roles[0]);
      authenticated = true;

      //
      // options.verbose is true, when a user manually signed via hoodie.account.signIn().
      // We need to differentiate to other signIn requests, for example right after
      // the signup or after a session timed out.
      //
      if (!(options.silent || options.reauthenticated)) {
        if (account.hasAnonymousAccount()) {
          account.trigger('signin:anonymous', username);
        } else {
          account.trigger('signin', username);
        }
      }

      // user reauthenticated, meaning
      if (options.reauthenticated) {
        account.trigger('reauthenticated', username);
      }

      account.fetch();
      return defer.resolve(username, response.roles[0]);
    };
  }


  //
  // If the request was successful there might have occured an
  // error, which the worker stored in the special $error attribute.
  // If that happens, we return a rejected promise with the $error,
  // error. Otherwise reject the promise with a 'pending' error,
  // as we are not waiting for a success full response, but a 401
  // error, indicating that our password was changed and our
  // current session has been invalidated
  //
  function handlePasswordResetStatusRequestSuccess(response) {
    var error;

    if (response.$error) {
      error = response.$error;
    } else {
      error = { error: 'pending' };
    }
    return promises.rejectWith(error);
  }


  //
  // If the error is a 401, it's exactly what we've been waiting for.
  // In this case we resolve the promise.
  //
  function handlePasswordResetStatusRequestError(xhr) {
    if (xhr.status === 401) {
      config.unset('_account.resetPasswordId');
      account.trigger('passwordreset');

      return promises.resolve();
    } else {
      return handleRequestError(xhr);
    }
  }


  //
  // change username and password in 3 steps
  //
  // 1. assure we have a valid session
  // 2. update _users doc with new username and new password (if provided)
  // 3. sign in with new credentials to create new sesion.
  //
  function changeUsernameAndPassword(currentPassword, newUsername, newPassword) {

    return sendSignInRequest(account.username, currentPassword, {
      silent: true
    }).then(function() {
      return account.fetch().then(
        sendChangeUsernameAndPasswordRequest(currentPassword, newUsername, newPassword)
      );
    });
  }


  //
  // turn an anonymous account into a real account
  //
  function upgradeAnonymousAccount(username, password) {
    var currentPassword = getAnonymousPassword();

    return changeUsernameAndPassword(currentPassword, username, password).done(function() {
      account.trigger('signup', username);
      removeAnonymousPassword();
    });
  }


  //
  // we now can be sure that we fetched the latest _users doc, so we can update it
  // without a potential conflict error.
  //
  function handleFetchBeforeDestroySuccess() {

    remote.disconnect();
    userDoc._deleted = true;

    return withPreviousRequestsAborted('updateUsersDoc', function() {
      account.request('PUT', userDocUrl(), {
        data: JSON.stringify(userDoc),
        contentType: 'application/json'
      });
    });
  }


  //
  // dependend on what kind of error we get, we want to ignore
  // it or not.
  // When we get a 'not_found' it means that the _users doc habe
  // been removed already, so we don't need to do it anymore, but
  // still want to finish the destroy locally, so we return a
  // resolved promise
  //
  function handleFetchBeforeDestroyError(error) {
    if (error.error === 'not_found') {
      return promises.resolve();
    } else {
      return promises.rejectWith(error);
    }
  }

  //
  // remove everything form the current account, so a new account can be initiated.
  //
  function cleanup(options) {
    options = options || {};

    // hoodie.store is listening on this one
    account.trigger('cleanup');
    authenticated = options.authenticated;
    config.clear();
    setUsername(options.username);
    setOwner(options.ownerHash || uuid());

    return promises.resolve();
  }


  //
  function cleanupAndTriggerSignOut() {
    return cleanup().then(function() {
      return account.trigger('signout');
    });
  }


  //
  // depending on wether the user signedUp manually or has been signed up
  // anonymously the prefix in the CouchDB _users doc differentiates.
  // An anonymous user is characterized by its username, that equals
  // its ownerHash (see `anonymousSignUp`)
  //
  // We differentiate with `hasAnonymousAccount()`, because `userTypeAndId`
  // is used within `signUp` method, so we need to be able to differentiate
  // between anonyomus and normal users before an account has been created.
  //
  function userTypeAndId(username) {
    var type;

    if (username === account.ownerHash) {
      type = 'user_anonymous';
    } else {
      type = 'user';
    }
    return '' + type + '/' + username;
  }


  //
  // turn a username into a valid _users doc._id
  //
  function userDocKey(username) {
    username = username || account.username;
    return '' + userDocPrefix + ':' + (userTypeAndId(username));
  }

  //
  // get URL of my _users doc
  //
  function userDocUrl(username) {
    return '/_users/' + (encodeURIComponent(userDocKey(username)));
  }


  //
  // update my _users doc.
  //
  // If a new username has been passed, we set the special attribut $newUsername.
  // This will let the username change worker create create a new _users doc for
  // the new username and remove the current one
  //
  // If a new password has been passed, salt and password_sha get removed
  // from _users doc and add the password in clear text. CouchDB will replace it with
  // according password_sha and a new salt server side
  //
  function sendChangeUsernameAndPasswordRequest(currentPassword, newUsername, newPassword) {

    return function() {
      // prepare updated _users doc
      var data = $.extend({}, userDoc);

      if (newUsername) {
        data.$newUsername = newUsername;
      }

      data.updatedAt = now();
      data.signedUpAt = data.signedUpAt || now();

      // trigger password update when newPassword set
      if (newPassword !== null) {
        delete data.salt;
        delete data.password_sha;
        data.password = newPassword;
      }

      var options = {
        data: JSON.stringify(data),
        contentType: 'application/json'
      };

      return withPreviousRequestsAborted('updateUsersDoc', function() {
        return account.request('PUT', userDocUrl(), options).then(
          handleChangeUsernameAndPasswordRequest(newUsername, newPassword || currentPassword),
          handleRequestError
        );
      });

    };
  }


  //
  // depending on whether a newUsername has been passed, we can sign in right away
  // or have to use the delayed sign in to give the username change worker some time
  //
  function handleChangeUsernameAndPasswordRequest(newUsername, newPassword) {

    return function() {
      remote.disconnect();

      if (newUsername) {
        return delayedSignIn(newUsername, newPassword, {
          silent: true
        });
      } else {
        return account.signIn(account.username, newPassword);
      }
    };
  }


  //
  // make sure that the same request doesn't get sent twice
  // by cancelling the previous one.
  //
  function withPreviousRequestsAborted(name, requestFunction) {
    if (requests[name] !== undefined) {
      if (typeof requests[name].abort === 'function') {
        requests[name].abort();
      }
    }
    requests[name] = requestFunction();
    return requests[name];
  }


  //
  // if there is a pending request, return its promise instead
  // of sending another request
  //
  function withSingleRequest(name, requestFunction) {

    if (requests[name] !== undefined) {
      if (typeof requests[name].state === 'function') {
        if (requests[name].state() === 'pending') {
          return requests[name];
        }
      }
    }

    requests[name] = requestFunction();
    return requests[name];
  }


  //
  function sendSignOutRequest() {
    return withSingleRequest('signOut', function() {
      return account.request('DELETE', '/_session').then(null, handleRequestError);
    });
  }


  //
  // the sign in request that starts a CouchDB session if
  // it succeeds. We separated the actual sign in request from
  // the signIn method, as the latter also runs signOut intenrtally
  // to clean up local data before starting a new session. But as
  // other methods like signUp or changePassword do also need to
  // sign in the user (again), these need to send the sign in
  // request but without a signOut beforehand, as the user remains
  // the same.
  //
  function sendSignInRequest(username, password, options) {
    var requestOptions = {
      data: {
        name: userTypeAndId(username),
        password: password
      }
    };

    return withPreviousRequestsAborted('signIn', function() {
      var promise = account.request('POST', '/_session', requestOptions);

      return promise.then(
        handleSignInSuccess(options),
        handleRequestError
      );
    });
  }

  //
  function now() {
    return new Date();
  }


  // TODO: we should move the owner hash on hoodie core, as
  //       other modules depend on it as well, like hoodie.store.
  // the ownerHash gets stored in every object created by the user.
  // Make sure we have one.
  account.ownerHash = config.get('_account.ownerHash');

  if (!account.ownerHash) {
    setOwner(uuid());
  }

  return account;

};

},{"./config":5,"./events":8,"./promises":10,"./remote_store":11,"./utils/uuid":18}],5:[function(require,module,exports){
/* exported hoodieConfig */

// Hoodie Config API
// ===================

//
var store = require('./store');

module.exports = function () {

  var type = '$config';
  var id = 'hoodie';
  var cache = {};

  // public API
  var config = {};


  // set
  // ----------

  // adds a configuration
  //
  config.set = function set(key, value) {
    var isSilent, update;

    if (cache[key] === value) {
      return;
    }

    cache[key] = value;

    update = {};
    update[key] = value;
    isSilent = key.charAt(0) === '_';

    return store.updateOrAdd(type, id, update, {
      silent: isSilent
    });
  };

  // get
  // ----------

  // receives a configuration
  //
  config.get = function get(key) {
    return cache[key];
  };

  // clear
  // ----------

  // clears cache and removes object from store
  //
  config.clear = function clear() {
    cache = {};
    return store.remove(type, id);
  };

  // unset
  // ----------

  // unsets a configuration, is a simple alias for config.set(key, undefined)
  //
  config.unset = function unset(key) {
    return config.set(key, undefined);
  };

  // load cache
  // TODO: I really don't like this being here. And I don't like that if the
  //       store API will be truly async one day, this will fall on our feet.
  store.find(type, id).done(function(obj) {
    cache = obj;
  });

  // exspose public API
  return config;

};

},{"./store":15}],6:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/* exported hoodieConnection */

//
// hoodie.checkConnection() & hoodie.isConnected()
// =================================================

var promises = require('./promises');
var events = require('./events');
var request = require('./request');

// state
var online = true;
var checkConnectionInterval = 30000;
var checkConnectionRequest = null;
var checkConnectionTimeout = null;

// Check Connection
// ------------------

// the `checkConnection` method is used, well, to check if
// the hoodie backend is reachable at `baseUrl` or not.
// Check Connection is automatically called on startup
// and then each 30 seconds. If it fails, it
//
// - sets `online = false`
// - triggers `offline` event
// - sets `checkConnectionInterval = 3000`
//
// when connection can be reestablished, it
//
// - sets `online = true`
// - triggers `online` event
// - sets `checkConnectionInterval = 30000`
//
var checkConnection = function () {
  var req = checkConnectionRequest;

  if (req && req.state() === 'pending') {
    return req;
  }

  global.clearTimeout(checkConnectionTimeout);

  checkConnectionRequest = request('GET', '/').then(
    handleCheckConnectionSuccess,
    handleCheckConnectionError
  );

  return checkConnectionRequest;
};


// isConnected
// -------------

//
var isConnected = function () {
  return online;
};


//
//
//
function handleCheckConnectionSuccess() {
  checkConnectionInterval = 30000;

  checkConnectionTimeout = window.setTimeout(
    exports.checkConnection,
    checkConnectionInterval
  );

  if (!exports.isConnected()) {
    events.trigger('reconnected');
    online = true;
  }

  return promises.resolve();
}


//
//
//
function handleCheckConnectionError() {
  checkConnectionInterval = 3000;

  checkConnectionTimeout = window.setTimeout(
    exports.checkConnection,
    checkConnectionInterval
  );

  if (exports.isConnected()) {
    events.trigger('disconnected');
    online = false;
  }

  return promises.reject();
}

module.exports = {
  checkConnection: checkConnection,
  isConnected: isConnected
};


},{"./events":8,"./promises":10,"./request":12}],7:[function(require,module,exports){
//
// one place to rule them all!
//

module.exports = {

  // INVALID_KEY
  // --------------

  // thrown when invalid keys are used to store an object
  //
  INVALID_KEY: function (idOrType) {
    var key = idOrType.id ? 'id' : 'type';

    return new Error('invalid ' + key + '\'' + idOrType[key] + '\': numbers and lowercase letters allowed only');
  },

  // INVALID_ARGUMENTS
  // -------------------

  //
  INVALID_ARGUMENTS: function (msg) {
    return new Error(msg);
  },

  // NOT_FOUND
  // -----------

  //
  NOT_FOUND: function (type, id) {
    return new Error('' + type + ' with ' + id + ' could not be found');
  }

};

},{}],8:[function(require,module,exports){
/* exported hoodieEvents */

//
// Events
// ========
//
// extend any Class with support for
//
// * `object.bind('event', cb)`
// * `object.unbind('event', cb)`
// * `object.trigger('event', args...)`
// * `object.one('ev', cb)`
//
// based on [Events implementations from Spine](https://github.com/maccman/spine/blob/master/src/spine.coffee#L1)
//

// callbacks are global, while the events API is used at several places,
// like hoodie.on / hoodie.store.on / hoodie.task.on etc.
module.exports = function (hoodie, options) {
  var context = hoodie;
  var namespace = '';

  // normalize options hash
  options = options || {};

  // make sure callbacks hash exists
  hoodie.eventsCallbacks || hoodie.eventsCallbacks || {};

  if (options.context) {
    context = options.context;
    namespace = options.namespace + ':';
  }

  // Bind
  // ------
  //
  // bind a callback to an event triggerd by the object
  //
  //     object.bind 'cheat', blame
  //
  function bind(ev, callback) {
    var evs, name, _i, _len;

    evs = ev.split(' ');

    for (_i = 0, _len = evs.length; _i < _len; _i++) {
      name = namespace + evs[_i];
      hoodie.eventsCallbacks[name] = hoodie.eventsCallbacks[name] || [];
      hoodie.eventsCallbacks[name].push(callback);
    }
  }

  // one
  // -----
  //
  // same as `bind`, but does get executed only once
  //
  //     object.one 'groundTouch', gameOver
  //
  function one(ev, callback) {
    ev = namespace + ev;
    var wrapper = function() {
      exports.unbind(ev, wrapper);
      callback.apply(null, arguments);
    };
    exports.bind(ev, wrapper);
  }

  // trigger
  // ---------
  //
  // trigger an event and pass optional parameters for binding.
  //     object.trigger 'win', score: 1230
  //
  function trigger() {
    var args, callback, ev, list, _i, _len;

    args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    ev = args.shift();
    ev = namespace + ev;
    list = hoodie.eventsCallbacks[ev];

    if (!list) {
      return;
    }

    for (_i = 0, _len = list.length; _i < _len; _i++) {
      callback = list[_i];
      callback.apply(null, args);
    }

    return true;
  }

  // unbind
  // --------
  //
  // unbind to from all bindings, from all bindings of a specific event
  // or from a specific binding.
  //
  //     object.unbind()
  //     object.unbind 'move'
  //     object.unbind 'move', follow
  //
  function unbind(ev, callback) {
    var cb, i, list, _i, _len, evNames;

    if (!ev) {
      if (!namespace) {
        hoodie.eventsCallbacks = {};
      }

      evNames = Object.keys(hoodie.eventsCallbacks);
      evNames = evNames.filter(function(key) {
        return key.indexOf(namespace) === 0;
      });
      evNames.forEach(function(key) {
        delete hoodie.eventsCallbacks[key];
      });

      return;
    }

    ev = namespace + ev;

    list = hoodie.eventsCallbacks[ev];

    if (!list) {
      return;
    }

    if (!callback) {
      delete hoodie.eventsCallbacks[ev];
      return;
    }

    for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
      cb = list[i];


      if (cb !== callback) {
        continue;
      }

      list = list.slice();
      list.splice(i, 1);
      hoodie.eventsCallbacks[ev] = list;
      break;
    }

    return;
  }

  return {
    bind: bind,
    on: bind,
    one: one,
    trigger: trigger,
    unbind: unbind,
    off: unbind
  };

};


},{}],9:[function(require,module,exports){
/* global $:true */

// Open stores
// -------------

var remoteStore = require('./remote_store');

module.exports = function (hoodie) {
  var $extend = $.extend;

  // generic method to open a store. Used by
  //
  // * hoodie.remote
  // * hoodie.user("joe")
  // * hoodie.global
  // * ... and more
  //
  //     hoodie.open("some_store_name").findAll()
  //
  function open(storeName, options) {
    options = options || {};

    $extend(options, {
      name: storeName
    });


    return remoteStore.call(this, hoodie, options);
  }

  //
  // Public API
  //
  return open;
};


},{"./remote_store":11}],10:[function(require,module,exports){
// Hoodie Defers / Promises
// ------------------------

// returns a defer object for custom promise handlings.
// Promises are heavely used throughout the code of hoodie.
// We currently borrow jQuery's implementation:
// http://api.jquery.com/category/deferred-object/
//
//     defer = hoodie.defer()
//     if (good) {
//       defer.resolve('good.')
//     } else {
//       defer.reject('not good.')
//     }
//     return defer.promise()
//
var dfd = $.Deferred();

// returns true if passed object is a promise (but not a deferred),
// otherwise false.
function isPromise(object) {
  var hasDone = typeof object.done === 'function';
  var hasResolved = typeof object.resolve !== 'function';

  return !!(object && hasDone && hasResolved);
}

//
function resolve() {
  return dfd.resolve().promise();
}


//
function reject() {
  return dfd.reject().promise();
}


//
function resolveWith() {
  return dfd.resolve.apply(dfd, arguments).promise();
}

//
function rejectWith() {
  return dfd.reject.apply(dfd, arguments).promise();
}

//
// Public API
//
module.exports = {
  defer: dfd,
  isPromise: isPromise,
  resolve: resolve,
  reject: reject,
  resolveWith: resolveWith,
  rejectWith: rejectWith
};

},{}],11:[function(require,module,exports){
// Remote
// ========

// Connection to a remote Couch Database.
//
// store API
// ----------------
//
// object loading / updating / deleting
//
// * find(type, id)
// * findAll(type )
// * add(type, object)
// * save(type, id, object)
// * update(type, id, new_properties )
// * updateAll( type, new_properties)
// * remove(type, id)
// * removeAll(type)
//
// custom requests
//
// * request(view, params)
// * get(view, params)
// * post(view, params)
//
// synchronization
//
// * connect()
// * disconnect()
// * pull()
// * push()
// * sync()
//
// event binding
//
// * on(event, callback)
//

//
var uuid = require('./utils/uuid');
var connection = require('./connection');
var promises = require('./promises');
var request = require('./request');
var storeApi = require('./store');

module.exports = function (hoodie, options) {

  var remoteStore = {};


  // Remote Store Persistance methods
  // ----------------------------------

  // find
  // ------

  // find one object
  //
  remoteStore.find = function find(type, id) {
    var path;

    path = type + '/' + id;

    if (remote.prefix) {
      path = remote.prefix + path;
    }

    path = '/' + encodeURIComponent(path);

    return request('GET', path).then(parseFromRemote);
  };


  // findAll
  // ---------

  // find all objects, can be filetered by a type
  //
  remoteStore.findAll = function findAll(type) {
    var endkey, path, startkey;

    path = '/_all_docs?include_docs=true';

    switch (true) {
    case (type !== undefined) && remote.prefix !== '':
      startkey = remote.prefix + type + '/';
      break;
    case type !== undefined:
      startkey = type + '/';
      break;
    case remote.prefix !== '':
      startkey = remote.prefix;
      break;
    default:
      startkey = '';
    }

    if (startkey) {

      // make sure that only objects starting with
      // `startkey` will be returned
      endkey = startkey.replace(/.$/, function(chars) {
        var charCode;
        charCode = chars.charCodeAt(0);
        return String.fromCharCode(charCode + 1);
      });
      path = '' + path + '&startkey="' + (encodeURIComponent(startkey)) + '"&endkey="' + (encodeURIComponent(endkey)) + '"';
    }

    return request('GET', path).then(mapDocsFromFindAll).then(parseAllFromRemote);
  };


  // save
  // ------

  // save a new object. If it existed before, all properties
  // will be overwritten
  //
  remoteStore.save = function save(object) {
    var path;

    if (!object.id) {
      object.id = uuid();
    }

    object = parseForRemote(object);
    path = '/' + encodeURIComponent(object._id);
    return request('PUT', path, {
      data: object
    });
  };


  // remove
  // ---------

  // remove one object
  //
  remoteStore.remove = function remove(type, id) {
    return remote.update(type, id, {
      _deleted: true
    });
  };


  // removeAll
  // ------------

  // remove all objects, can be filtered by type
  //
  remoteStore.removeAll = function removeAll(type) {
    return remote.updateAll(type, {
      _deleted: true
    });
  };

  var remote = storeApi(hoodie, {

    name: options.name,

    backend: {
      save: remoteStore.save,
      find: remoteStore.find,
      findAll: remoteStore.findAll,
      remove: remoteStore.remove,
      removeAll: remoteStore.removeAll
    }

  });

  // properties
  // ------------

  // name

  // the name of the Remote is the name of the
  // CouchDB database and is also used to prefix
  // triggered events
  //
  var remoteName = null;


  // sync

  // if set to true, updates will be continuously pulled
  // and pushed. Alternatively, `sync` can be set to
  // `pull: true` or `push: true`.
  //
  remote.connected = false;


  // prefix

  //prefix for docs in a CouchDB database, e.g. all docs
  // in public user stores are prefixed by '$public/'
  //
  remote.prefix = '';



  // defaults
  // ----------------

  //
  if (options.name !== undefined) {
    remoteName = options.name;
  }

  if (options.prefix !== undefined) {
    remote.prefix = options.prefix;
  }

  if (options.baseUrl !== null) {
    remote.baseUrl = options.baseUrl;
  }


  // request
  // ---------

  // wrapper for hoodie.request, with some store specific defaults
  // and a prefixed path
  //
  request = function request(type, path, options) {
    options = options || {};

    if (remoteName) {
      path = '/' + (encodeURIComponent(remoteName)) + path;
    }

    if (remote.baseUrl) {
      path = '' + remote.baseUrl + path;
    }

    options.contentType = options.contentType || 'application/json';

    if (type === 'POST' || type === 'PUT') {
      options.dataType = options.dataType || 'json';
      options.processData = options.processData || false;
      options.data = JSON.stringify(options.data);
    }
    return request(type, path, options);
  };


  // isKnownObject
  // ---------------

  // determine between a known and a new object
  //
  remote.isKnownObject = function isKnownObject(object) {
    var key = '' + object.type + '/' + object.id;

    if (knownObjects[key] !== undefined) {
      return knownObjects[key];
    }
  };


  // markAsKnownObject
  // -------------------

  // determine between a known and a new object
  //
  remote.markAsKnownObject = function markAsKnownObject(object) {
    var key = '' + object.type + '/' + object.id;
    knownObjects[key] = 1;
    return knownObjects[key];
  };


  // synchronization
  // -----------------

  // Connect
  // ---------

  // start syncing. `remote.bootstrap()` will automatically start
  // pulling when `remote.connected` remains true.
  //
  remote.connect = function connect(name) {
    if (name) {
      remoteName = name;
    }
    remote.connected = true;
    remote.trigger('connect'); // TODO: spec that
    return remote.bootstrap();
  };


  // Disconnect
  // ------------

  // stop syncing changes from remote store
  //
  remote.disconnect = function disconnect() {
    remote.connected = false;
    remote.trigger('disconnect'); // TODO: spec that

    if (pullRequest) {
      pullRequest.abort();
    }

    if (pushRequest) {
      pushRequest.abort();
    }

  };


  // isConnected
  // -------------

  //
  remote.isConnected = function isConnected() {
    return remote.connected;
  };


  // getSinceNr
  // ------------

  // returns the sequence number from wich to start to find changes in pull
  //
  var since = options.since || 0; // TODO: spec that!
  remote.getSinceNr = function getSinceNr() {
    if (typeof since === 'function') {
      return since();
    }

    return since;
  };


  // bootstrap
  // -----------

  // inital pull of data of the remote store. By default, we pull all
  // changes since the beginning, but this behavior might be adjusted,
  // e.g for a filtered bootstrap.
  //
  var isBootstrapping = false;
  remote.bootstrap = function bootstrap() {
    isBootstrapping = true;
    remote.trigger('bootstrap:start');
    return remote.pull().done( handleBootstrapSuccess );
  };


  // pull changes
  // --------------

  // a.k.a. make a GET request to CouchDB's `_changes` feed.
  // We currently make long poll requests, that we manually abort
  // and restart each 25 seconds.
  //
  var pullRequest, pullRequestTimeout;
  remote.pull = function pull() {
    pullRequest = request('GET', pullUrl());

    if (remote.isConnected()) {
      window.clearTimeout(pullRequestTimeout);
      pullRequestTimeout = window.setTimeout(restartPullRequest, 25000);
    }

    return pullRequest.done(handlePullSuccess).fail(handlePullError);
  };


  // push changes
  // --------------

  // Push objects to remote store using the `_bulk_docs` API.
  //
  var pushRequest;
  remote.push = function push(objects) {
    var object, objectsForRemote, _i, _len;

    if (!$.isArray(objects)) {
      objects = defaultObjectsToPush();
    }

    if (objects.length === 0) {
      return promises.resolveWith([]);
    }

    objectsForRemote = [];

    for (_i = 0, _len = objects.length; _i < _len; _i++) {

      // don't mess with original objects
      object = $.extend(true, {}, objects[_i]);
      addRevisionTo(object);
      object = parseForRemote(object);
      objectsForRemote.push(object);
    }
    pushRequest = request('POST', '/_bulk_docs', {
      data: {
        docs: objectsForRemote,
        new_edits: false
      }
    });

    pushRequest.done(function() {
      for (var i = 0; i < objects.length; i++) {
        remote.trigger('push', objects[i]);
      }
    });
    return pushRequest;
  };

  // sync changes
  // --------------

  // push objects, then pull updates.
  //
  remote.sync = function sync(objects) {
    return remote.push(objects).then(remote.pull);
  };

  //
  // Private
  // ---------
  //

  // in order to differentiate whether an object from remote should trigger a 'new'
  // or an 'update' event, we store a hash of known objects
  var knownObjects = {};


  // valid CouchDB doc attributes starting with an underscore
  //
  var validSpecialAttributes = ['_id', '_rev', '_deleted', '_revisions', '_attachments'];


  // default objects to push
  // --------------------------

  // when pushed without passing any objects, the objects returned from
  // this method will be passed. It can be overwritten by passing an
  // array of objects or a function as `options.objects`
  //
  var defaultObjectsToPush = function defaultObjectsToPush() {
    return [];
  };
  if (options.defaultObjectsToPush) {
    if ($.isArray(options.defaultObjectsToPush)) {
      defaultObjectsToPush = function defaultObjectsToPush() {
        return options.defaultObjectsToPush;
      };
    } else {
      defaultObjectsToPush = options.defaultObjectsToPush;
    }
  }


  // setSinceNr
  // ------------

  // sets the sequence number from wich to start to find changes in pull.
  // If remote store was initialized with since : function(nr) { ... },
  // call the function with the seq passed. Otherwise simply set the seq
  // number and return it.
  //
  function setSinceNr(seq) {
    if (typeof since === 'function') {
      return since(seq);
    }

    since = seq;
    return since;
  }


  // Parse for remote
  // ------------------

  // parse object for remote storage. All properties starting with an
  // `underscore` do not get synchronized despite the special properties
  // `_id`, `_rev` and `_deleted` (see above)
  //
  // Also `id` gets replaced with `_id` which consists of type & id
  //
  function parseForRemote(object) {
    var attr, properties;
    properties = $.extend({}, object);

    for (attr in properties) {
      if (properties.hasOwnProperty(attr)) {
        if (validSpecialAttributes.indexOf(attr) !== -1) {
          continue;
        }
        if (!/^_/.test(attr)) {
          continue;
        }
        delete properties[attr];
      }
    }

    // prepare CouchDB id
    properties._id = '' + properties.type + '/' + properties.id;
    if (remote.prefix) {
      properties._id = '' + remote.prefix + properties._id;
    }
    delete properties.id;
    return properties;
  }


  // ### _parseFromRemote

  // normalize objects coming from remote
  //
  // renames `_id` attribute to `id` and removes the type from the id,
  // e.g. `type/123` -> `123`
  //
  function parseFromRemote(object) {
    var id, ignore, _ref;

    // handle id and type
    id = object._id || object.id;
    delete object._id;

    if (remote.prefix) {
      id = id.replace(new RegExp('^' + remote.prefix), '');
    }

    // turn doc/123 into type = doc & id = 123
    // NOTE: we don't use a simple id.split(/\//) here,
    // as in some cases IDs might contain '/', too
    //
    _ref = id.match(/([^\/]+)\/(.*)/),
    ignore = _ref[0],
    object.type = _ref[1],
    object.id = _ref[2];

    return object;
  }

  function parseAllFromRemote(objects) {
    var object, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      object = objects[_i];
      _results.push(parseFromRemote(object));
    }
    return _results;
  }


  // ### _addRevisionTo

  // extends passed object with a _rev property
  //
  function addRevisionTo(attributes) {
    var currentRevId, currentRevNr, newRevisionId, _ref;
    try {
      _ref = attributes._rev.split(/-/),
      currentRevNr = _ref[0],
      currentRevId = _ref[1];
    } catch (_error) {}
    currentRevNr = parseInt(currentRevNr, 10) || 0;
    newRevisionId = generateNewRevisionId();

    // local changes are not meant to be replicated outside of the
    // users database, therefore the `-local` suffix.
    if (attributes._$local) {
      newRevisionId += '-local';
    }

    attributes._rev = '' + (currentRevNr + 1) + '-' + newRevisionId;
    attributes._revisions = {
      start: 1,
      ids: [newRevisionId]
    };

    if (currentRevId) {
      attributes._revisions.start += currentRevNr;
      return attributes._revisions.ids.push(currentRevId);
    }
  }


  // ### generate new revision id

  //
  function generateNewRevisionId() {
    return uuid(9);
  }


  // ### map docs from findAll

  //
  function mapDocsFromFindAll(response) {
    return response.rows.map(function(row) {
      return row.doc;
    });
  }


  // ### pull url

  // Depending on whether remote is connected (= pulling changes continuously)
  // return a longpoll URL or not. If it is a beginning bootstrap request, do
  // not return a longpoll URL, as we want it to finish right away, even if there
  // are no changes on remote.
  //
  function pullUrl() {
    var since;
    since = remote.getSinceNr();
    if (remote.isConnected() && !isBootstrapping) {
      return '/_changes?include_docs=true&since=' + since + '&heartbeat=10000&feed=longpoll';
    } else {
      return '/_changes?include_docs=true&since=' + since;
    }
  }


  // ### restart pull request

  // request gets restarted automaticcally
  // when aborted (see @_handlePullError)
  function restartPullRequest() {
    if (pullRequest) {
      pullRequest.abort();
    }
  }


  // ### pull success handler

  // request gets restarted automaticcally
  // when aborted (see @_handlePullError)
  //
  function handlePullSuccess(response) {
    setSinceNr(response.last_seq);
    handlePullResults(response.results);
    if (remote.isConnected()) {
      return remote.pull();
    }
  }


  // ### pull error handler

  // when there is a change, trigger event,
  // then check for another change
  //
  function handlePullError(xhr, error) {
    if (!remote.isConnected()) {
      return;
    }

    switch (xhr.status) {
      // Session is invalid. User is still login, but needs to reauthenticate
      // before sync can be continued
    case 401:
      remote.trigger('error:unauthenticated', error);
      return remote.disconnect();

     // the 404 comes, when the requested DB has been removed
     // or does not exist yet.
     //
     // BUT: it might also happen that the background workers did
     //      not create a pending database yet. Therefore,
     //      we try it again in 3 seconds
     //
     // TODO: review / rethink that.
     //

    case 404:
      return window.setTimeout(remote.pull, 3000);

    case 500:
      //
      // Please server, don't give us these. At least not persistently
      //
      remote.trigger('error:server', error);
      window.setTimeout(remote.pull, 3000);
      return connection.checkConnection();
    default:
      // usually a 0, which stands for timeout or server not reachable.
      if (xhr.statusText === 'abort') {
        // manual abort after 25sec. restart pulling changes directly when connected
        return remote.pull();
      } else {

        // oops. This might be caused by an unreachable server.
        // Or the server cancelled it for what ever reason, e.g.
        // heroku kills the request after ~30s.
        // we'll try again after a 3s timeout
        //
        window.setTimeout(remote.pull, 3000);
        return connection.checkConnection();
      }
    }
  }


  // ### handle changes from remote
  //
  function handleBootstrapSuccess() {
    isBootstrapping = false;
    remote.trigger('bootstrap:end');
  }

  // ### handle changes from remote
  //
  function handlePullResults(changes) {
    var doc, event, object, _i, _len;

    for (_i = 0, _len = changes.length; _i < _len; _i++) {
      doc = changes[_i].doc;

      if (remote.prefix && doc._id.indexOf(remote.prefix) !== 0) {
        continue;
      }

      object = parseFromRemote(doc);

      if (object._deleted) {
        if (!remote.isKnownObject(object)) {
          continue;
        }
        event = 'remove';
        remote.isKnownObject(object);
      } else {
        if (remote.isKnownObject(object)) {
          event = 'update';
        } else {
          event = 'add';
          remote.markAsKnownObject(object);
        }
      }

      remote.trigger(event, object);
      remote.trigger(event + ':' + object.type, object);
      remote.trigger(event + ':' + object.type + ':' + object.id, object);
      remote.trigger('change', event, object);
      remote.trigger('change:' + object.type, event, object);
      remote.trigger('change:' + object.type + ':' + object.id, event, object);
    }
  }


  // bootstrap known objects
  //
  if (options.knownObjects) {
    for (var i = 0; i < options.knownObjects.length; i++) {
      remote.markAsKnownObject({
        type: options.knownObjects[i].type,
        id: options.knownObjects[i].id
      });
    }
  }


  // expose public API
  return remote;
};

},{"./connection":6,"./promises":10,"./request":12,"./store":15,"./utils/uuid":18}],12:[function(require,module,exports){
/* exported hoodieRequest */

//
// hoodie.request
// ================

//
var promises = require('./promises');

module.exports = (function () {

  var $extend = $.extend;
  var $ajax = $.ajax;

  // Hoodie backend listents to requests prefixed by /_api,
  // so we prefix all requests with relative URLs
  var API_PATH = '/_api';

  // Requests
  // ----------

  // sends requests to the hoodie backend.
  //
  //     promise = hoodie.request('GET', '/user_database/doc_id')
  //
  function request(type, url, options) {
    var defaults, requestPromise, pipedPromise;

    options = options || {};

    defaults = {
      type: type,
      dataType: 'json'
    };

    // if absolute path passed, set CORS headers

    // if relative path passed, prefix with baseUrl
    if (!/^http/.test(url)) {
      url = (this.baseUrl || '') + API_PATH + url;
    }

    // if url is cross domain, set CORS headers
    if (/^http/.test(url)) {
      defaults.xhrFields = {
        withCredentials: true
      };
      defaults.crossDomain = true;
    }

    defaults.url = url;


    // we are piping the result of the request to return a nicer
    // error if the request cannot reach the server at all.
    // We can't return the promise of ajax directly because of
    // the piping, as for whatever reason the returned promise
    // does not have the `abort` method any more, maybe others
    // as well. See also http://bugs.jquery.com/ticket/14104
    requestPromise = $ajax($extend(defaults, options));
    pipedPromise = requestPromise.then( null, pipeRequestError);
    pipedPromise.abort = requestPromise.abort;

    return pipedPromise;
  }

  //
  //
  //
  function pipeRequestError(xhr) {
    var error;

    try {
      error = JSON.parse(xhr.responseText);
    } catch (_error) {
      error = {
        error: xhr.responseText || ('Cannot connect to Hoodie server at ' + (this.baseUrl || '/'))
      };
    }

    return promises.rejectWith(error).promise();
  }


  //
  // public API
  //
  return request;
}());

},{"./promises":10}],13:[function(require,module,exports){

// scoped Store
// ============

// same as store, but with type preset to an initially
// passed value.
//
var events = require('./events');

module.exports = function (hoodie, options) {

  // name
  var storeName;

  this.options = options || {};

  if (!this.options.name) {
    storeName = 'store';
  } else {
    storeName = this.options.name;
  }

  var type = options.type;
  var id = options.id;

  var api = {};

  // scoped by type only
  if (!id) {

    // add events
    events({
      context: api,
      namespace: storeName + ':' + type
    });

    //
    api.save = function save(id, properties, options) {
      return hoodie.store.save(type, id, properties, options);
    };

    //
    api.add = function add(properties, options) {
      return hoodie.store.add(type, properties, options);
    };

    //
    api.find = function find(id) {
      return hoodie.store.find(type, id);
    };

    //
    api.findOrAdd = function findOrAdd(id, properties) {
      return hoodie.store.findOrAdd(type, id, properties);
    };

    //
    api.findAll = function findAll(options) {
      return hoodie.store.findAll(type, options);
    };

    //
    api.update = function update(id, objectUpdate, options) {
      return hoodie.store.update(type, id, objectUpdate, options);
    };

    //
    api.updateAll = function updateAll(objectUpdate, options) {
      return hoodie.store.updateAll(type, objectUpdate, options);
    };

    //
    api.remove = function remove(id, options) {
      return hoodie.store.remove(type, id, options);
    };

    //
    api.removeAll = function removeAll(options) {
      return hoodie.store.removeAll(type, options);
    };

  }

  // scoped by both: type & id
  if (id) {

    // add events
    events({
      context: api,
      namespace: storeName + ':' + type + ':' + id
    });

    //
    api.save = function save(properties, options) {
      return hoodie.store.save(type, id, properties, options);
    };

    //
    api.find = function find() {
      return hoodie.store.find(type, id);
    };

    //
    api.update = function update(objectUpdate, options) {
      return hoodie.store.update(type, id, objectUpdate, options);
    };

    //
    api.remove = function remove(options) {
      return hoodie.store.remove(type, id, options);
    };
  }

  //
  api.decoratePromises = hoodie.store.decoratePromises;
  api.validate = hoodie.store.validate;

  return api;

};

},{"./events":8}],14:[function(require,module,exports){
// scoped Store
// ============

// same as store, but with type preset to an initially
// passed value.

var events = require('./events');

module.exports = function (hoodie, taskApi, options) {

  var type = options.type;
  var id = options.id;

  var api = {};

  // scoped by type only
  if (!id) {

    // add events
    events({
      context: api,
      namespace: 'task:' + type
    });

    //
    api.start = function start(properties) {
      return taskApi.start(type, properties);
    };

    //
    api.cancel = function cancel(id) {
      return taskApi.cancel(type, id);
    };

    //
    api.restart = function restart(id, update) {
      return taskApi.restart(type, id, update);
    };

    //
    api.cancelAll = function cancelAll() {
      return taskApi.cancelAll(type);
    };

    //
    api.restartAll = function restartAll(update) {
      return taskApi.restartAll(type, update);
    };
  }

  // scoped by both: type & id
  if (id) {

    // add events
    events({
      context: api,
      namespace: 'task:' + type + ':' + id
    });

    //
    api.cancel = function cancel() {
      return taskApi.cancel(type, id);
    };

    //
    api.restart = function restart(update) {
      return taskApi.restart(type, id, update);
    };
  }

  return api;
};

},{"./events":8}],15:[function(require,module,exports){
// Store
// ============

// This class defines the API that hoodie.store (local store) and hoodie.open
// (remote store) implement to assure a coherent API. It also implements some
// basic validations.
//
// The returned API provides the following methods:
//
// * validate
// * save
// * add
// * find
// * findOrAdd
// * findAll
// * update
// * updateAll
// * remove
// * removeAll
// * decoratePromises
// * trigger
// * on
// * unbind
//
// At the same time, the returned API can be called as function returning a
// store scoped by the passed type, for example
//
//     var taskStore = hoodie.store('task');
//     taskStore.findAll().then( showAllTasks );
//     taskStore.update('id123', {done: true});
//
var events = require('./events');
var scopedStore = require('./scoped_store');
var errors = require('./errors');
var utils = require('util');

module.exports = function (hoodie, options) {

  var self = this;

  this.options = options || {};

  // persistance logic
  var backend = {};

  // extend this property with extra functions that will be available
  // on all promises returned by hoodie.store API. It has a reference
  // to current hoodie instance by default
  var promiseApi = {
    hoodie: hoodie
  };

  var storeName;

  if (!this.options.name) {
    storeName = 'store';
  } else {
    storeName = this.options.name;
  }

  var api = {};

  var util = require('util');

  util.inherits(api, function api(type, id) {

    var scopedOptions = $.extend(true, {
      type: type,
      id: id
    }, self.options);

    return scopedStore.call(this, hoodie, api, scopedOptions);
  });

  // add event API
  events({
    context: api,
    namespace: storeName
  });


  // Validate
  // --------------

  // by default, we only check for a valid type & id.
  // the validate method can be overwriten by passing
  // options.validate
  //
  // if `validate` returns nothing, the passed object is
  // valid. Otherwise it returns an error
  //
  api.validate = function(object /*, options */) {

    if (!object.id) {
      return;
    }

    if (!object) {
      return errors.INVALID_ARGUMENTS('no object passed');
    }

    if (!isValidType(object.type)) {
      return errors.INVALID_KEY({
        type: object.type
      });
    }

    if (!isValidId(object.id)) {
      return errors.INVALID_KEY({
        id: object.id
      });
    }

  };

  // Save
  // --------------

  // creates or replaces an an eventually existing object in the store
  // with same type & id.
  //
  // When id is undefined, it gets generated and a new object gets saved
  //
  // example usage:
  //
  //     store.save('car', undefined, {color: 'red'})
  //     store.save('car', 'abc4567', {color: 'red'})
  //
  api.save = function (type, id, properties, options) {

    if (options) {
      options = $.extend(true, {}, options);
    } else {
      options = {};
    }

    // don't mess with passed object
    var object = $.extend(true, {}, properties, {
      type: type,
      id: id
    });

    // validations
    var error = api.validate(object, options || {});

    if (error) {
      return rejectWith(error);
    }

    return decoratePromise(backend.save(object, options || {}));
  };


  // Add
  // -------------------

  // `.add` is an alias for `.save`, with the difference that there is no id argument.
  // Internally it simply calls `.save(type, undefined, object).
  //
  api.add = function (type, properties, options) {

    properties = properties || {};
    options = options || {};

    return api.save(type, properties.id, properties, options);
  };


  // find
  // ------

  //
  api.find = function (type, id) {
    return decoratePromise(backend.find(type, id));
  };


  // find or add
  // -------------

  // 1. Try to find a share by given id
  // 2. If share could be found, return it
  // 3. If not, add one and return it.
  //
  api.findOrAdd = function (type, id, properties) {

    properties = properties || {};

    function handleNotFound() {
      var newProperties = $.extend(true, {
        id: id
      }, properties);

      return api.add(type, newProperties);
    }

    // promise decorations get lost when piped through `then`,
    // that's why we need to decorate the find's promise again.
    var promise = api.find(type, id).then(null, handleNotFound);

    return decoratePromise(promise);
  };


  // findAll
  // ------------

  // returns all objects from store.
  // Can be optionally filtered by a type or a function
  //
  api.findAll = function (type, options) {
    return decoratePromise(backend.findAll(type, options));
  };


  // Update
  // -------------------

  // In contrast to `.save`, the `.update` method does not replace the stored object,
  // but only changes the passed attributes of an exsting object, if it exists
  //
  // both a hash of key/values or a function that applies the update to the passed
  // object can be passed.
  //
  // example usage
  //
  // hoodie.store.update('car', 'abc4567', {sold: true})
  // hoodie.store.update('car', 'abc4567', function(obj) { obj.sold = true })
  //
  api.update = function (type, id, objectUpdate, options) {

    function handleFound(currentObject) {
      var changedProperties, newObj, value;

      // normalize input
      newObj = $.extend(true, {}, currentObject);

      if (typeof objectUpdate === 'function') {
        objectUpdate = objectUpdate(newObj);
      }

      if (!objectUpdate) {
        return resolveWith(currentObject);
      }

      // check if something changed
      changedProperties = (function() {
        var _results = [];

        for (var key in objectUpdate) {
          if (objectUpdate.hasOwnProperty(key)) {
            value = objectUpdate[key];
            if ((currentObject[key] !== value) === false) {
              continue;
            }
            // workaround for undefined values, as $.extend ignores these
            newObj[key] = value;
            _results.push(key);
          }
        }
        return _results;
      })();

      if (!(changedProperties.length || options)) {
        return resolveWith(newObj);
      }

      //apply update
      return api.save(type, id, newObj, options);
    }

    // promise decorations get lost when piped through `then`,
    // that's why we need to decorate the find's promise again.
    var promise = api.find(type, id).then(handleFound);
    return decoratePromise(promise);
  };


  // updateOrAdd
  // -------------

  // same as `.update()`, but in case the object cannot be found,
  // it gets created
  //
  api.updateOrAdd = function (type, id, objectUpdate, options) {
    function handleNotFound() {
      var properties = $.extend(true, {}, objectUpdate, {id: id});
      return api.add(type, properties, options);
    }

    var promise = api.update(type, id, objectUpdate, options).then(null, handleNotFound);
    return decoratePromise(promise);
  };


  // updateAll
  // -----------------

  // update all objects in the store, can be optionally filtered by a function
  // As an alternative, an array of objects can be passed
  //
  // example usage
  //
  // hoodie.store.updateAll()
  //
  api.updateAll = function (filterOrObjects, objectUpdate, options) {
    var promise;

    options = options || {};

    // normalize the input: make sure we have all objects
    switch (true) {
    case typeof filterOrObjects === 'string':
      promise = api.findAll(filterOrObjects);
      break;
    case hoodie.isPromise(filterOrObjects):
      promise = filterOrObjects;
      break;
    case $.isArray(filterOrObjects):
      promise = hoodie.defer().resolve(filterOrObjects).promise();
      break;
    default: // e.g. null, update all
      promise = api.findAll();
    }

    promise = promise.then(function(objects) {
      // now we update all objects one by one and return a promise
      // that will be resolved once all updates have been finished
      var object, _updatePromises;

      if (!$.isArray(objects)) {
        objects = [objects];
      }

      _updatePromises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          object = objects[_i];
          _results.push(api.update(object.type, object.id, objectUpdate, options));
        }
        return _results;
      })();

      return $.when.apply(null, _updatePromises);
    });

    return decoratePromise(promise);
  };


  // Remove
  // ------------

  // Removes one object specified by `type` and `id`.
  //
  // when object has been synced before, mark it as deleted.
  // Otherwise remove it from Store.
  //
  api.remove = function (type, id, options) {
    return decoratePromise(backend.remove(type, id, options || {}));
  };


  // removeAll
  // -----------

  // Destroye all objects. Can be filtered by a type
  //
  api.removeAll = function (type, options) {
    return decoratePromise(backend.removeAll(type, options || {}));
  };


  // decorate promises
  // -------------------

  // extend promises returned by store.api
  api.decoratePromises = function (methods) {
    return utils.inherits(promiseApi, methods);
  };

  // required backend methods
  // -------------------------
  if (!options.backend) {
    throw new Error('options.backend must be passed');
  }

  var required = 'save find findAll remove removeAll'.split(' ');

  required.forEach(function(methodName) {

    if (!options.backend[methodName]) {
      throw new Error('options.backend.' + methodName + ' must be passed.');
    }

    backend[methodName] = options.backend[methodName];
  });


  // Private
  // ---------

  // / not allowed for id
  function isValidId(key) {
    return new RegExp(/^[^\/]+$/).test(key || '');
  }

  // / not allowed for type
  function isValidType(key) {
    return new RegExp(/^[^\/]+$/).test(key || '');
  }

  //
  function decoratePromise(promise) {
    return utils.inherits(promise, promiseApi);
  }

  function resolveWith() {
    var promise = hoodie.resolveWith.apply(null, arguments);
    return decoratePromise(promise);
  }

  function rejectWith() {
    var promise = hoodie.rejectWith.apply(null, arguments);
    return decoratePromise(promise);
  }

  return api;

};


},{"./errors":7,"./events":8,"./scoped_store":13,"util":2}],16:[function(require,module,exports){
// Tasks
// ============

// This class defines the hoodie.task API.
//
// The returned API provides the following methods:
//
// * start
// * cancel
// * restart
// * remove
// * on
// * one
// * unbind
//
// At the same time, the returned API can be called as function returning a
// store scoped by the passed type, for example
//
//     var emailTasks = hoodie.task('email');
//     emailTasks.start( properties );
//     emailTasks.cancel('id123');
//
var events = require('./events');
var promises = require('./promises');
var scopedTask = require('./scoped_task');
var account = require('./account');
var store = require('./store');

module.exports = function () {

  // public API
  var api = function api(type, id) {
    return scopedTask(api, {
      type: type,
      id: id
    });
  };

  // add events API
  events({
    context: api,
    namespace: 'task'
  });


  // start
  // -------

  // start a new task. If the user has no account yet, hoodie tries to sign up
  // for an anonymous account in the background. If that fails, the returned
  // promise will be rejected.
  //
  api.start = function(type, properties) {
    if (account.hasAccount()) {
      return store.add('$' + type, properties).then(handleNewTask);
    }

    return account.anonymousSignUp().then( function() {
      return api.start(type, properties);
    });
  };


  // cancel
  // -------

  // cancel a running task
  //
  api.cancel = function(type, id) {
    return store.update('$' + type, id, {
      cancelledAt: now()
    }).then(handleCancelledTask);
  };


  // restart
  // ---------

  // first, we try to cancel a running task. If that succeeds, we start
  // a new one with the same properties as the original
  //
  api.restart = function(type, id, update) {
    var start = function(object) {
      $.extend(object, update);
      delete object.$error;
      delete object.$processedAt;
      delete object.cancelledAt;
      return api.start(object.type, object);
    };

    return api.cancel(type, id).then(start);
  };

  // cancelAll
  // -----------

  //
  api.cancelAll = function(type) {
    return findAll(type).then( cancelTaskObjects );
  };

  // restartAll
  // -----------

  //
  api.restartAll = function(type, update) {
    if (typeof type === 'object') {
      update = type;
    }
    return findAll(type).then( function(taskObjects) {
      restartTaskObjects(taskObjects, update);
    });
  };


  //
  // subscribe to store events
  // we subscribe to all store changes, pipe through the task ones,
  // making a few changes along the way.
  //
  function subscribeToStoreEvents() {

    // account events
    events.on('store:change', handleStoreChange);
  }

  // allow to run this only once from outside (during Hoodie initialization)
  api.subscribeToStoreEvents = function() {
    subscribeToStoreEvents();
    delete api.subscribeToStoreEvents;
  };


  // Private
  // -------

  //
  function handleNewTask(object) {
    var defer = promises.defer();
    var taskStore = store(object.type, object.id);

    taskStore.on('remove', function(object) {

      // remove "$" from type
      object.type = object.type.substr(1);

      // task finished by worker.
      if (object.finishedAt) {
        return defer.resolve(object);
      }

      // manually removed / cancelled.
      defer.reject(object);
    });

    taskStore.on('error', function(error, object) {

      // remove "$" from type
      object.type = object.type.substr(1);

      defer.reject(error, object);
    });

    return defer.promise();
  }

  //
  function handleCancelledTask (task) {
    var defer;
    var type = '$'+task.type;
    var id = task.id;
    var removePromise = store.remove(type, id);

    if (!task._rev) {
      // task has not yet been synced.
      return removePromise;
    }

    defer = promises.defer();
    events.one('store:sync:' + type + ':' + id, defer.resolve);
    removePromise.fail(defer.reject);

    return defer.promise();
  }

  //
  function handleStoreChange(eventName, object, options) {
    if (object.type[0] !== '$') {
      return;
    }

    object.type = object.type.substr(1);
    triggerEvents(eventName, object, options);
  }

  //
  function findAll (type) {
    var startsWith = '$';
    var filter;
    if (type) {
      startsWith += type;
    }

    filter = function(object) {
      return object.type.indexOf(startsWith) === 0;
    };
    return store.findAll(filter);
  }

  //
  function cancelTaskObjects (taskObjects) {
    return taskObjects.map( function(taskObject) {
      return api.cancel(taskObject.type.substr(1), taskObject.id);
    });
  }

  //
  function restartTaskObjects (taskObjects, update) {
    return taskObjects.map( function(taskObject) {
      return api.restart(taskObject.type.substr(1), taskObject.id, update);
    });
  }

  // this is where all the task events get triggered,
  // like add:message, change:message:abc4567, remove, etc.
  function triggerEvents(eventName, task, options) {
    var error;

    // "new" tasks are trigger as "start" events
    if (eventName === 'new') {
      eventName = 'start';
    }

    if (eventName === 'remove' && task.cancelledAt) {
      eventName = 'cancel';
    }

    if (eventName === 'remove' && task.$processedAt) {
      eventName = 'success';
    }

    if (eventName === 'update' && task.$error) {
      eventName = 'error';
      error = task.$error;
      delete task.$error;

      api.trigger('error', error, task, options);
      api.trigger('error:' + task.type, error, task, options);
      api.trigger('error:' + task.type + ':' + task.id, error, task, options);

      options = $.extend({}, options, {error: error});
      api.trigger('change', 'error', task, options);
      api.trigger('change:' + task.type, 'error', task, options);
      api.trigger('change:' + task.type + ':' + task.id, 'error', task, options);
      return;
    }

    // ignore all the other events
    if (eventName !== 'start' && eventName !== 'cancel' && eventName !== 'success') {
      return;
    }

    api.trigger(eventName, task, options);
    api.trigger(eventName + ':' + task.type, task, options);

    if (eventName !== 'start') {
      api.trigger(eventName + ':' + task.type + ':' + task.id, task, options);
    }

    api.trigger('change', eventName, task, options);
    api.trigger('change:' + task.type, eventName, task, options);

    if (eventName !== 'start') {
      api.trigger('change:' + task.type + ':' + task.id, eventName, task, options);
    }
  }

  function now() {
    return JSON.stringify(new Date()).replace(/['"]/g, '');
  }

  return api;

};


},{"./account":4,"./events":8,"./promises":10,"./scoped_task":14,"./store":15}],17:[function(require,module,exports){
/* exported hoodieDispose */

// hoodie.dispose
// ================
var events = require('../events');

module.exports = function () {

  // if a hoodie instance is not needed anymore, it can
  // be disposed using this method. A `dispose` event
  // gets triggered that the modules react on.
  events.trigger('dispose');
  events.unbind();

  return;
};

},{"../events":8}],18:[function(require,module,exports){
/* exported hoodieUUID */

// hoodie.uuid
// =============

// uuids consist of numbers and lowercase letters only.
// We stick to lowercase letters to prevent confusion
// and to prevent issues with CouchDB, e.g. database
// names do wonly allow for lowercase letters.

module.exports = function (length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
  var radix = chars.length;
  var i;
  var id = '';

  // default uuid length to 7
  if (length === undefined) {
    length = 7;
  }

  for (i = 0; i < length; i++) {
    var rand = Math.random() * radix;
    var char = chars[Math.floor(rand)];
    id += String(char).charAt(0);
  }

  return id;

};

},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9fc2hpbXMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi91dGlsLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9hY2NvdW50LmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvY29uZmlnLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvY29ubmVjdGlvbi5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL2Vycm9ycy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL2V2ZW50cy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL29wZW4uanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9wcm9taXNlcy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3JlbW90ZV9zdG9yZS5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3JlcXVlc3QuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9zY29wZWRfc3RvcmUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9zY29wZWRfdGFzay5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3N0b3JlLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvdGFzay5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3V0aWxzL2Rpc3Bvc2UuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS91dGlscy91dWlkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vL1xuLy8gVGhlIHNoaW1zIGluIHRoaXMgZmlsZSBhcmUgbm90IGZ1bGx5IGltcGxlbWVudGVkIHNoaW1zIGZvciB0aGUgRVM1XG4vLyBmZWF0dXJlcywgYnV0IGRvIHdvcmsgZm9yIHRoZSBwYXJ0aWN1bGFyIHVzZWNhc2VzIHRoZXJlIGlzIGluXG4vLyB0aGUgb3RoZXIgbW9kdWxlcy5cbi8vXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBBcnJheS5pc0FycmF5IGlzIHN1cHBvcnRlZCBpbiBJRTlcbmZ1bmN0aW9uIGlzQXJyYXkoeHMpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogaXNBcnJheTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5maWx0ZXIgPSBmdW5jdGlvbiBmaWx0ZXIoeHMsIGZuKSB7XG4gIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZm4pO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZm4oeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKHhzLCBmbiwgc2VsZikge1xuICBpZiAoeHMuZm9yRWFjaCkgcmV0dXJuIHhzLmZvckVhY2goZm4sIHNlbGYpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm4uY2FsbChzZWxmLCB4c1tpXSwgaSwgeHMpO1xuICB9XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUubWFwIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMubWFwID0gZnVuY3Rpb24gbWFwKHhzLCBmbikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGZuKTtcbiAgdmFyIG91dCA9IG5ldyBBcnJheSh4cy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZm4oeHNbaV0sIGksIHhzKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLnJlZHVjZSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLnJlZHVjZSA9IGZ1bmN0aW9uIHJlZHVjZShhcnJheSwgY2FsbGJhY2ssIG9wdF9pbml0aWFsVmFsdWUpIHtcbiAgaWYgKGFycmF5LnJlZHVjZSkgcmV0dXJuIGFycmF5LnJlZHVjZShjYWxsYmFjaywgb3B0X2luaXRpYWxWYWx1ZSk7XG4gIHZhciB2YWx1ZSwgaXNWYWx1ZVNldCA9IGZhbHNlO1xuXG4gIGlmICgyIDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHZhbHVlID0gb3B0X2luaXRpYWxWYWx1ZTtcbiAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgbCA+IGk7ICsraSkge1xuICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgaWYgKGlzVmFsdWVTZXQpIHtcbiAgICAgICAgdmFsdWUgPSBjYWxsYmFjayh2YWx1ZSwgYXJyYXlbaV0sIGksIGFycmF5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFycmF5W2ldO1xuICAgICAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG5pZiAoJ2FiJy5zdWJzdHIoLTEpICE9PSAnYicpIHtcbiAgZXhwb3J0cy5zdWJzdHIgPSBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgLy8gZGlkIHdlIGdldCBhIG5lZ2F0aXZlIHN0YXJ0LCBjYWxjdWxhdGUgaG93IG11Y2ggaXQgaXMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmdcbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcblxuICAgIC8vIGNhbGwgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbmd0aCk7XG4gIH07XG59IGVsc2Uge1xuICBleHBvcnRzLnN1YnN0ciA9IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuZ3RoKTtcbiAgfTtcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS50cmltIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMudHJpbSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59O1xuXG4vLyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGZuID0gYXJncy5zaGlmdCgpO1xuICBpZiAoZm4uYmluZCkgcmV0dXJuIGZuLmJpbmQuYXBwbHkoZm4sIGFyZ3MpO1xuICB2YXIgc2VsZiA9IGFyZ3Muc2hpZnQoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBmbi5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChbQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKV0pKTtcbiAgfTtcbn07XG5cbi8vIE9iamVjdC5jcmVhdGUgaXMgc3VwcG9ydGVkIGluIElFOVxuZnVuY3Rpb24gY3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICB2YXIgb2JqZWN0O1xuICBpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG4gICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgfVxuICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuZXhwb3J0cy5jcmVhdGUgPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5jcmVhdGUgOiBjcmVhdGU7XG5cbi8vIE9iamVjdC5rZXlzIGFuZCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBzdXBwb3J0ZWQgaW4gSUU5IGhvd2V2ZXJcbi8vIHRoZXkgZG8gc2hvdyBhIGRlc2NyaXB0aW9uIGFuZCBudW1iZXIgcHJvcGVydHkgb24gRXJyb3Igb2JqZWN0c1xuZnVuY3Rpb24gbm90T2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKCh0eXBlb2Ygb2JqZWN0ICE9IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iamVjdCAhPSBcImZ1bmN0aW9uXCIpIHx8IG9iamVjdCA9PT0gbnVsbCk7XG59XG5cbmZ1bmN0aW9uIGtleXNTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmtleXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIG5hbWUpKSB7XG4gICAgICByZXN1bHQucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBhbG1vc3QgdGhlIHNhbWUgYXMgT2JqZWN0LmtleXMgb25lIGtleSBmZWF0dXJlXG4vLyAgaXMgdGhhdCBpdCByZXR1cm5zIGhpZGRlbiBwcm9wZXJ0aWVzLCBzaW5jZSB0aGF0IGNhbid0IGJlIGltcGxlbWVudGVkLFxuLy8gIHRoaXMgZmVhdHVyZSBnZXRzIHJlZHVjZWQgc28gaXQganVzdCBzaG93cyB0aGUgbGVuZ3RoIHByb3BlcnR5IG9uIGFycmF5c1xuZnVuY3Rpb24gcHJvcGVydHlTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBrZXlzU2hpbShvYmplY3QpO1xuICBpZiAoZXhwb3J0cy5pc0FycmF5KG9iamVjdCkgJiYgZXhwb3J0cy5pbmRleE9mKG9iamVjdCwgJ2xlbmd0aCcpID09PSAtMSkge1xuICAgIHJlc3VsdC5wdXNoKCdsZW5ndGgnKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIga2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5rZXlzIDoga2V5c1NoaW07XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyA/XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIDogcHJvcGVydHlTaGltO1xuXG5pZiAobmV3IEVycm9yKCkuaGFzT3duUHJvcGVydHkoJ2Rlc2NyaXB0aW9uJykpIHtcbiAgdmFyIEVSUk9SX1BST1BFUlRZX0ZJTFRFUiA9IGZ1bmN0aW9uIChvYmosIGFycmF5KSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRXJyb3JdJykge1xuICAgICAgYXJyYXkgPSBleHBvcnRzLmZpbHRlcihhcnJheSwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUgIT09ICdkZXNjcmlwdGlvbicgJiYgbmFtZSAhPT0gJ251bWJlcicgJiYgbmFtZSAhPT0gJ21lc3NhZ2UnO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEVSUk9SX1BST1BFUlRZX0ZJTFRFUihvYmplY3QsIGtleXMob2JqZWN0KSk7XG4gIH07XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gRVJST1JfUFJPUEVSVFlfRklMVEVSKG9iamVjdCwgZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIGV4cG9ydHMua2V5cyA9IGtleXM7XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGdldE93blByb3BlcnR5TmFtZXM7XG59XG5cbi8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgLSBzdXBwb3J0ZWQgaW4gSUU4IGJ1dCBvbmx5IG9uIGRvbSBlbGVtZW50c1xuZnVuY3Rpb24gdmFsdWVPYmplY3QodmFsdWUsIGtleSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWVba2V5XSB9O1xufVxuXG5pZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgdHJ5IHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHsnYSc6IDF9LCAnYScpO1xuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElFOCBkb20gZWxlbWVudCBpc3N1ZSAtIHVzZSBhIHRyeSBjYXRjaCBhbmQgZGVmYXVsdCB0byB2YWx1ZU9iamVjdFxuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdmFsdWVPYmplY3QodmFsdWUsIGtleSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSBlbHNlIHtcbiAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSB2YWx1ZU9iamVjdDtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgc2hpbXMgPSByZXF1aXJlKCdfc2hpbXMnKTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBzaGltcy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzKTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBzaGltcy5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuXG4gIHNoaW1zLmZvckVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gc2hpbXMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKHNoaW1zLmluZGV4T2YoY3R4LnNlZW4sIGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBzaGltcy5yZWR1Y2Uob3V0cHV0LCBmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gc2hpbXMuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmc7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiYgb2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuYmluYXJ5U2xpY2UgPT09ICdmdW5jdGlvbidcbiAgO1xufVxuZXhwb3J0cy5pc0J1ZmZlciA9IGlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gIGN0b3IucHJvdG90eXBlID0gc2hpbXMuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBzaGltcy5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIvKiBnbG9iYWwgb3Blbjp0cnVlICovXG5cbi8vIEhvb2RpZSBDb3JlXG4vLyAtLS0tLS0tLS0tLS0tXG4vL1xuLy8gdGhlIGRvb3IgdG8gd29ybGQgZG9taW5hdGlvbiAoYXBwcylcbi8vXG4vL1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vaG9vZGllL2V2ZW50cycpO1xudmFyIHByb21pc2VzID0gcmVxdWlyZSgnLi9ob29kaWUvcHJvbWlzZXMnKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnLi9ob29kaWUvcmVxdWVzdCcpO1xudmFyIGNvbm5lY3Rpb24gPSByZXF1aXJlKCcuL2hvb2RpZS9jb25uZWN0aW9uJyk7XG52YXIgVVVJRCA9IHJlcXVpcmUoJy4vaG9vZGllL3V0aWxzL3V1aWQnKTtcbnZhciBkaXNwb3NlID0gcmVxdWlyZSgnLi9ob29kaWUvdXRpbHMvZGlzcG9zZScpO1xudmFyIG9wZW4gPSByZXF1aXJlKCcuL2hvb2RpZS9vcGVuJyk7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL2hvb2RpZS9zdG9yZScpO1xudmFyIHRhc2sgPSByZXF1aXJlKCcuL2hvb2RpZS90YXNrJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9ob29kaWUvY29uZmlnJyk7XG52YXIgYWNjb3VudCA9IHJlcXVpcmUoJy4vaG9vZGllL2FjY291bnQnKTtcbnZhciByZW1vdGUgPSByZXF1aXJlKCcuL2hvb2RpZS9yZW1vdGVfc3RvcmUnKTtcbnZhciBhY2NvdW50ID0gcmVxdWlyZSgnLi9ob29kaWUvYWNjb3VudCcpO1xuXG4vLyBDb25zdHJ1Y3RvclxuLy8gLS0tLS0tLS0tLS0tLVxuXG4vLyBXaGVuIGluaXRpYWxpemluZyBhIGhvb2RpZSBpbnN0YW5jZSwgYW4gb3B0aW9uYWwgVVJMXG4vLyBjYW4gYmUgcGFzc2VkLiBUaGF0J3MgdGhlIFVSTCBvZiB0aGUgaG9vZGllIGJhY2tlbmQuXG4vLyBJZiBubyBVUkwgcGFzc2VkIGl0IGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGRvbWFpbi5cbi8vXG4vLyAgICAgLy8gaW5pdCBhIG5ldyBob29kaWUgaW5zdGFuY2Vcbi8vICAgICBob29kaWUgPSBuZXcgSG9vZGllXG4vL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvb2RpZShiYXNlVXJsKSB7XG4gIHZhciBob29kaWUgPSB0aGlzO1xuXG4gIC8vIGVuZm9yY2UgaW5pdGlhbGl6YXRpb24gd2l0aCBgbmV3YFxuICBpZiAoIShob29kaWUgaW5zdGFuY2VvZiBIb29kaWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2FnZTogbmV3IEhvb2RpZSh1cmwpOycpO1xuICB9XG5cbiAgaWYgKGJhc2VVcmwpIHtcbiAgICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2hlc1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG4gIH1cblxuXG4gIC8vIGhvb2RpZS5leHRlbmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZXh0ZW5kIGhvb2RpZSBpbnN0YW5jZTpcbiAgLy9cbiAgLy8gICAgIGhvb2RpZS5leHRlbmQoZnVuY3Rpb24oaG9vZGllKSB7fSApXG4gIC8vXG4gIHRoaXMuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKGV4dGVuc2lvbikge1xuICAgIGV4dGVuc2lvbihob29kaWUpO1xuICB9O1xuXG5cbiAgLy9cbiAgLy8gRXh0ZW5kaW5nIGhvb2RpZSBjb3JlXG4gIC8vXG5cbiAgLy8gKiBob29kaWUuYmluZFxuICAvLyAqIGhvb2RpZS5vblxuICAvLyAqIGhvb2RpZS5vbmVcbiAgLy8gKiBob29kaWUudHJpZ2dlclxuICAvLyAqIGhvb2RpZS51bmJpbmRcbiAgLy8gKiBob29kaWUub2ZmXG4gIHRoaXMuYmluZCA9IGV2ZW50cy5iaW5kO1xuICB0aGlzLm9uID0gZXZlbnRzLm9uO1xuICB0aGlzLm9uZSA9IGV2ZW50cy5vbmU7XG4gIHRoaXMudHJpZ2dlciA9IGV2ZW50cy50cmlnZ2VyO1xuICB0aGlzLnVuYmluZCA9IGV2ZW50cy51bmJpbmQ7XG4gIHRoaXMub2ZmID0gZXZlbnRzLm9mZjtcblxuXG4gIC8vICogaG9vZGllLmRlZmVyXG4gIC8vICogaG9vZGllLmlzUHJvbWlzZVxuICAvLyAqIGhvb2RpZS5yZXNvbHZlXG4gIC8vICogaG9vZGllLnJlamVjdFxuICAvLyAqIGhvb2RpZS5yZXNvbHZlV2l0aFxuICAvLyAqIGhvb2RpZS5yZWplY3RXaXRoXG4gIHRoaXMuZGVmZXIgPSBwcm9taXNlcy5kZWZlcjtcbiAgdGhpcy5pc1Byb21pc2UgPSBwcm9taXNlcy5pc1Byb21pc2U7XG4gIHRoaXMucmVzb2x2ZSA9IHByb21pc2VzLnJlc29sdmU7XG4gIHRoaXMucmVqZWN0ID0gcHJvbWlzZXMucmVqZWN0O1xuICB0aGlzLnJlc29sdmVXaXRoID0gcHJvbWlzZXMucmVzb2x2ZVdpdGg7XG5cblxuICAvLyAqIGhvb2RpZS5yZXF1ZXN0XG4gIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgLy8gKiBob29kaWUuaXNPbmxpbmVcbiAgLy8gKiBob29kaWUuY2hlY2tDb25uZWN0aW9uXG4gIHRoaXMuaXNPbmxpbmUgPSBjb25uZWN0aW9uLmlzT25saW5lO1xuICB0aGlzLmNoZWNrQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb24uY2hlY2tDb25uZWN0aW9uO1xuXG4gIC8vICogaG9vZGllLnV1aWRcbiAgdGhpcy5VVUlEID0gVVVJRDtcblxuICAvLyAqIGhvb2RpZS5kaXNwb3NlXG4gIHRoaXMuZGlzcG9zZSA9IGRpc3Bvc2U7XG5cbiAgLy8gKiBob29kaWUub3BlblxuICB0aGlzLm9wZW4gPSBvcGVuO1xuXG4gIC8vICogaG9vZGllLnN0b3JlXG4gIHRoaXMuc3RvcmUgPSBzdG9yZTtcblxuICAvLyAqIGhvb2RpZS50YXNrXG4gIHRoaXMudGFzayA9IHRhc2s7XG5cbiAgLy8gKiBob29kaWUuY29uZmlnXG4gIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gIC8vICogaG9vZGllLmFjY291bnRcbiAgdGhpcy5hY2NvdW50ID0gYWNjb3VudDtcblxuICAvLyAqIGhvb2RpZS5yZW1vdGVcbiAgdGhpcy5yZW1vdGUgPSByZW1vdGU7XG5cblxuICAvL1xuICAvLyBJbml0aWFsaXphdGlvbnNcbiAgLy9cblxuICAvLyBzZXQgdXNlcm5hbWUgZnJvbSBjb25maWcgKGxvY2FsIHN0b3JlKVxuICB0aGlzLmFjY291bnQudXNlcm5hbWUgPSBjb25maWcuZ2V0KCdfYWNjb3VudC51c2VybmFtZScpO1xuXG4gIC8vIGNoZWNrIGZvciBwZW5kaW5nIHBhc3N3b3JkIHJlc2V0XG4gIHRoaXMuYWNjb3VudC5jaGVja1Bhc3N3b3JkUmVzZXQoKTtcblxuICAvLyBjbGVhciBjb25maWcgb24gc2lnbiBvdXRcbiAgZXZlbnRzLm9uKCdhY2NvdW50OnNpZ25vdXQnLCBjb25maWcuY2xlYXIpO1xuXG4gIC8vIGhvb2RpZS5zdG9yZVxuICB0aGlzLnN0b3JlLnBhdGNoSWZOb3RQZXJzaXN0YW50KCk7XG4gIHRoaXMuc3RvcmUuc3Vic2NyaWJlVG9PdXRzaWRlRXZlbnRzKCk7XG4gIHRoaXMuc3RvcmUuYm9vdHN0cmFwRGlydHlPYmplY3RzKCk7XG5cbiAgLy8gaG9vZGllLnJlbW90ZVxuICB0aGlzLnJlbW90ZS5zdWJzY3JpYmVUb0V2ZW50cygpO1xuXG4gIC8vIGhvb2RpZS50YXNrXG4gIHRoaXMudGFzay5zdWJzY3JpYmVUb1N0b3JlRXZlbnRzKCk7XG5cbiAgLy8gYXV0aGVudGljYXRlXG4gIC8vIHdlIHVzZSBhIGNsb3N1cmUgdG8gbm90IHBhc3MgdGhlIHVzZXJuYW1lIHRvIGNvbm5lY3QsIGFzIGl0XG4gIC8vIHdvdWxkIHNldCB0aGUgbmFtZSBvZiB0aGUgcmVtb3RlIHN0b3JlLCB3aGljaCBpcyBub3QgdGhlIHVzZXJuYW1lLlxuICB0aGlzLmFjY291bnQuYXV0aGVudGljYXRlKCkudGhlbihmdW5jdGlvbiggLyogdXNlcm5hbWUgKi8gKSB7XG4gICAgcmVtb3RlLmNvbm5lY3QoKTtcbiAgfSk7XG5cbiAgLy8gY2hlY2sgY29ubmVjdGlvbiB3aGVuIGJyb3dzZXIgZ29lcyBvbmxpbmUgLyBvZmZsaW5lXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLmNoZWNrQ29ubmVjdGlvbiwgZmFsc2UpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuY2hlY2tDb25uZWN0aW9uLCBmYWxzZSk7XG5cbiAgLy8gc3RhcnQgY2hlY2tpbmcgY29ubmVjdGlvblxuICB0aGlzLmNoZWNrQ29ubmVjdGlvbigpO1xuXG4gIC8vXG4gIC8vIGxvYWRpbmcgdXNlciBleHRlbnNpb25zXG4gIC8vXG4gIGFwcGx5RXh0ZW5zaW9ucyhob29kaWUpO1xufTtcblxuLy8gRXh0ZW5kaW5nIGhvb2RpZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFlvdSBjYW4gZWl0aGVyIGV4dGVuZCB0aGUgSG9vZGllIGNsYXNzLCBvciBhIGhvb2RpZVxuLy8gaW5zdGFuY2UgZHVyaW5nIHJ1bnRpbWVcbi8vXG4vLyAgICAgSG9vZGllLmV4dGVuZCgnbWFnaWMxJywgZnVuY2lvbihob29kaWUpIHsgLyogLi4uICovIH0pXG4vLyAgICAgaG9vZGllID0gbmV3IEhvb2RpZVxuLy8gICAgIGhvb2RpZS5leHRlbmQoJ21hZ2ljMicsIGZ1bmN0aW9uKGhvb2RpZSkgeyAvKiAuLi4gKi8gfSlcbi8vICAgICBob29kaWUubWFnaWMxLmRvU29tZXRoaW5nKClcbi8vICAgICBob29kaWUubWFnaWMyLmRvU29tZXRoaW5nRWxzZSgpXG4vL1xuLy8gSG9vZGllIGNhbiBhbHNvIGJlIGV4dGVuZGVkIGFub255bW91c2x5XG4vL1xuLy8gICAgIEhvb2RpZS5leHRlbmQoZnVuY2lvbihob29kaWUpIHsgaG9vZGllLm15TWFnaWMgPSBmdW5jdGlvbigpIHt9IH0pXG4vL1xudmFyIGV4dGVuc2lvbnMgPSBbXTtcblxuSG9vZGllLmV4dGVuZCA9IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICBleHRlbnNpb25zLnB1c2goZXh0ZW5zaW9uKTtcbn07XG5cbi8vXG5mdW5jdGlvbiBhcHBseUV4dGVuc2lvbnMoaG9vZGllKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXh0ZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGV4dGVuc2lvbnNbaV0oaG9vZGllKTtcbiAgfVxufVxuXG4iLCJcbi8vIEhvb2RpZS5BY2NvdW50XG4vLyA9PT09PT09PT09PT09PT09XG5cbi8vXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcbnZhciB1dWlkID0gcmVxdWlyZSgnLi91dGlscy91dWlkJyk7XG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbnZhciByZW1vdGUgPSByZXF1aXJlKCcuL3JlbW90ZV9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gcHVibGljIEFQSVxuICB2YXIgYWNjb3VudCA9IHt9O1xuXG4gIC8vIGZsYWcgd2hldGhlciB1c2VyIGlzIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIG9yIG5vdFxuICB2YXIgYXV0aGVudGljYXRlZDtcblxuICAvLyBjYWNoZSBmb3IgQ291Y2hEQiBfdXNlcnMgZG9jXG4gIHZhciB1c2VyRG9jID0ge307XG5cbiAgLy8gbWFwIG9mIHJlcXVlc3RQcm9taXNlcy4gV2UgbWFpbnRhaW4gdGhpcyBsaXN0IHRvIGF2b2lkIHNlbmRpbmdcbiAgLy8gdGhlIHNhbWUgcmVxdWVzdHMgc2V2ZXJhbCB0aW1lcy5cbiAgdmFyIHJlcXVlc3RzID0ge307XG5cbiAgLy8gZGVmYXVsdCBjb3VjaERCIHVzZXIgZG9jIHByZWZpeFxuICB2YXIgdXNlckRvY1ByZWZpeCA9ICdvcmcuY291Y2hkYi51c2VyJztcblxuICAvLyBhZGQgZXZlbnRzIEFQSVxuICBldmVudHMoe1xuICAgIGNvbnRleHQ6IGFjY291bnQsXG4gICAgbmFtZXNwYWNlOiAnYWNjb3VudCdcbiAgfSk7XG5cbiAgLy8gQXV0aGVudGljYXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVXNlIHRoaXMgbWV0aG9kIHRvIGFzc3VyZSB0aGF0IHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQ6XG4gIC8vIGBob29kaWUuYWNjb3VudC5hdXRoZW50aWNhdGUoKS5kb25lKCBkb1NvbWV0aGluZyApLmZhaWwoIGhhbmRsZUVycm9yIClgXG4gIC8vXG4gIGFjY291bnQuYXV0aGVudGljYXRlID0gZnVuY3Rpb24gYXV0aGVudGljYXRlKCkge1xuICAgIHZhciBzZW5kQW5kSGFuZGxlQXV0aFJlcXVlc3Q7XG5cbiAgICAvLyBhbHJlYWR5IHRyaWVkIHRvIGF1dGhlbnRpY2F0ZSwgYW5kIGZhaWxlZFxuICAgIGlmIChhdXRoZW50aWNhdGVkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdCgpO1xuICAgIH1cblxuICAgIC8vIGFscmVhZHkgdHJpZWQgdG8gYXV0aGVudGljYXRlLCBhbmQgc3VjY2VlZGVkXG4gICAgaWYgKGF1dGhlbnRpY2F0ZWQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZXNvbHZlV2l0aChhY2NvdW50LnVzZXJuYW1lKTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgc2lnbk91dCByZXF1ZXN0LCByZXR1cm4gaXRzIHByb21pc2UsXG4gICAgLy8gYnV0IHBpcGUgaXQgc28gdGhhdCBpdCBhbHdheXMgZW5kcyB1cCByZWplY3RlZFxuICAgIC8vXG4gICAgaWYgKHJlcXVlc3RzLnNpZ25PdXQgJiYgcmVxdWVzdHMuc2lnbk91dC5zdGF0ZSgpID09PSAncGVuZGluZycpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0cy5zaWduT3V0LnRoZW4ocHJvbWlzZXMucmVqZWN0V2l0aCk7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBwZW5kaW5nIHNpZ25JbiByZXF1ZXN0LCByZXR1cm4gaXRzIHByb21pc2VcbiAgICAvL1xuICAgIGlmIChyZXF1ZXN0cy5zaWduSW4gJiYgcmVxdWVzdHMuc2lnbkluLnN0YXRlKCkgPT09ICdwZW5kaW5nJykge1xuICAgICAgcmV0dXJuIHJlcXVlc3RzLnNpZ25JbjtcbiAgICB9XG5cbiAgICAvLyBpZiB1c2VybmFtZSBpcyBub3Qgc2V0LCBtYWtlIHN1cmUgdG8gZW5kIHRoZSBzZXNzaW9uXG4gICAgaWYgKGFjY291bnQudXNlcm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHNlbmRTaWduT3V0UmVxdWVzdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2VuZCByZXF1ZXN0IHRvIGNoZWNrIGZvciBzZXNzaW9uIHN0YXR1cy4gSWYgdGhlcmUgaXMgYVxuICAgIC8vIHBlbmRpbmcgcmVxdWVzdCBhbHJlYWR5LCByZXR1cm4gaXRzIHByb21pc2UuXG4gICAgLy9cbiAgICBzZW5kQW5kSGFuZGxlQXV0aFJlcXVlc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LnJlcXVlc3QoJ0dFVCcsICcvX3Nlc3Npb24nKS50aGVuKFxuICAgICAgICBoYW5kbGVBdXRoZW50aWNhdGVSZXF1ZXN0U3VjY2VzcyxcbiAgICAgICAgaGFuZGxlUmVxdWVzdEVycm9yXG4gICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gd2l0aFNpbmdsZVJlcXVlc3QoJ2F1dGhlbnRpY2F0ZScsIHNlbmRBbmRIYW5kbGVBdXRoUmVxdWVzdCk7XG4gIH07XG5cblxuICAvLyBzaWduIHVwIHdpdGggdXNlcm5hbWUgJiBwYXNzd29yZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gdXNlcyBzdGFuZGFyZCBDb3VjaERCIEFQSSB0byBjcmVhdGUgYSBuZXcgZG9jdW1lbnQgaW4gX3VzZXJzIGRiLlxuICAvLyBUaGUgYmFja2VuZCB3aWxsIGF1dG9tYXRpY2FsbHkgY3JlYXRlIGEgdXNlckRCIGJhc2VkIG9uIHRoZSB1c2VybmFtZVxuICAvLyBhZGRyZXNzIGFuZCBhcHByb3ZlIHRoZSBhY2NvdW50IGJ5IGFkZGluZyBhICdjb25maXJtZWQnIHJvbGUgdG8gdGhlXG4gIC8vIHVzZXIgZG9jLiBUaGUgYWNjb3VudCBjb25maXJtYXRpb24gbWlnaHQgdGFrZSBhIHdoaWxlLCBzbyB3ZSBrZWVwIHRyeWluZ1xuICAvLyB0byBzaWduIGluIHdpdGggYSAzMDBtcyB0aW1lb3V0LlxuICAvL1xuICBhY2NvdW50LnNpZ25VcCA9IGZ1bmN0aW9uIHNpZ25VcCh1c2VybmFtZSwgcGFzc3dvcmQpIHtcblxuICAgIGlmIChwYXNzd29yZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXNzd29yZCA9ICcnO1xuICAgIH1cblxuICAgIGlmICghdXNlcm5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKHtcbiAgICAgICAgZXJyb3I6ICd1c2VybmFtZSBtdXN0IGJlIHNldCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChhY2NvdW50Lmhhc0Fub255bW91c0FjY291bnQoKSkge1xuICAgICAgcmV0dXJuIHVwZ3JhZGVBbm9ueW1vdXNBY2NvdW50KHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgaWYgKGFjY291bnQuaGFzQWNjb3VudCgpKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVqZWN0V2l0aCh7XG4gICAgICAgIGVycm9yOiAneW91IGhhdmUgdG8gc2lnbiBvdXQgZmlyc3QnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBkb3duY2FzZSB1c2VybmFtZVxuICAgIHVzZXJuYW1lID0gdXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBfaWQ6IHVzZXJEb2NLZXkodXNlcm5hbWUpLFxuICAgICAgICBuYW1lOiB1c2VyVHlwZUFuZElkKHVzZXJuYW1lKSxcbiAgICAgICAgdHlwZTogJ3VzZXInLFxuICAgICAgICByb2xlczogW10sXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgb3duZXJIYXNoOiBhY2NvdW50Lm93bmVySGFzaCxcbiAgICAgICAgZGF0YWJhc2U6IGFjY291bnQuZGIoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBub3coKSxcbiAgICAgICAgY3JlYXRlZEF0OiBub3coKSxcbiAgICAgICAgc2lnbmVkVXBBdDogdXNlcm5hbWUgIT09IGFjY291bnQub3duZXJIYXNoID8gbm93KCkgOiB2b2lkIDBcbiAgICAgIH0pLFxuICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH07XG5cbiAgICByZXR1cm4gYWNjb3VudC5yZXF1ZXN0KCdQVVQnLCB1c2VyRG9jVXJsKHVzZXJuYW1lKSwgb3B0aW9ucykudGhlbihcbiAgICAgIGhhbmRsZVNpZ25VcFN1Y2Nlcyh1c2VybmFtZSwgcGFzc3dvcmQpLFxuICAgICAgaGFuZGxlUmVxdWVzdEVycm9yXG4gICAgKTtcbiAgfTtcblxuXG4gIC8vIGFub255bW91cyBzaWduIHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJZiB0aGUgdXNlciBkaWQgbm90IHNpZ24gdXAgaGltc2VsZiB5ZXQsIGJ1dCBkYXRhIG5lZWRzIHRvIGJlIHRyYW5zZmVyZWRcbiAgLy8gdG8gdGhlIGNvdWNoLCBlLmcuIHRvIHNlbmQgYW4gZW1haWwgb3IgdG8gc2hhcmUgZGF0YSwgdGhlIGFub255bW91c1NpZ25VcFxuICAvLyBtZXRob2QgY2FuIGJlIHVzZWQuIEl0IGdlbmVyYXRlcyBhIHJhbmRvbSBwYXNzd29yZCBhbmQgc3RvcmVzIGl0IGxvY2FsbHlcbiAgLy8gaW4gdGhlIGJyb3dzZXIuXG4gIC8vXG4gIC8vIElmIHRoZSB1c2VyIHNpZ25lcyB1cCBmb3IgcmVhbCBsYXRlciwgd2UgJ3VwZ3JhZGUnIGhpcyBhY2NvdW50LCBtZWFuaW5nIHdlXG4gIC8vIGNoYW5nZSBoaXMgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGludGVybmFsbHkgaW5zdGVhZCBvZiBjcmVhdGluZyBhbm90aGVyIHVzZXIuXG4gIC8vXG4gIGFjY291bnQuYW5vbnltb3VzU2lnblVwID0gZnVuY3Rpb24gYW5vbnltb3VzU2lnblVwKCkge1xuICAgIHZhciBwYXNzd29yZCA9IHV1aWQoMTApO1xuICAgIHZhciB1c2VybmFtZSA9IGFjY291bnQub3duZXJIYXNoO1xuXG4gICAgcmV0dXJuIGFjY291bnQuc2lnblVwKHVzZXJuYW1lLCBwYXNzd29yZCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgIHNldEFub255bW91c1Bhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICAgIHJldHVybiBhY2NvdW50LnRyaWdnZXIoJ3NpZ251cDphbm9ueW1vdXMnLCB1c2VybmFtZSk7XG4gICAgfSk7XG4gIH07XG5cblxuICAvLyBoYXNBY2NvdW50XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGFjY291bnQuaGFzQWNjb3VudCA9IGZ1bmN0aW9uIGhhc0FjY291bnQoKSB7XG4gICAgcmV0dXJuICEhYWNjb3VudC51c2VybmFtZTtcbiAgfTtcblxuXG4gIC8vIGhhc0Fub255bW91c0FjY291bnRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgYWNjb3VudC5oYXNBbm9ueW1vdXNBY2NvdW50ID0gZnVuY3Rpb24gaGFzQW5vbnltb3VzQWNjb3VudCgpIHtcbiAgICByZXR1cm4gZ2V0QW5vbnltb3VzUGFzc3dvcmQoKSAhPT0gdW5kZWZpbmVkO1xuICB9O1xuXG5cbiAgLy8gc2V0IC8gZ2V0IC8gcmVtb3ZlIGFub255bW91cyBwYXNzd29yZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1xuICB2YXIgYW5vbnltb3VzUGFzc3dvcmRLZXkgPSAnX2FjY291bnQuYW5vbnltb3VzUGFzc3dvcmQnO1xuXG4gIGZ1bmN0aW9uIHNldEFub255bW91c1Bhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5zZXQoYW5vbnltb3VzUGFzc3dvcmRLZXksIHBhc3N3b3JkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFub255bW91c1Bhc3N3b3JkKCkge1xuICAgIHJldHVybiBjb25maWcuZ2V0KGFub255bW91c1Bhc3N3b3JkS2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUFub255bW91c1Bhc3N3b3JkKCkge1xuICAgIHJldHVybiBjb25maWcudW5zZXQoYW5vbnltb3VzUGFzc3dvcmRLZXkpO1xuICB9XG5cblxuICAvLyBzaWduIGluIHdpdGggdXNlcm5hbWUgJiBwYXNzd29yZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gdXNlcyBzdGFuZGFyZCBDb3VjaERCIEFQSSB0byBjcmVhdGUgYSBuZXcgdXNlciBzZXNzaW9uIChQT1NUIC9fc2Vzc2lvbikuXG4gIC8vIEJlc2lkZXMgdGhlIHN0YW5kYXJkIHNpZ24gaW4gd2UgYWxzbyBjaGVjayBpZiB0aGUgYWNjb3VudCBoYXMgYmVlbiBjb25maXJtZWRcbiAgLy8gKHJvbGVzIGluY2x1ZGUgJ2NvbmZpcm1lZCcgcm9sZSkuXG4gIC8vXG4gIC8vIE5PVEU6IFdoZW4gc2lnbmluZyBpbiwgYWxsIGxvY2FsIGRhdGEgZ2V0cyBjbGVhcmVkIGJlZm9yZWhhbmQgKHdpdGggYSBzaWduT3V0KS5cbiAgLy8gICAgICAgT3RoZXJ3aXNlIGRhdGEgdGhhdCBoYXMgYmVlbiBjcmVhdGVkIGJlZm9yZWhhbmQgKGF1dGhlbnRpY2F0ZWQgd2l0aFxuICAvLyAgICAgICBhbm90aGVyIHVzZXIgYWNjb3VudCBvciBhbm9ueW1vdXNseSkgd291bGQgYmUgbWVyZ2VkIGludG8gdGhlIHVzZXJcbiAgLy8gICAgICAgYWNjb3VudCB0aGF0IHNpZ25zIGluLiBUaGF0IGFwcGxpZXMgb25seSBpZiB1c2VybmFtZSBpc24ndCB0aGUgc2FtZSBhc1xuICAvLyAgICAgICBjdXJyZW50IHVzZXJuYW1lLlxuICAvL1xuICBhY2NvdW50LnNpZ25JbiA9IGZ1bmN0aW9uIHNpZ25Jbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcblxuICAgIGlmICh1c2VybmFtZSA9PT0gbnVsbCkge1xuICAgICAgdXNlcm5hbWUgPSAnJztcbiAgICB9XG5cbiAgICBpZiAocGFzc3dvcmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFzc3dvcmQgPSAnJztcbiAgICB9XG5cbiAgICAvLyBkb3duY2FzZVxuICAgIHVzZXJuYW1lID0gdXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIGlmICh1c2VybmFtZSAhPT0gYWNjb3VudC51c2VybmFtZSkge1xuICAgICAgcmV0dXJuIGFjY291bnQuc2lnbk91dCh7XG4gICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbmRTaWduSW5SZXF1ZXN0KHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbmRTaWduSW5SZXF1ZXN0KHVzZXJuYW1lLCBwYXNzd29yZCwge1xuICAgICAgICByZWF1dGhlbnRpY2F0ZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuXG4gIC8vIHNpZ24gb3V0XG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIHVzZXMgc3RhbmRhcmQgQ291Y2hEQiBBUEkgdG8gaW52YWxpZGF0ZSBhIHVzZXIgc2Vzc2lvbiAoREVMRVRFIC9fc2Vzc2lvbilcbiAgLy9cbiAgYWNjb3VudC5zaWduT3V0ID0gZnVuY3Rpb24gc2lnbk91dChvcHRpb25zKSB7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIGlmICghYWNjb3VudC5oYXNBY2NvdW50KCkpIHtcbiAgICAgIHJldHVybiBjbGVhbnVwKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIHJldHVybiBhY2NvdW50LnRyaWdnZXIoJ3NpZ25vdXQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW90ZS5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHNlbmRTaWduT3V0UmVxdWVzdCgpLnRoZW4oY2xlYW51cEFuZFRyaWdnZXJTaWduT3V0KTtcbiAgfTtcblxuXG4gIC8vIFJlcXVlc3RcbiAgLy8gLS0tXG5cbiAgLy8gc2hvcnRjdXQgZm9yIGBob29kaWUucmVxdWVzdGBcbiAgLy9cbiAgYWNjb3VudC5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdCh0eXBlLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIHJlcXVlc3QuYXBwbHkoYXJndW1lbnRzKTtcbiAgfTtcblxuXG4gIC8vIGRiXG4gIC8vIC0tLS1cblxuICAvLyByZXR1cm4gbmFtZSBvZiBkYlxuICAvL1xuICBhY2NvdW50LmRiID0gZnVuY3Rpb24gZGIoKSB7XG4gICAgcmV0dXJuICd1c2VyLycgKyBhY2NvdW50Lm93bmVySGFzaDtcbiAgfTtcblxuXG4gIC8vIGZldGNoXG4gIC8vIC0tLS0tLS1cblxuICAvLyBmZXRjaGVzIF91c2VycyBkb2MgZnJvbSBDb3VjaERCIGFuZCBjYWNoZXMgaXQgaW4gX2RvY1xuICAvL1xuICBhY2NvdW50LmZldGNoID0gZnVuY3Rpb24gZmV0Y2godXNlcm5hbWUpIHtcblxuICAgIGlmICh1c2VybmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB1c2VybmFtZSA9IGFjY291bnQudXNlcm5hbWU7XG4gICAgfVxuXG4gICAgaWYgKCF1c2VybmFtZSkge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoe1xuICAgICAgICBlcnJvcjogJ3VuYXV0aGVudGljYXRlZCcsXG4gICAgICAgIHJlYXNvbjogJ25vdCBsb2dnZWQgaW4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gd2l0aFNpbmdsZVJlcXVlc3QoJ2ZldGNoJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5yZXF1ZXN0KCdHRVQnLCB1c2VyRG9jVXJsKHVzZXJuYW1lKSkudGhlbihcbiAgICAgICAgbnVsbCxcbiAgICAgICAgaGFuZGxlUmVxdWVzdEVycm9yXG4gICAgICApLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgdXNlckRvYyA9IHJlc3BvbnNlO1xuICAgICAgICByZXR1cm4gdXNlckRvYztcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG5cbiAgLy8gY2hhbmdlIHBhc3N3b3JkXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gTm90ZTogdGhlIGhvb2RpZSBBUEkgcmVxdWlyZXMgdGhlIGN1cnJlbnRQYXNzd29yZCBmb3Igc2VjdXJpdHkgcmVhc29ucyxcbiAgLy8gYnV0IGNvdWNoRGIgZG9lc24ndCByZXF1aXJlIGl0IGZvciBhIHBhc3N3b3JkIGNoYW5nZSwgc28gaXQncyBpZ25vcmVkXG4gIC8vIGluIHRoaXMgaW1wbGVtZW50YXRpb24gb2YgdGhlIGhvb2RpZSBBUEkuXG4gIC8vXG4gIGFjY291bnQuY2hhbmdlUGFzc3dvcmQgPSBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZChjdXJyZW50UGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG5cbiAgICBpZiAoIWFjY291bnQudXNlcm5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKHtcbiAgICAgICAgZXJyb3I6ICd1bmF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICByZWFzb246ICdub3QgbG9nZ2VkIGluJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3RlLmRpc2Nvbm5lY3QoKTtcblxuICAgIHJldHVybiBhY2NvdW50LmZldGNoKCkudGhlbihcbiAgICAgIHNlbmRDaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkUmVxdWVzdChjdXJyZW50UGFzc3dvcmQsIG51bGwsIG5ld1Bhc3N3b3JkKSxcbiAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICk7XG4gIH07XG5cblxuICAvLyByZXNldCBwYXNzd29yZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhpcyBpcyBraW5kIG9mIGEgaGFjay4gV2UgbmVlZCB0byBjcmVhdGUgYW4gb2JqZWN0IGFub255bW91c2x5XG4gIC8vIHRoYXQgaXMgbm90IGV4cG9zZWQgdG8gb3RoZXJzLiBUaGUgb25seSBDb3VjaERCIEFQSSBvdGhlcmluZyBzdWNoXG4gIC8vIGZ1bmN0aW9uYWxpdHkgaXMgdGhlIF91c2VycyBkYXRhYmFzZS5cbiAgLy9cbiAgLy8gU28gd2UgYWN0dWFseSBzaWduIHVwIGEgbmV3IGNvdWNoREIgdXNlciB3aXRoIHNvbWUgc3BlY2lhbCBhdHRyaWJ1dGVzLlxuICAvLyBJdCB3aWxsIGJlIHBpY2tlZCB1cCBieSB0aGUgcGFzc3dvcmQgcmVzZXQgd29ya2VyIGFuZCByZW1vdmVlZFxuICAvLyBvbmNlIHRoZSBwYXNzd29yZCB3YXMgcmVzZXR0ZWQuXG4gIC8vXG4gIGFjY291bnQucmVzZXRQYXNzd29yZCA9IGZ1bmN0aW9uIHJlc2V0UGFzc3dvcmQodXNlcm5hbWUpIHtcbiAgICB2YXIgZGF0YSwga2V5LCBvcHRpb25zLCByZXNldFBhc3N3b3JkSWQ7XG5cbiAgICByZXNldFBhc3N3b3JkSWQgPSBjb25maWcuZ2V0KCdfYWNjb3VudC5yZXNldFBhc3N3b3JkSWQnKTtcblxuICAgIGlmIChyZXNldFBhc3N3b3JkSWQpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LmNoZWNrUGFzc3dvcmRSZXNldCgpO1xuICAgIH1cblxuICAgIHJlc2V0UGFzc3dvcmRJZCA9ICcnICsgdXNlcm5hbWUgKyAnLycgKyAodXVpZCgpKTtcblxuICAgIGNvbmZpZy5zZXQoJ19hY2NvdW50LnJlc2V0UGFzc3dvcmRJZCcsIHJlc2V0UGFzc3dvcmRJZCk7XG5cbiAgICBrZXkgPSAnJyArIHVzZXJEb2NQcmVmaXggKyAnOiRwYXNzd29yZFJlc2V0LycgKyByZXNldFBhc3N3b3JkSWQ7XG5cbiAgICBkYXRhID0ge1xuICAgICAgX2lkOiBrZXksXG4gICAgICBuYW1lOiAnJHBhc3N3b3JkUmVzZXQvJyArIHJlc2V0UGFzc3dvcmRJZCxcbiAgICAgIHR5cGU6ICd1c2VyJyxcbiAgICAgIHJvbGVzOiBbXSxcbiAgICAgIHBhc3N3b3JkOiByZXNldFBhc3N3b3JkSWQsXG4gICAgICBjcmVhdGVkQXQ6IG5vdygpLFxuICAgICAgdXBkYXRlZEF0OiBub3coKVxuICAgIH07XG5cbiAgICBvcHRpb25zID0ge1xuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfTtcblxuICAgIC8vIFRPRE86IHNwZWMgdGhhdCBjaGVja1Bhc3N3b3JkUmVzZXQgZ2V0cyBleGVjdXRlZFxuICAgIHJldHVybiB3aXRoUHJldmlvdXNSZXF1ZXN0c0Fib3J0ZWQoJ3Jlc2V0UGFzc3dvcmQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LnJlcXVlc3QoJ1BVVCcsICcvX3VzZXJzLycgKyAoZW5jb2RlVVJJQ29tcG9uZW50KGtleSkpLCBvcHRpb25zKS50aGVuKFxuICAgICAgICBudWxsLCBoYW5kbGVSZXF1ZXN0RXJyb3JcbiAgICAgICkuZG9uZShhY2NvdW50LmNoZWNrUGFzc3dvcmRSZXNldCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gY2hlY2tQYXNzd29yZFJlc2V0XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGNoZWNrIGZvciB0aGUgc3RhdHVzIG9mIGEgcGFzc3dvcmQgcmVzZXQuIEl0IG1pZ2h0IHRha2VcbiAgLy8gYSB3aGlsZSB1bnRpbCB0aGUgcGFzc3dvcmQgcmVzZXQgd29ya2VyIHBpY2tzIHVwIHRoZSBqb2JcbiAgLy8gYW5kIHVwZGF0ZXMgaXRcbiAgLy9cbiAgLy8gSWYgYSBwYXNzd29yZCByZXNldCByZXF1ZXN0IHdhcyBzdWNjZXNzZnVsLCB0aGUgJHBhc3N3b3JkUmVxdWVzdFxuICAvLyBkb2MgZ2V0cyByZW1vdmVkIGZyb20gX3VzZXJzIGJ5IHRoZSB3b3JrZXIsIHRoZXJlZm9yZSBhIDQwMSBpc1xuICAvLyB3aGF0IHdlIGFyZSB3YWl0aW5nIGZvci5cbiAgLy9cbiAgLy8gT25jZSBjYWxsZWQsIGl0IGNvbnRpbnVlcyB0byByZXF1ZXN0IHRoZSBzdGF0dXMgdXBkYXRlIHdpdGggYVxuICAvLyBvbmUgc2Vjb25kIHRpbWVvdXQuXG4gIC8vXG4gIGFjY291bnQuY2hlY2tQYXNzd29yZFJlc2V0ID0gZnVuY3Rpb24gY2hlY2tQYXNzd29yZFJlc2V0KCkge1xuICAgIHZhciBoYXNoLCBvcHRpb25zLCByZXNldFBhc3N3b3JkSWQsIHVybCwgdXNlcm5hbWU7XG5cbiAgICAvLyByZWplY3QgaWYgdGhlcmUgaXMgbm8gcGVuZGluZyBwYXNzd29yZCByZXNldCByZXF1ZXN0XG4gICAgcmVzZXRQYXNzd29yZElkID0gY29uZmlnLmdldCgnX2FjY291bnQucmVzZXRQYXNzd29yZElkJyk7XG5cbiAgICBpZiAoIXJlc2V0UGFzc3dvcmRJZCkge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoe1xuICAgICAgICBlcnJvcjogJ21pc3NpbmcnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBzZW5kIHJlcXVlc3QgdG8gY2hlY2sgc3RhdHVzIG9mIHBhc3N3b3JkIHJlc2V0XG4gICAgdXNlcm5hbWUgPSAnJHBhc3N3b3JkUmVzZXQvJyArIHJlc2V0UGFzc3dvcmRJZDtcbiAgICB1cmwgPSAnL191c2Vycy8nICsgKGVuY29kZVVSSUNvbXBvbmVudCh1c2VyRG9jUHJlZml4ICsgJzonICsgdXNlcm5hbWUpKTtcbiAgICBoYXNoID0gYnRvYSh1c2VybmFtZSArICc6JyArIHJlc2V0UGFzc3dvcmRJZCk7XG5cbiAgICBvcHRpb25zID0ge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiAnQmFzaWMgJyArIGhhc2hcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHdpdGhQcmV2aW91c1JlcXVlc3RzQWJvcnRlZCgncGFzc3dvcmRSZXNldFN0YXR1cycsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFjY291bnQucmVxdWVzdCgnR0VUJywgdXJsLCBvcHRpb25zKS50aGVuKFxuICAgICAgICBoYW5kbGVQYXNzd29yZFJlc2V0U3RhdHVzUmVxdWVzdFN1Y2Nlc3MsXG4gICAgICAgIGhhbmRsZVBhc3N3b3JkUmVzZXRTdGF0dXNSZXF1ZXN0RXJyb3JcbiAgICAgICkuZmFpbChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuZXJyb3IgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFjY291bnQuY2hlY2tQYXNzd29yZFJlc2V0LCAxMDAwKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY291bnQudHJpZ2dlcigncGFzc3dvcmRfcmVzZXQ6ZXJyb3InKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG5cbiAgLy8gY2hhbmdlIHVzZXJuYW1lXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gTm90ZTogdGhlIGhvb2RpZSBBUEkgcmVxdWlyZXMgdGhlIGN1cnJlbnQgcGFzc3dvcmQgZm9yIHNlY3VyaXR5IHJlYXNvbnMsXG4gIC8vIGJ1dCB0ZWNobmljYWxseSB3ZSBjYW5ub3QgKHlldCkgcHJldmVudCB0aGUgdXNlciB0byBjaGFuZ2UgdGhlIHVzZXJuYW1lXG4gIC8vIHdpdGhvdXQga25vd2luZyB0aGUgY3VycmVudCBwYXNzd29yZCwgc28gaXQncyBub3QgaW1wdWxlbWVudGVkIGluIHRoZSBjdXJyZW50XG4gIC8vIGltcGxlbWVudGF0aW9uIG9mIHRoZSBob29kaWUgQVBJLlxuICAvL1xuICAvLyBCdXQgdGhlIGN1cnJlbnQgcGFzc3dvcmQgaXMgbmVlZGVkIHRvIGxvZ2luIHdpdGggdGhlIG5ldyB1c2VybmFtZS5cbiAgLy9cbiAgYWNjb3VudC5jaGFuZ2VVc2VybmFtZSA9IGZ1bmN0aW9uIGNoYW5nZVVzZXJuYW1lKGN1cnJlbnRQYXNzd29yZCwgbmV3VXNlcm5hbWUpIHtcbiAgICBuZXdVc2VybmFtZSA9IG5ld1VzZXJuYW1lIHx8ICcnO1xuICAgIHJldHVybiBjaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkKGN1cnJlbnRQYXNzd29yZCwgbmV3VXNlcm5hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH07XG5cblxuICAvLyBkZXN0cm95XG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIGRlc3Ryb3lzIGEgdXNlcidzIGFjY291bnRcbiAgLy9cbiAgYWNjb3VudC5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICBpZiAoIWFjY291bnQuaGFzQWNjb3VudCgpKSB7XG4gICAgICByZXR1cm4gY2xlYW51cEFuZFRyaWdnZXJTaWduT3V0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY291bnQuZmV0Y2goKS50aGVuKFxuICAgICAgaGFuZGxlRmV0Y2hCZWZvcmVEZXN0cm95U3VjY2VzcyxcbiAgICAgIGhhbmRsZUZldGNoQmVmb3JlRGVzdHJveUVycm9yXG4gICAgKS50aGVuKGNsZWFudXBBbmRUcmlnZ2VyU2lnbk91dCk7XG4gIH07XG5cblxuICAvLyBQUklWQVRFXG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIHNldHRlcnNcbiAgZnVuY3Rpb24gc2V0VXNlcm5hbWUobmV3VXNlcm5hbWUpIHtcbiAgICBpZiAoYWNjb3VudC51c2VybmFtZSA9PT0gbmV3VXNlcm5hbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY2NvdW50LnVzZXJuYW1lID0gbmV3VXNlcm5hbWU7XG5cbiAgICByZXR1cm4gY29uZmlnLnNldCgnX2FjY291bnQudXNlcm5hbWUnLCBuZXdVc2VybmFtZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRPd25lcihuZXdPd25lckhhc2gpIHtcblxuICAgIGlmIChhY2NvdW50Lm93bmVySGFzaCA9PT0gbmV3T3duZXJIYXNoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWNjb3VudC5vd25lckhhc2ggPSBuZXdPd25lckhhc2g7XG5cbiAgICAvLyBgb3duZXJIYXNoYCBpcyBzdG9yZWQgd2l0aCBldmVyeSBuZXcgb2JqZWN0IGluIHRoZSBjcmVhdGVkQnlcbiAgICAvLyBhdHRyaWJ1dGUuIEl0IGRvZXMgbm90IGdldCBjaGFuZ2VkIG9uY2UgaXQncyBzZXQuIFRoYXQncyB3aHlcbiAgICAvLyB3ZSBoYXZlIHRvIGZvcmNlIGl0IHRvIGJlIGNoYW5nZSBmb3IgdGhlIGAkY29uZmlnL2hvb2RpZWAgb2JqZWN0LlxuICAgIGNvbmZpZy5zZXQoJ2NyZWF0ZWRCeScsIG5ld093bmVySGFzaCk7XG5cbiAgICByZXR1cm4gY29uZmlnLnNldCgnX2FjY291bnQub3duZXJIYXNoJywgbmV3T3duZXJIYXNoKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gaGFuZGxlIGEgc3VjY2Vzc2Z1bCBhdXRoZW50aWNhdGlvbiByZXF1ZXN0LlxuICAvL1xuICAvLyBBcyBsb25nIGFzIHRoZXJlIGlzIG5vIHNlcnZlciBlcnJvciBvciBpbnRlcm5ldCBjb25uZWN0aW9uIGlzc3VlLFxuICAvLyB0aGUgYXV0aGVudGljYXRlIHJlcXVlc3QgKEdFVCAvX3Nlc3Npb24pIGRvZXMgYWx3YXlzIHJldHVyblxuICAvLyBhIDIwMCBzdGF0dXMuIFRvIGRpZmZlcmVudGlhdGUgd2hldGhlciB0aGUgdXNlciBpcyBzaWduZWQgaW4gb3JcbiAgLy8gbm90LCB3ZSBjaGVjayBgdXNlckN0eC5uYW1lYCBpbiB0aGUgcmVzcG9uc2UuIElmIHRoZSB1c2VyIGlzIG5vdFxuICAvLyBzaWduZWQgaW4sIGl0J3MgbnVsbCwgb3RoZXJ3aXNlIHRoZSBuYW1lIHRoZSB1c2VyIHNpZ25lZCBpbiB3aXRoXG4gIC8vXG4gIC8vIElmIHRoZSB1c2VyIGlzIG5vdCBzaWduZWQgaW4sIHdlIGRpZmVlcmVudGlhdGUgYmV0d2VlbiB1c2VycyB0aGF0XG4gIC8vIHNpZ25lZCBpbiB3aXRoIGEgdXNlcm5hbWUgLyBwYXNzd29yZCBvciBhbm9ueW1vdXNseS4gRm9yIGFub255bW91c1xuICAvLyB1c2VycywgdGhlIHBhc3N3b3JkIGlzIHN0b3JlZCBpbiBsb2NhbCBzdG9yZSwgc28gd2UgZG9uJ3QgbmVlZFxuICAvLyB0byB0cmlnZ2VyIGFuICd1bmF1dGhlbnRpY2F0ZWQnIGVycm9yLCBidXQgaW5zdGVhZCB0cnkgdG8gc2lnbiBpbi5cbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlQXV0aGVudGljYXRlUmVxdWVzdFN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UudXNlckN0eC5uYW1lKSB7XG4gICAgICBhdXRoZW50aWNhdGVkID0gdHJ1ZTtcbiAgICAgIHNldFVzZXJuYW1lKHJlc3BvbnNlLnVzZXJDdHgubmFtZS5yZXBsYWNlKC9edXNlcihfYW5vbnltb3VzKT9cXC8vLCAnJykpO1xuICAgICAgc2V0T3duZXIocmVzcG9uc2UudXNlckN0eC5yb2xlc1swXSk7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZVdpdGgoYWNjb3VudC51c2VybmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKGFjY291bnQuaGFzQW5vbnltb3VzQWNjb3VudCgpKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5zaWduSW4oYWNjb3VudC51c2VybmFtZSwgZ2V0QW5vbnltb3VzUGFzc3dvcmQoKSk7XG4gICAgfVxuXG4gICAgYXV0aGVudGljYXRlZCA9IGZhbHNlO1xuICAgIGFjY291bnQudHJpZ2dlcignZXJyb3I6dW5hdXRoZW50aWNhdGVkJyk7XG4gICAgcmV0dXJuIHByb21pc2VzLnJlamVjdCgpO1xuICB9XG5cblxuICAvL1xuICAvLyBzdGFuZGFyZCBlcnJvciBoYW5kbGluZyBmb3IgQUpBWCByZXF1ZXN0c1xuICAvL1xuICAvLyBpbiBzb21lIGNhc2Ugd2UgZ2V0IHRoZSBvYmplY3QgZXJyb3IgZGlyZWN0bHksXG4gIC8vIGluIG90aGVycyB3ZSBnZXQgYW4geGhyIG9yIGV2ZW4ganVzdCBhIHN0cmluZyBiYWNrXG4gIC8vIHdoZW4gdGhlIGNvdWNoIGRpZWQgZW50aXJlbHkuIFdoZSBoYXZlIHRvIGhhbmRsZVxuICAvLyBlYWNoIGNhc2VcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdEVycm9yKGVycm9yKSB7XG4gICAgdmFyIGU7XG5cbiAgICBlcnJvciA9IGVycm9yIHx8IHt9O1xuXG4gICAgaWYgKGVycm9yLnJlYXNvbikge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoZXJyb3IpO1xuICAgIH1cblxuICAgIHZhciB4aHIgPSBlcnJvcjtcblxuICAgIHRyeSB7XG4gICAgICBlcnJvciA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlID0gX2Vycm9yO1xuICAgICAgZXJyb3IgPSB7XG4gICAgICAgIGVycm9yOiB4aHIucmVzcG9uc2VUZXh0IHx8ICd1bmtub3duJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZXMucmVqZWN0V2l0aChlcnJvcik7XG4gIH1cblxuXG4gIC8vXG4gIC8vIGhhbmRsZSByZXNwb25zZSBvZiBhIHN1Y2Nlc3NmdWwgc2lnblVwIHJlcXVlc3QuXG4gIC8vIFJlc3BvbnNlIGxvb2tzIGxpa2U6XG4gIC8vXG4gIC8vICAgICB7XG4gIC8vICAgICAgICAgJ29rJzogdHJ1ZSxcbiAgLy8gICAgICAgICAnaWQnOiAnb3JnLmNvdWNoZGIudXNlcjpqb2UnLFxuICAvLyAgICAgICAgICdyZXYnOiAnMS1lODc0N2Q5YWU5Nzc2NzA2ZGE5MjgxMGIxYmFhNDI0OCdcbiAgLy8gICAgIH1cbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlU2lnblVwU3VjY2VzKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBhY2NvdW50LnRyaWdnZXIoJ3NpZ251cCcsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXJEb2MuX3JldiA9IHJlc3BvbnNlLnJldjtcbiAgICAgIHJldHVybiBkZWxheWVkU2lnbkluKHVzZXJuYW1lLCBwYXNzd29yZCk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gYSBkZWxheWVkIHNpZ24gaW4gaXMgdXNlZCBhZnRlciBzaWduIHVwIGFuZCBhZnRlciBhXG4gIC8vIHVzZXJuYW1lIGNoYW5nZS5cbiAgLy9cbiAgZnVuY3Rpb24gZGVsYXllZFNpZ25Jbih1c2VybmFtZSwgcGFzc3dvcmQsIG9wdGlvbnMsIGRlZmVyKSB7XG5cbiAgICAvLyBkZWxheWVkU2lnbkluIG1pZ2h0IGNhbGwgaXRzZWxmLCB3aGVuIHRoZSB1c2VyIGFjY291bnRcbiAgICAvLyBpcyBwZW5kaW5nLiBJbiB0aGlzIGNhc2UgaXQgcGFzc2VzIHRoZSBvcmlnaW5hbCBkZWZlcixcbiAgICAvLyB0byBrZWVwIGEgcmVmZXJlbmNlIGFuZCBmaW5hbGx5IHJlc29sdmUgLyByZWplY3QgaXRcbiAgICAvLyBhdCBzb21lIHBvaW50XG4gICAgaWYgKCFkZWZlcikge1xuICAgICAgZGVmZXIgPSBwcm9taXNlcy5kZWZlcigpO1xuICAgIH1cblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2UgPSBzZW5kU2lnbkluUmVxdWVzdCh1c2VybmFtZSwgcGFzc3dvcmQpO1xuICAgICAgcHJvbWlzZS5kb25lKGRlZmVyLnJlc29sdmUpO1xuICAgICAgcHJvbWlzZS5mYWlsKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvci5lcnJvciA9PT0gJ3VuY29uZmlybWVkJykge1xuXG4gICAgICAgICAgLy8gSXQgbWlnaHQgdGFrZSBhIGJpdCB1bnRpbCB0aGUgYWNjb3VudCBoYXMgYmVlbiBjb25maXJtZWRcbiAgICAgICAgICBkZWxheWVkU2lnbkluKHVzZXJuYW1lLCBwYXNzd29yZCwgb3B0aW9ucywgZGVmZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVyLnJlamVjdC5hcHBseShkZWZlciwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9LCAzMDApO1xuXG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gcGFyc2UgYSBzdWNjZXNzZnVsIHNpZ24gaW4gcmVzcG9uc2UgZnJvbSBjb3VjaERCLlxuICAvLyBSZXNwb25zZSBsb29rcyBsaWtlOlxuICAvL1xuICAvLyAgICAge1xuICAvLyAgICAgICAgICdvayc6IHRydWUsXG4gIC8vICAgICAgICAgJ25hbWUnOiAndGVzdDEnLFxuICAvLyAgICAgICAgICdyb2xlcyc6IFtcbiAgLy8gICAgICAgICAgICAgJ212dTg1aHknLFxuICAvLyAgICAgICAgICAgICAnY29uZmlybWVkJ1xuICAvLyAgICAgICAgIF1cbiAgLy8gICAgIH1cbiAgLy9cbiAgLy8gd2Ugd2FudCB0byB0dXJuIGl0IGludG8gJ3Rlc3QxJywgJ212dTg1aHknIG9yIHJlamVjdCB0aGUgcHJvbWlzZVxuICAvLyBpbiBjYXNlIGFuIGVycm9yIG9jY3VyZWQgKCdyb2xlcycgYXJyYXkgY29udGFpbnMgJ2Vycm9yJylcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlU2lnbkluU3VjY2VzcyhvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHZhciBkZWZlciwgdXNlcm5hbWU7XG5cbiAgICAgIGRlZmVyID0gcHJvbWlzZXMuZGVmZXIoKTtcbiAgICAgIHVzZXJuYW1lID0gcmVzcG9uc2UubmFtZS5yZXBsYWNlKC9edXNlcihfYW5vbnltb3VzKT9cXC8vLCAnJyk7XG5cbiAgICAgIC8vXG4gICAgICAvLyBpZiBhbiBlcnJvciBvY2N1cmVkLCB0aGUgdXNlckRCIHdvcmtlciBzdG9yZXMgaXQgdG8gdGhlICRlcnJvciBhdHRyaWJ1dGVcbiAgICAgIC8vIGFuZCBhZGRzIHRoZSAnZXJyb3InIHJvbGUgdG8gdGhlIHVzZXJzIGRvYyBvYmplY3QuIElmIHRoZSB1c2VyIGhhcyB0aGVcbiAgICAgIC8vICdlcnJvcicgcm9sZSwgd2UgbmVlZCB0byBmZXRjaCBoaXMgX3VzZXJzIGRvYyB0byBmaW5kIG91dCB3aGF0IHRoZSBlcnJvclxuICAgICAgLy8gaXMsIGJlZm9yZSB3ZSBjYW4gcmVqZWN0IHRoZSBwcm9taXNlLlxuICAgICAgLy9cbiAgICAgIGlmIChyZXNwb25zZS5yb2xlcy5pbmRleE9mKCdlcnJvcicpICE9PSAtMSkge1xuICAgICAgICBhY2NvdW50LmZldGNoKHVzZXJuYW1lKS5mYWlsKGRlZmVyLnJlamVjdCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXIucmVqZWN0KHtcbiAgICAgICAgICAgIGVycm9yOiAnZXJyb3InLFxuICAgICAgICAgICAgcmVhc29uOiB1c2VyRG9jLiRlcnJvclxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgIH1cblxuICAgICAgLy9cbiAgICAgIC8vIFdoZW4gdGhlIHVzZXJEQiB3b3JrZXIgY3JlYXRlZCB0aGUgZGF0YWJhc2UgZm9yIHRoZSB1c2VyIGFuZCBldmVydGhpbmdcbiAgICAgIC8vIHdvcmtlZCBvdXQsIGl0IGFkZHMgdGhlIHJvbGUgJ2NvbmZpcm1lZCcgdG8gdGhlIHVzZXIuIElmIHRoZSByb2xlIGlzXG4gICAgICAvLyBub3QgcHJlc2VudCB5ZXQsIGl0IG1pZ2h0IGJlIHRoYXQgdGhlIHdvcmtlciBkaWRuJ3QgcGljayB1cCB0aGUgdGhlXG4gICAgICAvLyB1c2VyIGRvYyB5ZXQsIG9yIHRoZXJlIHdhcyBhbiBlcnJvci4gSW4gdGhpcyBjYXNlcywgd2UgcmVqZWN0IHRoZSBwcm9taXNlXG4gICAgICAvLyB3aXRoIGFuICd1bmNvZmlybWVkIGVycm9yJ1xuICAgICAgLy9cbiAgICAgIGlmIChyZXNwb25zZS5yb2xlcy5pbmRleE9mKCdjb25maXJtZWQnKSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVyLnJlamVjdCh7XG4gICAgICAgICAgZXJyb3I6ICd1bmNvbmZpcm1lZCcsXG4gICAgICAgICAgcmVhc29uOiAnYWNjb3VudCBoYXMgbm90IGJlZW4gY29uZmlybWVkIHlldCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNldFVzZXJuYW1lKHVzZXJuYW1lKTtcbiAgICAgIHNldE93bmVyKHJlc3BvbnNlLnJvbGVzWzBdKTtcbiAgICAgIGF1dGhlbnRpY2F0ZWQgPSB0cnVlO1xuXG4gICAgICAvL1xuICAgICAgLy8gb3B0aW9ucy52ZXJib3NlIGlzIHRydWUsIHdoZW4gYSB1c2VyIG1hbnVhbGx5IHNpZ25lZCB2aWEgaG9vZGllLmFjY291bnQuc2lnbkluKCkuXG4gICAgICAvLyBXZSBuZWVkIHRvIGRpZmZlcmVudGlhdGUgdG8gb3RoZXIgc2lnbkluIHJlcXVlc3RzLCBmb3IgZXhhbXBsZSByaWdodCBhZnRlclxuICAgICAgLy8gdGhlIHNpZ251cCBvciBhZnRlciBhIHNlc3Npb24gdGltZWQgb3V0LlxuICAgICAgLy9cbiAgICAgIGlmICghKG9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMucmVhdXRoZW50aWNhdGVkKSkge1xuICAgICAgICBpZiAoYWNjb3VudC5oYXNBbm9ueW1vdXNBY2NvdW50KCkpIHtcbiAgICAgICAgICBhY2NvdW50LnRyaWdnZXIoJ3NpZ25pbjphbm9ueW1vdXMnLCB1c2VybmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWNjb3VudC50cmlnZ2VyKCdzaWduaW4nLCB1c2VybmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdXNlciByZWF1dGhlbnRpY2F0ZWQsIG1lYW5pbmdcbiAgICAgIGlmIChvcHRpb25zLnJlYXV0aGVudGljYXRlZCkge1xuICAgICAgICBhY2NvdW50LnRyaWdnZXIoJ3JlYXV0aGVudGljYXRlZCcsIHVzZXJuYW1lKTtcbiAgICAgIH1cblxuICAgICAgYWNjb3VudC5mZXRjaCgpO1xuICAgICAgcmV0dXJuIGRlZmVyLnJlc29sdmUodXNlcm5hbWUsIHJlc3BvbnNlLnJvbGVzWzBdKTtcbiAgICB9O1xuICB9XG5cblxuICAvL1xuICAvLyBJZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bCB0aGVyZSBtaWdodCBoYXZlIG9jY3VyZWQgYW5cbiAgLy8gZXJyb3IsIHdoaWNoIHRoZSB3b3JrZXIgc3RvcmVkIGluIHRoZSBzcGVjaWFsICRlcnJvciBhdHRyaWJ1dGUuXG4gIC8vIElmIHRoYXQgaGFwcGVucywgd2UgcmV0dXJuIGEgcmVqZWN0ZWQgcHJvbWlzZSB3aXRoIHRoZSAkZXJyb3IsXG4gIC8vIGVycm9yLiBPdGhlcndpc2UgcmVqZWN0IHRoZSBwcm9taXNlIHdpdGggYSAncGVuZGluZycgZXJyb3IsXG4gIC8vIGFzIHdlIGFyZSBub3Qgd2FpdGluZyBmb3IgYSBzdWNjZXNzIGZ1bGwgcmVzcG9uc2UsIGJ1dCBhIDQwMVxuICAvLyBlcnJvciwgaW5kaWNhdGluZyB0aGF0IG91ciBwYXNzd29yZCB3YXMgY2hhbmdlZCBhbmQgb3VyXG4gIC8vIGN1cnJlbnQgc2Vzc2lvbiBoYXMgYmVlbiBpbnZhbGlkYXRlZFxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQYXNzd29yZFJlc2V0U3RhdHVzUmVxdWVzdFN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICB2YXIgZXJyb3I7XG5cbiAgICBpZiAocmVzcG9uc2UuJGVycm9yKSB7XG4gICAgICBlcnJvciA9IHJlc3BvbnNlLiRlcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IgPSB7IGVycm9yOiAncGVuZGluZycgfTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoZXJyb3IpO1xuICB9XG5cblxuICAvL1xuICAvLyBJZiB0aGUgZXJyb3IgaXMgYSA0MDEsIGl0J3MgZXhhY3RseSB3aGF0IHdlJ3ZlIGJlZW4gd2FpdGluZyBmb3IuXG4gIC8vIEluIHRoaXMgY2FzZSB3ZSByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQYXNzd29yZFJlc2V0U3RhdHVzUmVxdWVzdEVycm9yKHhocikge1xuICAgIGlmICh4aHIuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgIGNvbmZpZy51bnNldCgnX2FjY291bnQucmVzZXRQYXNzd29yZElkJyk7XG4gICAgICBhY2NvdW50LnRyaWdnZXIoJ3Bhc3N3b3JkcmVzZXQnKTtcblxuICAgICAgcmV0dXJuIHByb21pc2VzLnJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGhhbmRsZVJlcXVlc3RFcnJvcih4aHIpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy9cbiAgLy8gY2hhbmdlIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBpbiAzIHN0ZXBzXG4gIC8vXG4gIC8vIDEuIGFzc3VyZSB3ZSBoYXZlIGEgdmFsaWQgc2Vzc2lvblxuICAvLyAyLiB1cGRhdGUgX3VzZXJzIGRvYyB3aXRoIG5ldyB1c2VybmFtZSBhbmQgbmV3IHBhc3N3b3JkIChpZiBwcm92aWRlZClcbiAgLy8gMy4gc2lnbiBpbiB3aXRoIG5ldyBjcmVkZW50aWFscyB0byBjcmVhdGUgbmV3IHNlc2lvbi5cbiAgLy9cbiAgZnVuY3Rpb24gY2hhbmdlVXNlcm5hbWVBbmRQYXNzd29yZChjdXJyZW50UGFzc3dvcmQsIG5ld1VzZXJuYW1lLCBuZXdQYXNzd29yZCkge1xuXG4gICAgcmV0dXJuIHNlbmRTaWduSW5SZXF1ZXN0KGFjY291bnQudXNlcm5hbWUsIGN1cnJlbnRQYXNzd29yZCwge1xuICAgICAgc2lsZW50OiB0cnVlXG4gICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LmZldGNoKCkudGhlbihcbiAgICAgICAgc2VuZENoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmRSZXF1ZXN0KGN1cnJlbnRQYXNzd29yZCwgbmV3VXNlcm5hbWUsIG5ld1Bhc3N3b3JkKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gdHVybiBhbiBhbm9ueW1vdXMgYWNjb3VudCBpbnRvIGEgcmVhbCBhY2NvdW50XG4gIC8vXG4gIGZ1bmN0aW9uIHVwZ3JhZGVBbm9ueW1vdXNBY2NvdW50KHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIHZhciBjdXJyZW50UGFzc3dvcmQgPSBnZXRBbm9ueW1vdXNQYXNzd29yZCgpO1xuXG4gICAgcmV0dXJuIGNoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmQoY3VycmVudFBhc3N3b3JkLCB1c2VybmFtZSwgcGFzc3dvcmQpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICBhY2NvdW50LnRyaWdnZXIoJ3NpZ251cCcsIHVzZXJuYW1lKTtcbiAgICAgIHJlbW92ZUFub255bW91c1Bhc3N3b3JkKCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHdlIG5vdyBjYW4gYmUgc3VyZSB0aGF0IHdlIGZldGNoZWQgdGhlIGxhdGVzdCBfdXNlcnMgZG9jLCBzbyB3ZSBjYW4gdXBkYXRlIGl0XG4gIC8vIHdpdGhvdXQgYSBwb3RlbnRpYWwgY29uZmxpY3QgZXJyb3IuXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUZldGNoQmVmb3JlRGVzdHJveVN1Y2Nlc3MoKSB7XG5cbiAgICByZW1vdGUuZGlzY29ubmVjdCgpO1xuICAgIHVzZXJEb2MuX2RlbGV0ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHdpdGhQcmV2aW91c1JlcXVlc3RzQWJvcnRlZCgndXBkYXRlVXNlcnNEb2MnLCBmdW5jdGlvbigpIHtcbiAgICAgIGFjY291bnQucmVxdWVzdCgnUFVUJywgdXNlckRvY1VybCgpLCB7XG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHVzZXJEb2MpLFxuICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gZGVwZW5kZW5kIG9uIHdoYXQga2luZCBvZiBlcnJvciB3ZSBnZXQsIHdlIHdhbnQgdG8gaWdub3JlXG4gIC8vIGl0IG9yIG5vdC5cbiAgLy8gV2hlbiB3ZSBnZXQgYSAnbm90X2ZvdW5kJyBpdCBtZWFucyB0aGF0IHRoZSBfdXNlcnMgZG9jIGhhYmVcbiAgLy8gYmVlbiByZW1vdmVkIGFscmVhZHksIHNvIHdlIGRvbid0IG5lZWQgdG8gZG8gaXQgYW55bW9yZSwgYnV0XG4gIC8vIHN0aWxsIHdhbnQgdG8gZmluaXNoIHRoZSBkZXN0cm95IGxvY2FsbHksIHNvIHdlIHJldHVybiBhXG4gIC8vIHJlc29sdmVkIHByb21pc2VcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlRmV0Y2hCZWZvcmVEZXN0cm95RXJyb3IoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IuZXJyb3IgPT09ICdub3RfZm91bmQnKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVqZWN0V2l0aChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gcmVtb3ZlIGV2ZXJ5dGhpbmcgZm9ybSB0aGUgY3VycmVudCBhY2NvdW50LCBzbyBhIG5ldyBhY2NvdW50IGNhbiBiZSBpbml0aWF0ZWQuXG4gIC8vXG4gIGZ1bmN0aW9uIGNsZWFudXAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gaG9vZGllLnN0b3JlIGlzIGxpc3RlbmluZyBvbiB0aGlzIG9uZVxuICAgIGFjY291bnQudHJpZ2dlcignY2xlYW51cCcpO1xuICAgIGF1dGhlbnRpY2F0ZWQgPSBvcHRpb25zLmF1dGhlbnRpY2F0ZWQ7XG4gICAgY29uZmlnLmNsZWFyKCk7XG4gICAgc2V0VXNlcm5hbWUob3B0aW9ucy51c2VybmFtZSk7XG4gICAgc2V0T3duZXIob3B0aW9ucy5vd25lckhhc2ggfHwgdXVpZCgpKTtcblxuICAgIHJldHVybiBwcm9taXNlcy5yZXNvbHZlKCk7XG4gIH1cblxuXG4gIC8vXG4gIGZ1bmN0aW9uIGNsZWFudXBBbmRUcmlnZ2VyU2lnbk91dCgpIHtcbiAgICByZXR1cm4gY2xlYW51cCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC50cmlnZ2VyKCdzaWdub3V0Jyk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIGRlcGVuZGluZyBvbiB3ZXRoZXIgdGhlIHVzZXIgc2lnbmVkVXAgbWFudWFsbHkgb3IgaGFzIGJlZW4gc2lnbmVkIHVwXG4gIC8vIGFub255bW91c2x5IHRoZSBwcmVmaXggaW4gdGhlIENvdWNoREIgX3VzZXJzIGRvYyBkaWZmZXJlbnRpYXRlcy5cbiAgLy8gQW4gYW5vbnltb3VzIHVzZXIgaXMgY2hhcmFjdGVyaXplZCBieSBpdHMgdXNlcm5hbWUsIHRoYXQgZXF1YWxzXG4gIC8vIGl0cyBvd25lckhhc2ggKHNlZSBgYW5vbnltb3VzU2lnblVwYClcbiAgLy9cbiAgLy8gV2UgZGlmZmVyZW50aWF0ZSB3aXRoIGBoYXNBbm9ueW1vdXNBY2NvdW50KClgLCBiZWNhdXNlIGB1c2VyVHlwZUFuZElkYFxuICAvLyBpcyB1c2VkIHdpdGhpbiBgc2lnblVwYCBtZXRob2QsIHNvIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBkaWZmZXJlbnRpYXRlXG4gIC8vIGJldHdlZW4gYW5vbnlvbXVzIGFuZCBub3JtYWwgdXNlcnMgYmVmb3JlIGFuIGFjY291bnQgaGFzIGJlZW4gY3JlYXRlZC5cbiAgLy9cbiAgZnVuY3Rpb24gdXNlclR5cGVBbmRJZCh1c2VybmFtZSkge1xuICAgIHZhciB0eXBlO1xuXG4gICAgaWYgKHVzZXJuYW1lID09PSBhY2NvdW50Lm93bmVySGFzaCkge1xuICAgICAgdHlwZSA9ICd1c2VyX2Fub255bW91cyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUgPSAndXNlcic7XG4gICAgfVxuICAgIHJldHVybiAnJyArIHR5cGUgKyAnLycgKyB1c2VybmFtZTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gdHVybiBhIHVzZXJuYW1lIGludG8gYSB2YWxpZCBfdXNlcnMgZG9jLl9pZFxuICAvL1xuICBmdW5jdGlvbiB1c2VyRG9jS2V5KHVzZXJuYW1lKSB7XG4gICAgdXNlcm5hbWUgPSB1c2VybmFtZSB8fCBhY2NvdW50LnVzZXJuYW1lO1xuICAgIHJldHVybiAnJyArIHVzZXJEb2NQcmVmaXggKyAnOicgKyAodXNlclR5cGVBbmRJZCh1c2VybmFtZSkpO1xuICB9XG5cbiAgLy9cbiAgLy8gZ2V0IFVSTCBvZiBteSBfdXNlcnMgZG9jXG4gIC8vXG4gIGZ1bmN0aW9uIHVzZXJEb2NVcmwodXNlcm5hbWUpIHtcbiAgICByZXR1cm4gJy9fdXNlcnMvJyArIChlbmNvZGVVUklDb21wb25lbnQodXNlckRvY0tleSh1c2VybmFtZSkpKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gdXBkYXRlIG15IF91c2VycyBkb2MuXG4gIC8vXG4gIC8vIElmIGEgbmV3IHVzZXJuYW1lIGhhcyBiZWVuIHBhc3NlZCwgd2Ugc2V0IHRoZSBzcGVjaWFsIGF0dHJpYnV0ICRuZXdVc2VybmFtZS5cbiAgLy8gVGhpcyB3aWxsIGxldCB0aGUgdXNlcm5hbWUgY2hhbmdlIHdvcmtlciBjcmVhdGUgY3JlYXRlIGEgbmV3IF91c2VycyBkb2MgZm9yXG4gIC8vIHRoZSBuZXcgdXNlcm5hbWUgYW5kIHJlbW92ZSB0aGUgY3VycmVudCBvbmVcbiAgLy9cbiAgLy8gSWYgYSBuZXcgcGFzc3dvcmQgaGFzIGJlZW4gcGFzc2VkLCBzYWx0IGFuZCBwYXNzd29yZF9zaGEgZ2V0IHJlbW92ZWRcbiAgLy8gZnJvbSBfdXNlcnMgZG9jIGFuZCBhZGQgdGhlIHBhc3N3b3JkIGluIGNsZWFyIHRleHQuIENvdWNoREIgd2lsbCByZXBsYWNlIGl0IHdpdGhcbiAgLy8gYWNjb3JkaW5nIHBhc3N3b3JkX3NoYSBhbmQgYSBuZXcgc2FsdCBzZXJ2ZXIgc2lkZVxuICAvL1xuICBmdW5jdGlvbiBzZW5kQ2hhbmdlVXNlcm5hbWVBbmRQYXNzd29yZFJlcXVlc3QoY3VycmVudFBhc3N3b3JkLCBuZXdVc2VybmFtZSwgbmV3UGFzc3dvcmQpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIHByZXBhcmUgdXBkYXRlZCBfdXNlcnMgZG9jXG4gICAgICB2YXIgZGF0YSA9ICQuZXh0ZW5kKHt9LCB1c2VyRG9jKTtcblxuICAgICAgaWYgKG5ld1VzZXJuYW1lKSB7XG4gICAgICAgIGRhdGEuJG5ld1VzZXJuYW1lID0gbmV3VXNlcm5hbWU7XG4gICAgICB9XG5cbiAgICAgIGRhdGEudXBkYXRlZEF0ID0gbm93KCk7XG4gICAgICBkYXRhLnNpZ25lZFVwQXQgPSBkYXRhLnNpZ25lZFVwQXQgfHwgbm93KCk7XG5cbiAgICAgIC8vIHRyaWdnZXIgcGFzc3dvcmQgdXBkYXRlIHdoZW4gbmV3UGFzc3dvcmQgc2V0XG4gICAgICBpZiAobmV3UGFzc3dvcmQgIT09IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRhdGEuc2FsdDtcbiAgICAgICAgZGVsZXRlIGRhdGEucGFzc3dvcmRfc2hhO1xuICAgICAgICBkYXRhLnBhc3N3b3JkID0gbmV3UGFzc3dvcmQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHdpdGhQcmV2aW91c1JlcXVlc3RzQWJvcnRlZCgndXBkYXRlVXNlcnNEb2MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFjY291bnQucmVxdWVzdCgnUFVUJywgdXNlckRvY1VybCgpLCBvcHRpb25zKS50aGVuKFxuICAgICAgICAgIGhhbmRsZUNoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmRSZXF1ZXN0KG5ld1VzZXJuYW1lLCBuZXdQYXNzd29yZCB8fCBjdXJyZW50UGFzc3dvcmQpLFxuICAgICAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICB9O1xuICB9XG5cblxuICAvL1xuICAvLyBkZXBlbmRpbmcgb24gd2hldGhlciBhIG5ld1VzZXJuYW1lIGhhcyBiZWVuIHBhc3NlZCwgd2UgY2FuIHNpZ24gaW4gcmlnaHQgYXdheVxuICAvLyBvciBoYXZlIHRvIHVzZSB0aGUgZGVsYXllZCBzaWduIGluIHRvIGdpdmUgdGhlIHVzZXJuYW1lIGNoYW5nZSB3b3JrZXIgc29tZSB0aW1lXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUNoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmRSZXF1ZXN0KG5ld1VzZXJuYW1lLCBuZXdQYXNzd29yZCkge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3RlLmRpc2Nvbm5lY3QoKTtcblxuICAgICAgaWYgKG5ld1VzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiBkZWxheWVkU2lnbkluKG5ld1VzZXJuYW1lLCBuZXdQYXNzd29yZCwge1xuICAgICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhY2NvdW50LnNpZ25JbihhY2NvdW50LnVzZXJuYW1lLCBuZXdQYXNzd29yZCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIHNhbWUgcmVxdWVzdCBkb2Vzbid0IGdldCBzZW50IHR3aWNlXG4gIC8vIGJ5IGNhbmNlbGxpbmcgdGhlIHByZXZpb3VzIG9uZS5cbiAgLy9cbiAgZnVuY3Rpb24gd2l0aFByZXZpb3VzUmVxdWVzdHNBYm9ydGVkKG5hbWUsIHJlcXVlc3RGdW5jdGlvbikge1xuICAgIGlmIChyZXF1ZXN0c1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHJlcXVlc3RzW25hbWVdLmFib3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlcXVlc3RzW25hbWVdLmFib3J0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3RzW25hbWVdID0gcmVxdWVzdEZ1bmN0aW9uKCk7XG4gICAgcmV0dXJuIHJlcXVlc3RzW25hbWVdO1xuICB9XG5cblxuICAvL1xuICAvLyBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgcmVxdWVzdCwgcmV0dXJuIGl0cyBwcm9taXNlIGluc3RlYWRcbiAgLy8gb2Ygc2VuZGluZyBhbm90aGVyIHJlcXVlc3RcbiAgLy9cbiAgZnVuY3Rpb24gd2l0aFNpbmdsZVJlcXVlc3QobmFtZSwgcmVxdWVzdEZ1bmN0aW9uKSB7XG5cbiAgICBpZiAocmVxdWVzdHNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0c1tuYW1lXS5zdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAocmVxdWVzdHNbbmFtZV0uc3RhdGUoKSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcXVlc3RzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdHNbbmFtZV0gPSByZXF1ZXN0RnVuY3Rpb24oKTtcbiAgICByZXR1cm4gcmVxdWVzdHNbbmFtZV07XG4gIH1cblxuXG4gIC8vXG4gIGZ1bmN0aW9uIHNlbmRTaWduT3V0UmVxdWVzdCgpIHtcbiAgICByZXR1cm4gd2l0aFNpbmdsZVJlcXVlc3QoJ3NpZ25PdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LnJlcXVlc3QoJ0RFTEVURScsICcvX3Nlc3Npb24nKS50aGVuKG51bGwsIGhhbmRsZVJlcXVlc3RFcnJvcik7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHRoZSBzaWduIGluIHJlcXVlc3QgdGhhdCBzdGFydHMgYSBDb3VjaERCIHNlc3Npb24gaWZcbiAgLy8gaXQgc3VjY2VlZHMuIFdlIHNlcGFyYXRlZCB0aGUgYWN0dWFsIHNpZ24gaW4gcmVxdWVzdCBmcm9tXG4gIC8vIHRoZSBzaWduSW4gbWV0aG9kLCBhcyB0aGUgbGF0dGVyIGFsc28gcnVucyBzaWduT3V0IGludGVucnRhbGx5XG4gIC8vIHRvIGNsZWFuIHVwIGxvY2FsIGRhdGEgYmVmb3JlIHN0YXJ0aW5nIGEgbmV3IHNlc3Npb24uIEJ1dCBhc1xuICAvLyBvdGhlciBtZXRob2RzIGxpa2Ugc2lnblVwIG9yIGNoYW5nZVBhc3N3b3JkIGRvIGFsc28gbmVlZCB0b1xuICAvLyBzaWduIGluIHRoZSB1c2VyIChhZ2FpbiksIHRoZXNlIG5lZWQgdG8gc2VuZCB0aGUgc2lnbiBpblxuICAvLyByZXF1ZXN0IGJ1dCB3aXRob3V0IGEgc2lnbk91dCBiZWZvcmVoYW5kLCBhcyB0aGUgdXNlciByZW1haW5zXG4gIC8vIHRoZSBzYW1lLlxuICAvL1xuICBmdW5jdGlvbiBzZW5kU2lnbkluUmVxdWVzdCh1c2VybmFtZSwgcGFzc3dvcmQsIG9wdGlvbnMpIHtcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIG5hbWU6IHVzZXJUeXBlQW5kSWQodXNlcm5hbWUpLFxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHdpdGhQcmV2aW91c1JlcXVlc3RzQWJvcnRlZCgnc2lnbkluJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IGFjY291bnQucmVxdWVzdCgnUE9TVCcsICcvX3Nlc3Npb24nLCByZXF1ZXN0T3B0aW9ucyk7XG5cbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oXG4gICAgICAgIGhhbmRsZVNpZ25JblN1Y2Nlc3Mob3B0aW9ucyksXG4gICAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vXG4gIGZ1bmN0aW9uIG5vdygpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfVxuXG5cbiAgLy8gVE9ETzogd2Ugc2hvdWxkIG1vdmUgdGhlIG93bmVyIGhhc2ggb24gaG9vZGllIGNvcmUsIGFzXG4gIC8vICAgICAgIG90aGVyIG1vZHVsZXMgZGVwZW5kIG9uIGl0IGFzIHdlbGwsIGxpa2UgaG9vZGllLnN0b3JlLlxuICAvLyB0aGUgb3duZXJIYXNoIGdldHMgc3RvcmVkIGluIGV2ZXJ5IG9iamVjdCBjcmVhdGVkIGJ5IHRoZSB1c2VyLlxuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBvbmUuXG4gIGFjY291bnQub3duZXJIYXNoID0gY29uZmlnLmdldCgnX2FjY291bnQub3duZXJIYXNoJyk7XG5cbiAgaWYgKCFhY2NvdW50Lm93bmVySGFzaCkge1xuICAgIHNldE93bmVyKHV1aWQoKSk7XG4gIH1cblxuICByZXR1cm4gYWNjb3VudDtcblxufTtcbiIsIi8qIGV4cG9ydGVkIGhvb2RpZUNvbmZpZyAqL1xuXG4vLyBIb29kaWUgQ29uZmlnIEFQSVxuLy8gPT09PT09PT09PT09PT09PT09PVxuXG4vL1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdHlwZSA9ICckY29uZmlnJztcbiAgdmFyIGlkID0gJ2hvb2RpZSc7XG4gIHZhciBjYWNoZSA9IHt9O1xuXG4gIC8vIHB1YmxpYyBBUElcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG5cbiAgLy8gc2V0XG4gIC8vIC0tLS0tLS0tLS1cblxuICAvLyBhZGRzIGEgY29uZmlndXJhdGlvblxuICAvL1xuICBjb25maWcuc2V0ID0gZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICB2YXIgaXNTaWxlbnQsIHVwZGF0ZTtcblxuICAgIGlmIChjYWNoZVtrZXldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhY2hlW2tleV0gPSB2YWx1ZTtcblxuICAgIHVwZGF0ZSA9IHt9O1xuICAgIHVwZGF0ZVtrZXldID0gdmFsdWU7XG4gICAgaXNTaWxlbnQgPSBrZXkuY2hhckF0KDApID09PSAnXyc7XG5cbiAgICByZXR1cm4gc3RvcmUudXBkYXRlT3JBZGQodHlwZSwgaWQsIHVwZGF0ZSwge1xuICAgICAgc2lsZW50OiBpc1NpbGVudFxuICAgIH0pO1xuICB9O1xuXG4gIC8vIGdldFxuICAvLyAtLS0tLS0tLS0tXG5cbiAgLy8gcmVjZWl2ZXMgYSBjb25maWd1cmF0aW9uXG4gIC8vXG4gIGNvbmZpZy5nZXQgPSBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIGNhY2hlW2tleV07XG4gIH07XG5cbiAgLy8gY2xlYXJcbiAgLy8gLS0tLS0tLS0tLVxuXG4gIC8vIGNsZWFycyBjYWNoZSBhbmQgcmVtb3ZlcyBvYmplY3QgZnJvbSBzdG9yZVxuICAvL1xuICBjb25maWcuY2xlYXIgPSBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBjYWNoZSA9IHt9O1xuICAgIHJldHVybiBzdG9yZS5yZW1vdmUodHlwZSwgaWQpO1xuICB9O1xuXG4gIC8vIHVuc2V0XG4gIC8vIC0tLS0tLS0tLS1cblxuICAvLyB1bnNldHMgYSBjb25maWd1cmF0aW9uLCBpcyBhIHNpbXBsZSBhbGlhcyBmb3IgY29uZmlnLnNldChrZXksIHVuZGVmaW5lZClcbiAgLy9cbiAgY29uZmlnLnVuc2V0ID0gZnVuY3Rpb24gdW5zZXQoa2V5KSB7XG4gICAgcmV0dXJuIGNvbmZpZy5zZXQoa2V5LCB1bmRlZmluZWQpO1xuICB9O1xuXG4gIC8vIGxvYWQgY2FjaGVcbiAgLy8gVE9ETzogSSByZWFsbHkgZG9uJ3QgbGlrZSB0aGlzIGJlaW5nIGhlcmUuIEFuZCBJIGRvbid0IGxpa2UgdGhhdCBpZiB0aGVcbiAgLy8gICAgICAgc3RvcmUgQVBJIHdpbGwgYmUgdHJ1bHkgYXN5bmMgb25lIGRheSwgdGhpcyB3aWxsIGZhbGwgb24gb3VyIGZlZXQuXG4gIHN0b3JlLmZpbmQodHlwZSwgaWQpLmRvbmUoZnVuY3Rpb24ob2JqKSB7XG4gICAgY2FjaGUgPSBvYmo7XG4gIH0pO1xuXG4gIC8vIGV4c3Bvc2UgcHVibGljIEFQSVxuICByZXR1cm4gY29uZmlnO1xuXG59O1xuIiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307LyogZXhwb3J0ZWQgaG9vZGllQ29ubmVjdGlvbiAqL1xuXG4vL1xuLy8gaG9vZGllLmNoZWNrQ29ubmVjdGlvbigpICYgaG9vZGllLmlzQ29ubmVjdGVkKClcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxudmFyIHByb21pc2VzID0gcmVxdWlyZSgnLi9wcm9taXNlcycpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xuXG4vLyBzdGF0ZVxudmFyIG9ubGluZSA9IHRydWU7XG52YXIgY2hlY2tDb25uZWN0aW9uSW50ZXJ2YWwgPSAzMDAwMDtcbnZhciBjaGVja0Nvbm5lY3Rpb25SZXF1ZXN0ID0gbnVsbDtcbnZhciBjaGVja0Nvbm5lY3Rpb25UaW1lb3V0ID0gbnVsbDtcblxuLy8gQ2hlY2sgQ29ubmVjdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIHRoZSBgY2hlY2tDb25uZWN0aW9uYCBtZXRob2QgaXMgdXNlZCwgd2VsbCwgdG8gY2hlY2sgaWZcbi8vIHRoZSBob29kaWUgYmFja2VuZCBpcyByZWFjaGFibGUgYXQgYGJhc2VVcmxgIG9yIG5vdC5cbi8vIENoZWNrIENvbm5lY3Rpb24gaXMgYXV0b21hdGljYWxseSBjYWxsZWQgb24gc3RhcnR1cFxuLy8gYW5kIHRoZW4gZWFjaCAzMCBzZWNvbmRzLiBJZiBpdCBmYWlscywgaXRcbi8vXG4vLyAtIHNldHMgYG9ubGluZSA9IGZhbHNlYFxuLy8gLSB0cmlnZ2VycyBgb2ZmbGluZWAgZXZlbnRcbi8vIC0gc2V0cyBgY2hlY2tDb25uZWN0aW9uSW50ZXJ2YWwgPSAzMDAwYFxuLy9cbi8vIHdoZW4gY29ubmVjdGlvbiBjYW4gYmUgcmVlc3RhYmxpc2hlZCwgaXRcbi8vXG4vLyAtIHNldHMgYG9ubGluZSA9IHRydWVgXG4vLyAtIHRyaWdnZXJzIGBvbmxpbmVgIGV2ZW50XG4vLyAtIHNldHMgYGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDBgXG4vL1xudmFyIGNoZWNrQ29ubmVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlcSA9IGNoZWNrQ29ubmVjdGlvblJlcXVlc3Q7XG5cbiAgaWYgKHJlcSAmJiByZXEuc3RhdGUoKSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgcmV0dXJuIHJlcTtcbiAgfVxuXG4gIGdsb2JhbC5jbGVhclRpbWVvdXQoY2hlY2tDb25uZWN0aW9uVGltZW91dCk7XG5cbiAgY2hlY2tDb25uZWN0aW9uUmVxdWVzdCA9IHJlcXVlc3QoJ0dFVCcsICcvJykudGhlbihcbiAgICBoYW5kbGVDaGVja0Nvbm5lY3Rpb25TdWNjZXNzLFxuICAgIGhhbmRsZUNoZWNrQ29ubmVjdGlvbkVycm9yXG4gICk7XG5cbiAgcmV0dXJuIGNoZWNrQ29ubmVjdGlvblJlcXVlc3Q7XG59O1xuXG5cbi8vIGlzQ29ubmVjdGVkXG4vLyAtLS0tLS0tLS0tLS0tXG5cbi8vXG52YXIgaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBvbmxpbmU7XG59O1xuXG5cbi8vXG4vL1xuLy9cbmZ1bmN0aW9uIGhhbmRsZUNoZWNrQ29ubmVjdGlvblN1Y2Nlc3MoKSB7XG4gIGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDA7XG5cbiAgY2hlY2tDb25uZWN0aW9uVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KFxuICAgIGV4cG9ydHMuY2hlY2tDb25uZWN0aW9uLFxuICAgIGNoZWNrQ29ubmVjdGlvbkludGVydmFsXG4gICk7XG5cbiAgaWYgKCFleHBvcnRzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICBldmVudHMudHJpZ2dlcigncmVjb25uZWN0ZWQnKTtcbiAgICBvbmxpbmUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2VzLnJlc29sdmUoKTtcbn1cblxuXG4vL1xuLy9cbi8vXG5mdW5jdGlvbiBoYW5kbGVDaGVja0Nvbm5lY3Rpb25FcnJvcigpIHtcbiAgY2hlY2tDb25uZWN0aW9uSW50ZXJ2YWwgPSAzMDAwO1xuXG4gIGNoZWNrQ29ubmVjdGlvblRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcbiAgICBleHBvcnRzLmNoZWNrQ29ubmVjdGlvbixcbiAgICBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbFxuICApO1xuXG4gIGlmIChleHBvcnRzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICBldmVudHMudHJpZ2dlcignZGlzY29ubmVjdGVkJyk7XG4gICAgb25saW5lID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZXMucmVqZWN0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjaGVja0Nvbm5lY3Rpb246IGNoZWNrQ29ubmVjdGlvbixcbiAgaXNDb25uZWN0ZWQ6IGlzQ29ubmVjdGVkXG59O1xuXG4iLCIvL1xuLy8gb25lIHBsYWNlIHRvIHJ1bGUgdGhlbSBhbGwhXG4vL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBJTlZBTElEX0tFWVxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHRocm93biB3aGVuIGludmFsaWQga2V5cyBhcmUgdXNlZCB0byBzdG9yZSBhbiBvYmplY3RcbiAgLy9cbiAgSU5WQUxJRF9LRVk6IGZ1bmN0aW9uIChpZE9yVHlwZSkge1xuICAgIHZhciBrZXkgPSBpZE9yVHlwZS5pZCA/ICdpZCcgOiAndHlwZSc7XG5cbiAgICByZXR1cm4gbmV3IEVycm9yKCdpbnZhbGlkICcgKyBrZXkgKyAnXFwnJyArIGlkT3JUeXBlW2tleV0gKyAnXFwnOiBudW1iZXJzIGFuZCBsb3dlcmNhc2UgbGV0dGVycyBhbGxvd2VkIG9ubHknKTtcbiAgfSxcblxuICAvLyBJTlZBTElEX0FSR1VNRU5UU1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgSU5WQUxJRF9BUkdVTUVOVFM6IGZ1bmN0aW9uIChtc2cpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKG1zZyk7XG4gIH0sXG5cbiAgLy8gTk9UX0ZPVU5EXG4gIC8vIC0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgTk9UX0ZPVU5EOiBmdW5jdGlvbiAodHlwZSwgaWQpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKCcnICsgdHlwZSArICcgd2l0aCAnICsgaWQgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9XG5cbn07XG4iLCIvKiBleHBvcnRlZCBob29kaWVFdmVudHMgKi9cblxuLy9cbi8vIEV2ZW50c1xuLy8gPT09PT09PT1cbi8vXG4vLyBleHRlbmQgYW55IENsYXNzIHdpdGggc3VwcG9ydCBmb3Jcbi8vXG4vLyAqIGBvYmplY3QuYmluZCgnZXZlbnQnLCBjYilgXG4vLyAqIGBvYmplY3QudW5iaW5kKCdldmVudCcsIGNiKWBcbi8vICogYG9iamVjdC50cmlnZ2VyKCdldmVudCcsIGFyZ3MuLi4pYFxuLy8gKiBgb2JqZWN0Lm9uZSgnZXYnLCBjYilgXG4vL1xuLy8gYmFzZWQgb24gW0V2ZW50cyBpbXBsZW1lbnRhdGlvbnMgZnJvbSBTcGluZV0oaHR0cHM6Ly9naXRodWIuY29tL21hY2NtYW4vc3BpbmUvYmxvYi9tYXN0ZXIvc3JjL3NwaW5lLmNvZmZlZSNMMSlcbi8vXG5cbi8vIGNhbGxiYWNrcyBhcmUgZ2xvYmFsLCB3aGlsZSB0aGUgZXZlbnRzIEFQSSBpcyB1c2VkIGF0IHNldmVyYWwgcGxhY2VzLFxuLy8gbGlrZSBob29kaWUub24gLyBob29kaWUuc3RvcmUub24gLyBob29kaWUudGFzay5vbiBldGMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUsIG9wdGlvbnMpIHtcbiAgdmFyIGNvbnRleHQgPSBob29kaWU7XG4gIHZhciBuYW1lc3BhY2UgPSAnJztcblxuICAvLyBub3JtYWxpemUgb3B0aW9ucyBoYXNoXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIG1ha2Ugc3VyZSBjYWxsYmFja3MgaGFzaCBleGlzdHNcbiAgaG9vZGllLmV2ZW50c0NhbGxiYWNrcyB8fCBob29kaWUuZXZlbnRzQ2FsbGJhY2tzIHx8IHt9O1xuXG4gIGlmIChvcHRpb25zLmNvbnRleHQpIHtcbiAgICBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlICsgJzonO1xuICB9XG5cbiAgLy8gQmluZFxuICAvLyAtLS0tLS1cbiAgLy9cbiAgLy8gYmluZCBhIGNhbGxiYWNrIHRvIGFuIGV2ZW50IHRyaWdnZXJkIGJ5IHRoZSBvYmplY3RcbiAgLy9cbiAgLy8gICAgIG9iamVjdC5iaW5kICdjaGVhdCcsIGJsYW1lXG4gIC8vXG4gIGZ1bmN0aW9uIGJpbmQoZXYsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGV2cywgbmFtZSwgX2ksIF9sZW47XG5cbiAgICBldnMgPSBldi5zcGxpdCgnICcpO1xuXG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBldnMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG5hbWUgPSBuYW1lc3BhY2UgKyBldnNbX2ldO1xuICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tuYW1lXSA9IGhvb2RpZS5ldmVudHNDYWxsYmFja3NbbmFtZV0gfHwgW107XG4gICAgICBob29kaWUuZXZlbnRzQ2FsbGJhY2tzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIC8vIG9uZVxuICAvLyAtLS0tLVxuICAvL1xuICAvLyBzYW1lIGFzIGBiaW5kYCwgYnV0IGRvZXMgZ2V0IGV4ZWN1dGVkIG9ubHkgb25jZVxuICAvL1xuICAvLyAgICAgb2JqZWN0Lm9uZSAnZ3JvdW5kVG91Y2gnLCBnYW1lT3ZlclxuICAvL1xuICBmdW5jdGlvbiBvbmUoZXYsIGNhbGxiYWNrKSB7XG4gICAgZXYgPSBuYW1lc3BhY2UgKyBldjtcbiAgICB2YXIgd3JhcHBlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgZXhwb3J0cy51bmJpbmQoZXYsIHdyYXBwZXIpO1xuICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIGV4cG9ydHMuYmluZChldiwgd3JhcHBlcik7XG4gIH1cblxuICAvLyB0cmlnZ2VyXG4gIC8vIC0tLS0tLS0tLVxuICAvL1xuICAvLyB0cmlnZ2VyIGFuIGV2ZW50IGFuZCBwYXNzIG9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIGJpbmRpbmcuXG4gIC8vICAgICBvYmplY3QudHJpZ2dlciAnd2luJywgc2NvcmU6IDEyMzBcbiAgLy9cbiAgZnVuY3Rpb24gdHJpZ2dlcigpIHtcbiAgICB2YXIgYXJncywgY2FsbGJhY2ssIGV2LCBsaXN0LCBfaSwgX2xlbjtcblxuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgZXYgPSBhcmdzLnNoaWZ0KCk7XG4gICAgZXYgPSBuYW1lc3BhY2UgKyBldjtcbiAgICBsaXN0ID0gaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tldl07XG5cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGxpc3QubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGNhbGxiYWNrID0gbGlzdFtfaV07XG4gICAgICBjYWxsYmFjay5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIHVuYmluZFxuICAvLyAtLS0tLS0tLVxuICAvL1xuICAvLyB1bmJpbmQgdG8gZnJvbSBhbGwgYmluZGluZ3MsIGZyb20gYWxsIGJpbmRpbmdzIG9mIGEgc3BlY2lmaWMgZXZlbnRcbiAgLy8gb3IgZnJvbSBhIHNwZWNpZmljIGJpbmRpbmcuXG4gIC8vXG4gIC8vICAgICBvYmplY3QudW5iaW5kKClcbiAgLy8gICAgIG9iamVjdC51bmJpbmQgJ21vdmUnXG4gIC8vICAgICBvYmplY3QudW5iaW5kICdtb3ZlJywgZm9sbG93XG4gIC8vXG4gIGZ1bmN0aW9uIHVuYmluZChldiwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2IsIGksIGxpc3QsIF9pLCBfbGVuLCBldk5hbWVzO1xuXG4gICAgaWYgKCFldikge1xuICAgICAgaWYgKCFuYW1lc3BhY2UpIHtcbiAgICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBldk5hbWVzID0gT2JqZWN0LmtleXMoaG9vZGllLmV2ZW50c0NhbGxiYWNrcyk7XG4gICAgICBldk5hbWVzID0gZXZOYW1lcy5maWx0ZXIoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHJldHVybiBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwO1xuICAgICAgfSk7XG4gICAgICBldk5hbWVzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGRlbGV0ZSBob29kaWUuZXZlbnRzQ2FsbGJhY2tzW2tleV07XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ID0gbmFtZXNwYWNlICsgZXY7XG5cbiAgICBsaXN0ID0gaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tldl07XG5cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBkZWxldGUgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tldl07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gbGlzdC5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICAgIGNiID0gbGlzdFtpXTtcblxuXG4gICAgICBpZiAoY2IgIT09IGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsaXN0ID0gbGlzdC5zbGljZSgpO1xuICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICBob29kaWUuZXZlbnRzQ2FsbGJhY2tzW2V2XSA9IGxpc3Q7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJpbmQ6IGJpbmQsXG4gICAgb246IGJpbmQsXG4gICAgb25lOiBvbmUsXG4gICAgdHJpZ2dlcjogdHJpZ2dlcixcbiAgICB1bmJpbmQ6IHVuYmluZCxcbiAgICBvZmY6IHVuYmluZFxuICB9O1xuXG59O1xuXG4iLCIvKiBnbG9iYWwgJDp0cnVlICovXG5cbi8vIE9wZW4gc3RvcmVzXG4vLyAtLS0tLS0tLS0tLS0tXG5cbnZhciByZW1vdGVTdG9yZSA9IHJlcXVpcmUoJy4vcmVtb3RlX3N0b3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSkge1xuICB2YXIgJGV4dGVuZCA9ICQuZXh0ZW5kO1xuXG4gIC8vIGdlbmVyaWMgbWV0aG9kIHRvIG9wZW4gYSBzdG9yZS4gVXNlZCBieVxuICAvL1xuICAvLyAqIGhvb2RpZS5yZW1vdGVcbiAgLy8gKiBob29kaWUudXNlcihcImpvZVwiKVxuICAvLyAqIGhvb2RpZS5nbG9iYWxcbiAgLy8gKiAuLi4gYW5kIG1vcmVcbiAgLy9cbiAgLy8gICAgIGhvb2RpZS5vcGVuKFwic29tZV9zdG9yZV9uYW1lXCIpLmZpbmRBbGwoKVxuICAvL1xuICBmdW5jdGlvbiBvcGVuKHN0b3JlTmFtZSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgJGV4dGVuZChvcHRpb25zLCB7XG4gICAgICBuYW1lOiBzdG9yZU5hbWVcbiAgICB9KTtcblxuXG4gICAgcmV0dXJuIHJlbW90ZVN0b3JlLmNhbGwodGhpcywgaG9vZGllLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vXG4gIC8vIFB1YmxpYyBBUElcbiAgLy9cbiAgcmV0dXJuIG9wZW47XG59O1xuXG4iLCIvLyBIb29kaWUgRGVmZXJzIC8gUHJvbWlzZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyByZXR1cm5zIGEgZGVmZXIgb2JqZWN0IGZvciBjdXN0b20gcHJvbWlzZSBoYW5kbGluZ3MuXG4vLyBQcm9taXNlcyBhcmUgaGVhdmVseSB1c2VkIHRocm91Z2hvdXQgdGhlIGNvZGUgb2YgaG9vZGllLlxuLy8gV2UgY3VycmVudGx5IGJvcnJvdyBqUXVlcnkncyBpbXBsZW1lbnRhdGlvbjpcbi8vIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9jYXRlZ29yeS9kZWZlcnJlZC1vYmplY3QvXG4vL1xuLy8gICAgIGRlZmVyID0gaG9vZGllLmRlZmVyKClcbi8vICAgICBpZiAoZ29vZCkge1xuLy8gICAgICAgZGVmZXIucmVzb2x2ZSgnZ29vZC4nKVxuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICBkZWZlci5yZWplY3QoJ25vdCBnb29kLicpXG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBkZWZlci5wcm9taXNlKClcbi8vXG52YXIgZGZkID0gJC5EZWZlcnJlZCgpO1xuXG4vLyByZXR1cm5zIHRydWUgaWYgcGFzc2VkIG9iamVjdCBpcyBhIHByb21pc2UgKGJ1dCBub3QgYSBkZWZlcnJlZCksXG4vLyBvdGhlcndpc2UgZmFsc2UuXG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KSB7XG4gIHZhciBoYXNEb25lID0gdHlwZW9mIG9iamVjdC5kb25lID09PSAnZnVuY3Rpb24nO1xuICB2YXIgaGFzUmVzb2x2ZWQgPSB0eXBlb2Ygb2JqZWN0LnJlc29sdmUgIT09ICdmdW5jdGlvbic7XG5cbiAgcmV0dXJuICEhKG9iamVjdCAmJiBoYXNEb25lICYmIGhhc1Jlc29sdmVkKTtcbn1cblxuLy9cbmZ1bmN0aW9uIHJlc29sdmUoKSB7XG4gIHJldHVybiBkZmQucmVzb2x2ZSgpLnByb21pc2UoKTtcbn1cblxuXG4vL1xuZnVuY3Rpb24gcmVqZWN0KCkge1xuICByZXR1cm4gZGZkLnJlamVjdCgpLnByb21pc2UoKTtcbn1cblxuXG4vL1xuZnVuY3Rpb24gcmVzb2x2ZVdpdGgoKSB7XG4gIHJldHVybiBkZmQucmVzb2x2ZS5hcHBseShkZmQsIGFyZ3VtZW50cykucHJvbWlzZSgpO1xufVxuXG4vL1xuZnVuY3Rpb24gcmVqZWN0V2l0aCgpIHtcbiAgcmV0dXJuIGRmZC5yZWplY3QuYXBwbHkoZGZkLCBhcmd1bWVudHMpLnByb21pc2UoKTtcbn1cblxuLy9cbi8vIFB1YmxpYyBBUElcbi8vXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmZXI6IGRmZCxcbiAgaXNQcm9taXNlOiBpc1Byb21pc2UsXG4gIHJlc29sdmU6IHJlc29sdmUsXG4gIHJlamVjdDogcmVqZWN0LFxuICByZXNvbHZlV2l0aDogcmVzb2x2ZVdpdGgsXG4gIHJlamVjdFdpdGg6IHJlamVjdFdpdGhcbn07XG4iLCIvLyBSZW1vdGVcbi8vID09PT09PT09XG5cbi8vIENvbm5lY3Rpb24gdG8gYSByZW1vdGUgQ291Y2ggRGF0YWJhc2UuXG4vL1xuLy8gc3RvcmUgQVBJXG4vLyAtLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gb2JqZWN0IGxvYWRpbmcgLyB1cGRhdGluZyAvIGRlbGV0aW5nXG4vL1xuLy8gKiBmaW5kKHR5cGUsIGlkKVxuLy8gKiBmaW5kQWxsKHR5cGUgKVxuLy8gKiBhZGQodHlwZSwgb2JqZWN0KVxuLy8gKiBzYXZlKHR5cGUsIGlkLCBvYmplY3QpXG4vLyAqIHVwZGF0ZSh0eXBlLCBpZCwgbmV3X3Byb3BlcnRpZXMgKVxuLy8gKiB1cGRhdGVBbGwoIHR5cGUsIG5ld19wcm9wZXJ0aWVzKVxuLy8gKiByZW1vdmUodHlwZSwgaWQpXG4vLyAqIHJlbW92ZUFsbCh0eXBlKVxuLy9cbi8vIGN1c3RvbSByZXF1ZXN0c1xuLy9cbi8vICogcmVxdWVzdCh2aWV3LCBwYXJhbXMpXG4vLyAqIGdldCh2aWV3LCBwYXJhbXMpXG4vLyAqIHBvc3QodmlldywgcGFyYW1zKVxuLy9cbi8vIHN5bmNocm9uaXphdGlvblxuLy9cbi8vICogY29ubmVjdCgpXG4vLyAqIGRpc2Nvbm5lY3QoKVxuLy8gKiBwdWxsKClcbi8vICogcHVzaCgpXG4vLyAqIHN5bmMoKVxuLy9cbi8vIGV2ZW50IGJpbmRpbmdcbi8vXG4vLyAqIG9uKGV2ZW50LCBjYWxsYmFjaylcbi8vXG5cbi8vXG52YXIgdXVpZCA9IHJlcXVpcmUoJy4vdXRpbHMvdXVpZCcpO1xudmFyIGNvbm5lY3Rpb24gPSByZXF1aXJlKCcuL2Nvbm5lY3Rpb24nKTtcbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnLi9yZXF1ZXN0Jyk7XG52YXIgc3RvcmVBcGkgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSwgb3B0aW9ucykge1xuXG4gIHZhciByZW1vdGVTdG9yZSA9IHt9O1xuXG5cbiAgLy8gUmVtb3RlIFN0b3JlIFBlcnNpc3RhbmNlIG1ldGhvZHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGZpbmRcbiAgLy8gLS0tLS0tXG5cbiAgLy8gZmluZCBvbmUgb2JqZWN0XG4gIC8vXG4gIHJlbW90ZVN0b3JlLmZpbmQgPSBmdW5jdGlvbiBmaW5kKHR5cGUsIGlkKSB7XG4gICAgdmFyIHBhdGg7XG5cbiAgICBwYXRoID0gdHlwZSArICcvJyArIGlkO1xuXG4gICAgaWYgKHJlbW90ZS5wcmVmaXgpIHtcbiAgICAgIHBhdGggPSByZW1vdGUucHJlZml4ICsgcGF0aDtcbiAgICB9XG5cbiAgICBwYXRoID0gJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhdGgpO1xuXG4gICAgcmV0dXJuIHJlcXVlc3QoJ0dFVCcsIHBhdGgpLnRoZW4ocGFyc2VGcm9tUmVtb3RlKTtcbiAgfTtcblxuXG4gIC8vIGZpbmRBbGxcbiAgLy8gLS0tLS0tLS0tXG5cbiAgLy8gZmluZCBhbGwgb2JqZWN0cywgY2FuIGJlIGZpbGV0ZXJlZCBieSBhIHR5cGVcbiAgLy9cbiAgcmVtb3RlU3RvcmUuZmluZEFsbCA9IGZ1bmN0aW9uIGZpbmRBbGwodHlwZSkge1xuICAgIHZhciBlbmRrZXksIHBhdGgsIHN0YXJ0a2V5O1xuXG4gICAgcGF0aCA9ICcvX2FsbF9kb2NzP2luY2x1ZGVfZG9jcz10cnVlJztcblxuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2UgKHR5cGUgIT09IHVuZGVmaW5lZCkgJiYgcmVtb3RlLnByZWZpeCAhPT0gJyc6XG4gICAgICBzdGFydGtleSA9IHJlbW90ZS5wcmVmaXggKyB0eXBlICsgJy8nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0eXBlICE9PSB1bmRlZmluZWQ6XG4gICAgICBzdGFydGtleSA9IHR5cGUgKyAnLyc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHJlbW90ZS5wcmVmaXggIT09ICcnOlxuICAgICAgc3RhcnRrZXkgPSByZW1vdGUucHJlZml4O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXJ0a2V5ID0gJyc7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0a2V5KSB7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IG9ubHkgb2JqZWN0cyBzdGFydGluZyB3aXRoXG4gICAgICAvLyBgc3RhcnRrZXlgIHdpbGwgYmUgcmV0dXJuZWRcbiAgICAgIGVuZGtleSA9IHN0YXJ0a2V5LnJlcGxhY2UoLy4kLywgZnVuY3Rpb24oY2hhcnMpIHtcbiAgICAgICAgdmFyIGNoYXJDb2RlO1xuICAgICAgICBjaGFyQ29kZSA9IGNoYXJzLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlICsgMSk7XG4gICAgICB9KTtcbiAgICAgIHBhdGggPSAnJyArIHBhdGggKyAnJnN0YXJ0a2V5PVwiJyArIChlbmNvZGVVUklDb21wb25lbnQoc3RhcnRrZXkpKSArICdcIiZlbmRrZXk9XCInICsgKGVuY29kZVVSSUNvbXBvbmVudChlbmRrZXkpKSArICdcIic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVlc3QoJ0dFVCcsIHBhdGgpLnRoZW4obWFwRG9jc0Zyb21GaW5kQWxsKS50aGVuKHBhcnNlQWxsRnJvbVJlbW90ZSk7XG4gIH07XG5cblxuICAvLyBzYXZlXG4gIC8vIC0tLS0tLVxuXG4gIC8vIHNhdmUgYSBuZXcgb2JqZWN0LiBJZiBpdCBleGlzdGVkIGJlZm9yZSwgYWxsIHByb3BlcnRpZXNcbiAgLy8gd2lsbCBiZSBvdmVyd3JpdHRlblxuICAvL1xuICByZW1vdGVTdG9yZS5zYXZlID0gZnVuY3Rpb24gc2F2ZShvYmplY3QpIHtcbiAgICB2YXIgcGF0aDtcblxuICAgIGlmICghb2JqZWN0LmlkKSB7XG4gICAgICBvYmplY3QuaWQgPSB1dWlkKCk7XG4gICAgfVxuXG4gICAgb2JqZWN0ID0gcGFyc2VGb3JSZW1vdGUob2JqZWN0KTtcbiAgICBwYXRoID0gJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9iamVjdC5faWQpO1xuICAgIHJldHVybiByZXF1ZXN0KCdQVVQnLCBwYXRoLCB7XG4gICAgICBkYXRhOiBvYmplY3RcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vIHJlbW92ZVxuICAvLyAtLS0tLS0tLS1cblxuICAvLyByZW1vdmUgb25lIG9iamVjdFxuICAvL1xuICByZW1vdGVTdG9yZS5yZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUodHlwZSwgaWQpIHtcbiAgICByZXR1cm4gcmVtb3RlLnVwZGF0ZSh0eXBlLCBpZCwge1xuICAgICAgX2RlbGV0ZWQ6IHRydWVcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vIHJlbW92ZUFsbFxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyByZW1vdmUgYWxsIG9iamVjdHMsIGNhbiBiZSBmaWx0ZXJlZCBieSB0eXBlXG4gIC8vXG4gIHJlbW90ZVN0b3JlLnJlbW92ZUFsbCA9IGZ1bmN0aW9uIHJlbW92ZUFsbCh0eXBlKSB7XG4gICAgcmV0dXJuIHJlbW90ZS51cGRhdGVBbGwodHlwZSwge1xuICAgICAgX2RlbGV0ZWQ6IHRydWVcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVtb3RlID0gc3RvcmVBcGkoaG9vZGllLCB7XG5cbiAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG5cbiAgICBiYWNrZW5kOiB7XG4gICAgICBzYXZlOiByZW1vdGVTdG9yZS5zYXZlLFxuICAgICAgZmluZDogcmVtb3RlU3RvcmUuZmluZCxcbiAgICAgIGZpbmRBbGw6IHJlbW90ZVN0b3JlLmZpbmRBbGwsXG4gICAgICByZW1vdmU6IHJlbW90ZVN0b3JlLnJlbW92ZSxcbiAgICAgIHJlbW92ZUFsbDogcmVtb3RlU3RvcmUucmVtb3ZlQWxsXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIHByb3BlcnRpZXNcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gbmFtZVxuXG4gIC8vIHRoZSBuYW1lIG9mIHRoZSBSZW1vdGUgaXMgdGhlIG5hbWUgb2YgdGhlXG4gIC8vIENvdWNoREIgZGF0YWJhc2UgYW5kIGlzIGFsc28gdXNlZCB0byBwcmVmaXhcbiAgLy8gdHJpZ2dlcmVkIGV2ZW50c1xuICAvL1xuICB2YXIgcmVtb3RlTmFtZSA9IG51bGw7XG5cblxuICAvLyBzeW5jXG5cbiAgLy8gaWYgc2V0IHRvIHRydWUsIHVwZGF0ZXMgd2lsbCBiZSBjb250aW51b3VzbHkgcHVsbGVkXG4gIC8vIGFuZCBwdXNoZWQuIEFsdGVybmF0aXZlbHksIGBzeW5jYCBjYW4gYmUgc2V0IHRvXG4gIC8vIGBwdWxsOiB0cnVlYCBvciBgcHVzaDogdHJ1ZWAuXG4gIC8vXG4gIHJlbW90ZS5jb25uZWN0ZWQgPSBmYWxzZTtcblxuXG4gIC8vIHByZWZpeFxuXG4gIC8vcHJlZml4IGZvciBkb2NzIGluIGEgQ291Y2hEQiBkYXRhYmFzZSwgZS5nLiBhbGwgZG9jc1xuICAvLyBpbiBwdWJsaWMgdXNlciBzdG9yZXMgYXJlIHByZWZpeGVkIGJ5ICckcHVibGljLydcbiAgLy9cbiAgcmVtb3RlLnByZWZpeCA9ICcnO1xuXG5cblxuICAvLyBkZWZhdWx0c1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgaWYgKG9wdGlvbnMubmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVtb3RlTmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnByZWZpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVtb3RlLnByZWZpeCA9IG9wdGlvbnMucHJlZml4O1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuYmFzZVVybCAhPT0gbnVsbCkge1xuICAgIHJlbW90ZS5iYXNlVXJsID0gb3B0aW9ucy5iYXNlVXJsO1xuICB9XG5cblxuICAvLyByZXF1ZXN0XG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIHdyYXBwZXIgZm9yIGhvb2RpZS5yZXF1ZXN0LCB3aXRoIHNvbWUgc3RvcmUgc3BlY2lmaWMgZGVmYXVsdHNcbiAgLy8gYW5kIGEgcHJlZml4ZWQgcGF0aFxuICAvL1xuICByZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdCh0eXBlLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBpZiAocmVtb3RlTmFtZSkge1xuICAgICAgcGF0aCA9ICcvJyArIChlbmNvZGVVUklDb21wb25lbnQocmVtb3RlTmFtZSkpICsgcGF0aDtcbiAgICB9XG5cbiAgICBpZiAocmVtb3RlLmJhc2VVcmwpIHtcbiAgICAgIHBhdGggPSAnJyArIHJlbW90ZS5iYXNlVXJsICsgcGF0aDtcbiAgICB9XG5cbiAgICBvcHRpb25zLmNvbnRlbnRUeXBlID0gb3B0aW9ucy5jb250ZW50VHlwZSB8fCAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgICBpZiAodHlwZSA9PT0gJ1BPU1QnIHx8IHR5cGUgPT09ICdQVVQnKSB7XG4gICAgICBvcHRpb25zLmRhdGFUeXBlID0gb3B0aW9ucy5kYXRhVHlwZSB8fCAnanNvbic7XG4gICAgICBvcHRpb25zLnByb2Nlc3NEYXRhID0gb3B0aW9ucy5wcm9jZXNzRGF0YSB8fCBmYWxzZTtcbiAgICAgIG9wdGlvbnMuZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0KHR5cGUsIHBhdGgsIG9wdGlvbnMpO1xuICB9O1xuXG5cbiAgLy8gaXNLbm93bk9iamVjdFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBkZXRlcm1pbmUgYmV0d2VlbiBhIGtub3duIGFuZCBhIG5ldyBvYmplY3RcbiAgLy9cbiAgcmVtb3RlLmlzS25vd25PYmplY3QgPSBmdW5jdGlvbiBpc0tub3duT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBrZXkgPSAnJyArIG9iamVjdC50eXBlICsgJy8nICsgb2JqZWN0LmlkO1xuXG4gICAgaWYgKGtub3duT2JqZWN0c1trZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBrbm93bk9iamVjdHNba2V5XTtcbiAgICB9XG4gIH07XG5cblxuICAvLyBtYXJrQXNLbm93bk9iamVjdFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZGV0ZXJtaW5lIGJldHdlZW4gYSBrbm93biBhbmQgYSBuZXcgb2JqZWN0XG4gIC8vXG4gIHJlbW90ZS5tYXJrQXNLbm93bk9iamVjdCA9IGZ1bmN0aW9uIG1hcmtBc0tub3duT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBrZXkgPSAnJyArIG9iamVjdC50eXBlICsgJy8nICsgb2JqZWN0LmlkO1xuICAgIGtub3duT2JqZWN0c1trZXldID0gMTtcbiAgICByZXR1cm4ga25vd25PYmplY3RzW2tleV07XG4gIH07XG5cblxuICAvLyBzeW5jaHJvbml6YXRpb25cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBDb25uZWN0XG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIHN0YXJ0IHN5bmNpbmcuIGByZW1vdGUuYm9vdHN0cmFwKClgIHdpbGwgYXV0b21hdGljYWxseSBzdGFydFxuICAvLyBwdWxsaW5nIHdoZW4gYHJlbW90ZS5jb25uZWN0ZWRgIHJlbWFpbnMgdHJ1ZS5cbiAgLy9cbiAgcmVtb3RlLmNvbm5lY3QgPSBmdW5jdGlvbiBjb25uZWN0KG5hbWUpIHtcbiAgICBpZiAobmFtZSkge1xuICAgICAgcmVtb3RlTmFtZSA9IG5hbWU7XG4gICAgfVxuICAgIHJlbW90ZS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgIHJlbW90ZS50cmlnZ2VyKCdjb25uZWN0Jyk7IC8vIFRPRE86IHNwZWMgdGhhdFxuICAgIHJldHVybiByZW1vdGUuYm9vdHN0cmFwKCk7XG4gIH07XG5cblxuICAvLyBEaXNjb25uZWN0XG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIHN0b3Agc3luY2luZyBjaGFuZ2VzIGZyb20gcmVtb3RlIHN0b3JlXG4gIC8vXG4gIHJlbW90ZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICByZW1vdGUuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgcmVtb3RlLnRyaWdnZXIoJ2Rpc2Nvbm5lY3QnKTsgLy8gVE9ETzogc3BlYyB0aGF0XG5cbiAgICBpZiAocHVsbFJlcXVlc3QpIHtcbiAgICAgIHB1bGxSZXF1ZXN0LmFib3J0KCk7XG4gICAgfVxuXG4gICAgaWYgKHB1c2hSZXF1ZXN0KSB7XG4gICAgICBwdXNoUmVxdWVzdC5hYm9ydCgpO1xuICAgIH1cblxuICB9O1xuXG5cbiAgLy8gaXNDb25uZWN0ZWRcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIHJlbW90ZS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiByZW1vdGUuY29ubmVjdGVkO1xuICB9O1xuXG5cbiAgLy8gZ2V0U2luY2VOclxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyByZXR1cm5zIHRoZSBzZXF1ZW5jZSBudW1iZXIgZnJvbSB3aWNoIHRvIHN0YXJ0IHRvIGZpbmQgY2hhbmdlcyBpbiBwdWxsXG4gIC8vXG4gIHZhciBzaW5jZSA9IG9wdGlvbnMuc2luY2UgfHwgMDsgLy8gVE9ETzogc3BlYyB0aGF0IVxuICByZW1vdGUuZ2V0U2luY2VOciA9IGZ1bmN0aW9uIGdldFNpbmNlTnIoKSB7XG4gICAgaWYgKHR5cGVvZiBzaW5jZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHNpbmNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbmNlO1xuICB9O1xuXG5cbiAgLy8gYm9vdHN0cmFwXG4gIC8vIC0tLS0tLS0tLS0tXG5cbiAgLy8gaW5pdGFsIHB1bGwgb2YgZGF0YSBvZiB0aGUgcmVtb3RlIHN0b3JlLiBCeSBkZWZhdWx0LCB3ZSBwdWxsIGFsbFxuICAvLyBjaGFuZ2VzIHNpbmNlIHRoZSBiZWdpbm5pbmcsIGJ1dCB0aGlzIGJlaGF2aW9yIG1pZ2h0IGJlIGFkanVzdGVkLFxuICAvLyBlLmcgZm9yIGEgZmlsdGVyZWQgYm9vdHN0cmFwLlxuICAvL1xuICB2YXIgaXNCb290c3RyYXBwaW5nID0gZmFsc2U7XG4gIHJlbW90ZS5ib290c3RyYXAgPSBmdW5jdGlvbiBib290c3RyYXAoKSB7XG4gICAgaXNCb290c3RyYXBwaW5nID0gdHJ1ZTtcbiAgICByZW1vdGUudHJpZ2dlcignYm9vdHN0cmFwOnN0YXJ0Jyk7XG4gICAgcmV0dXJuIHJlbW90ZS5wdWxsKCkuZG9uZSggaGFuZGxlQm9vdHN0cmFwU3VjY2VzcyApO1xuICB9O1xuXG5cbiAgLy8gcHVsbCBjaGFuZ2VzXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gYS5rLmEuIG1ha2UgYSBHRVQgcmVxdWVzdCB0byBDb3VjaERCJ3MgYF9jaGFuZ2VzYCBmZWVkLlxuICAvLyBXZSBjdXJyZW50bHkgbWFrZSBsb25nIHBvbGwgcmVxdWVzdHMsIHRoYXQgd2UgbWFudWFsbHkgYWJvcnRcbiAgLy8gYW5kIHJlc3RhcnQgZWFjaCAyNSBzZWNvbmRzLlxuICAvL1xuICB2YXIgcHVsbFJlcXVlc3QsIHB1bGxSZXF1ZXN0VGltZW91dDtcbiAgcmVtb3RlLnB1bGwgPSBmdW5jdGlvbiBwdWxsKCkge1xuICAgIHB1bGxSZXF1ZXN0ID0gcmVxdWVzdCgnR0VUJywgcHVsbFVybCgpKTtcblxuICAgIGlmIChyZW1vdGUuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dChwdWxsUmVxdWVzdFRpbWVvdXQpO1xuICAgICAgcHVsbFJlcXVlc3RUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQocmVzdGFydFB1bGxSZXF1ZXN0LCAyNTAwMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1bGxSZXF1ZXN0LmRvbmUoaGFuZGxlUHVsbFN1Y2Nlc3MpLmZhaWwoaGFuZGxlUHVsbEVycm9yKTtcbiAgfTtcblxuXG4gIC8vIHB1c2ggY2hhbmdlc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFB1c2ggb2JqZWN0cyB0byByZW1vdGUgc3RvcmUgdXNpbmcgdGhlIGBfYnVsa19kb2NzYCBBUEkuXG4gIC8vXG4gIHZhciBwdXNoUmVxdWVzdDtcbiAgcmVtb3RlLnB1c2ggPSBmdW5jdGlvbiBwdXNoKG9iamVjdHMpIHtcbiAgICB2YXIgb2JqZWN0LCBvYmplY3RzRm9yUmVtb3RlLCBfaSwgX2xlbjtcblxuICAgIGlmICghJC5pc0FycmF5KG9iamVjdHMpKSB7XG4gICAgICBvYmplY3RzID0gZGVmYXVsdE9iamVjdHNUb1B1c2goKTtcbiAgICB9XG5cbiAgICBpZiAob2JqZWN0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZXNvbHZlV2l0aChbXSk7XG4gICAgfVxuXG4gICAgb2JqZWN0c0ZvclJlbW90ZSA9IFtdO1xuXG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmplY3RzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG5cbiAgICAgIC8vIGRvbid0IG1lc3Mgd2l0aCBvcmlnaW5hbCBvYmplY3RzXG4gICAgICBvYmplY3QgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb2JqZWN0c1tfaV0pO1xuICAgICAgYWRkUmV2aXNpb25UbyhvYmplY3QpO1xuICAgICAgb2JqZWN0ID0gcGFyc2VGb3JSZW1vdGUob2JqZWN0KTtcbiAgICAgIG9iamVjdHNGb3JSZW1vdGUucHVzaChvYmplY3QpO1xuICAgIH1cbiAgICBwdXNoUmVxdWVzdCA9IHJlcXVlc3QoJ1BPU1QnLCAnL19idWxrX2RvY3MnLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRvY3M6IG9iamVjdHNGb3JSZW1vdGUsXG4gICAgICAgIG5ld19lZGl0czogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHB1c2hSZXF1ZXN0LmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVtb3RlLnRyaWdnZXIoJ3B1c2gnLCBvYmplY3RzW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcHVzaFJlcXVlc3Q7XG4gIH07XG5cbiAgLy8gc3luYyBjaGFuZ2VzXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gcHVzaCBvYmplY3RzLCB0aGVuIHB1bGwgdXBkYXRlcy5cbiAgLy9cbiAgcmVtb3RlLnN5bmMgPSBmdW5jdGlvbiBzeW5jKG9iamVjdHMpIHtcbiAgICByZXR1cm4gcmVtb3RlLnB1c2gob2JqZWN0cykudGhlbihyZW1vdGUucHVsbCk7XG4gIH07XG5cbiAgLy9cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS1cbiAgLy9cblxuICAvLyBpbiBvcmRlciB0byBkaWZmZXJlbnRpYXRlIHdoZXRoZXIgYW4gb2JqZWN0IGZyb20gcmVtb3RlIHNob3VsZCB0cmlnZ2VyIGEgJ25ldydcbiAgLy8gb3IgYW4gJ3VwZGF0ZScgZXZlbnQsIHdlIHN0b3JlIGEgaGFzaCBvZiBrbm93biBvYmplY3RzXG4gIHZhciBrbm93bk9iamVjdHMgPSB7fTtcblxuXG4gIC8vIHZhbGlkIENvdWNoREIgZG9jIGF0dHJpYnV0ZXMgc3RhcnRpbmcgd2l0aCBhbiB1bmRlcnNjb3JlXG4gIC8vXG4gIHZhciB2YWxpZFNwZWNpYWxBdHRyaWJ1dGVzID0gWydfaWQnLCAnX3JldicsICdfZGVsZXRlZCcsICdfcmV2aXNpb25zJywgJ19hdHRhY2htZW50cyddO1xuXG5cbiAgLy8gZGVmYXVsdCBvYmplY3RzIHRvIHB1c2hcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyB3aGVuIHB1c2hlZCB3aXRob3V0IHBhc3NpbmcgYW55IG9iamVjdHMsIHRoZSBvYmplY3RzIHJldHVybmVkIGZyb21cbiAgLy8gdGhpcyBtZXRob2Qgd2lsbCBiZSBwYXNzZWQuIEl0IGNhbiBiZSBvdmVyd3JpdHRlbiBieSBwYXNzaW5nIGFuXG4gIC8vIGFycmF5IG9mIG9iamVjdHMgb3IgYSBmdW5jdGlvbiBhcyBgb3B0aW9ucy5vYmplY3RzYFxuICAvL1xuICB2YXIgZGVmYXVsdE9iamVjdHNUb1B1c2ggPSBmdW5jdGlvbiBkZWZhdWx0T2JqZWN0c1RvUHVzaCgpIHtcbiAgICByZXR1cm4gW107XG4gIH07XG4gIGlmIChvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoKSB7XG4gICAgaWYgKCQuaXNBcnJheShvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoKSkge1xuICAgICAgZGVmYXVsdE9iamVjdHNUb1B1c2ggPSBmdW5jdGlvbiBkZWZhdWx0T2JqZWN0c1RvUHVzaCgpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGVmYXVsdE9iamVjdHNUb1B1c2g7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZhdWx0T2JqZWN0c1RvUHVzaCA9IG9wdGlvbnMuZGVmYXVsdE9iamVjdHNUb1B1c2g7XG4gICAgfVxuICB9XG5cblxuICAvLyBzZXRTaW5jZU5yXG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIHNldHMgdGhlIHNlcXVlbmNlIG51bWJlciBmcm9tIHdpY2ggdG8gc3RhcnQgdG8gZmluZCBjaGFuZ2VzIGluIHB1bGwuXG4gIC8vIElmIHJlbW90ZSBzdG9yZSB3YXMgaW5pdGlhbGl6ZWQgd2l0aCBzaW5jZSA6IGZ1bmN0aW9uKG5yKSB7IC4uLiB9LFxuICAvLyBjYWxsIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBzZXEgcGFzc2VkLiBPdGhlcndpc2Ugc2ltcGx5IHNldCB0aGUgc2VxXG4gIC8vIG51bWJlciBhbmQgcmV0dXJuIGl0LlxuICAvL1xuICBmdW5jdGlvbiBzZXRTaW5jZU5yKHNlcSkge1xuICAgIGlmICh0eXBlb2Ygc2luY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBzaW5jZShzZXEpO1xuICAgIH1cblxuICAgIHNpbmNlID0gc2VxO1xuICAgIHJldHVybiBzaW5jZTtcbiAgfVxuXG5cbiAgLy8gUGFyc2UgZm9yIHJlbW90ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBwYXJzZSBvYmplY3QgZm9yIHJlbW90ZSBzdG9yYWdlLiBBbGwgcHJvcGVydGllcyBzdGFydGluZyB3aXRoIGFuXG4gIC8vIGB1bmRlcnNjb3JlYCBkbyBub3QgZ2V0IHN5bmNocm9uaXplZCBkZXNwaXRlIHRoZSBzcGVjaWFsIHByb3BlcnRpZXNcbiAgLy8gYF9pZGAsIGBfcmV2YCBhbmQgYF9kZWxldGVkYCAoc2VlIGFib3ZlKVxuICAvL1xuICAvLyBBbHNvIGBpZGAgZ2V0cyByZXBsYWNlZCB3aXRoIGBfaWRgIHdoaWNoIGNvbnNpc3RzIG9mIHR5cGUgJiBpZFxuICAvL1xuICBmdW5jdGlvbiBwYXJzZUZvclJlbW90ZShvYmplY3QpIHtcbiAgICB2YXIgYXR0ciwgcHJvcGVydGllcztcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIG9iamVjdCk7XG5cbiAgICBmb3IgKGF0dHIgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgaWYgKHZhbGlkU3BlY2lhbEF0dHJpYnV0ZXMuaW5kZXhPZihhdHRyKSAhPT0gLTEpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIS9eXy8udGVzdChhdHRyKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBwcm9wZXJ0aWVzW2F0dHJdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHByZXBhcmUgQ291Y2hEQiBpZFxuICAgIHByb3BlcnRpZXMuX2lkID0gJycgKyBwcm9wZXJ0aWVzLnR5cGUgKyAnLycgKyBwcm9wZXJ0aWVzLmlkO1xuICAgIGlmIChyZW1vdGUucHJlZml4KSB7XG4gICAgICBwcm9wZXJ0aWVzLl9pZCA9ICcnICsgcmVtb3RlLnByZWZpeCArIHByb3BlcnRpZXMuX2lkO1xuICAgIH1cbiAgICBkZWxldGUgcHJvcGVydGllcy5pZDtcbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG5cbiAgLy8gIyMjIF9wYXJzZUZyb21SZW1vdGVcblxuICAvLyBub3JtYWxpemUgb2JqZWN0cyBjb21pbmcgZnJvbSByZW1vdGVcbiAgLy9cbiAgLy8gcmVuYW1lcyBgX2lkYCBhdHRyaWJ1dGUgdG8gYGlkYCBhbmQgcmVtb3ZlcyB0aGUgdHlwZSBmcm9tIHRoZSBpZCxcbiAgLy8gZS5nLiBgdHlwZS8xMjNgIC0+IGAxMjNgXG4gIC8vXG4gIGZ1bmN0aW9uIHBhcnNlRnJvbVJlbW90ZShvYmplY3QpIHtcbiAgICB2YXIgaWQsIGlnbm9yZSwgX3JlZjtcblxuICAgIC8vIGhhbmRsZSBpZCBhbmQgdHlwZVxuICAgIGlkID0gb2JqZWN0Ll9pZCB8fCBvYmplY3QuaWQ7XG4gICAgZGVsZXRlIG9iamVjdC5faWQ7XG5cbiAgICBpZiAocmVtb3RlLnByZWZpeCkge1xuICAgICAgaWQgPSBpZC5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgcmVtb3RlLnByZWZpeCksICcnKTtcbiAgICB9XG5cbiAgICAvLyB0dXJuIGRvYy8xMjMgaW50byB0eXBlID0gZG9jICYgaWQgPSAxMjNcbiAgICAvLyBOT1RFOiB3ZSBkb24ndCB1c2UgYSBzaW1wbGUgaWQuc3BsaXQoL1xcLy8pIGhlcmUsXG4gICAgLy8gYXMgaW4gc29tZSBjYXNlcyBJRHMgbWlnaHQgY29udGFpbiAnLycsIHRvb1xuICAgIC8vXG4gICAgX3JlZiA9IGlkLm1hdGNoKC8oW15cXC9dKylcXC8oLiopLyksXG4gICAgaWdub3JlID0gX3JlZlswXSxcbiAgICBvYmplY3QudHlwZSA9IF9yZWZbMV0sXG4gICAgb2JqZWN0LmlkID0gX3JlZlsyXTtcblxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUFsbEZyb21SZW1vdGUob2JqZWN0cykge1xuICAgIHZhciBvYmplY3QsIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgb2JqZWN0ID0gb2JqZWN0c1tfaV07XG4gICAgICBfcmVzdWx0cy5wdXNoKHBhcnNlRnJvbVJlbW90ZShvYmplY3QpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9XG5cblxuICAvLyAjIyMgX2FkZFJldmlzaW9uVG9cblxuICAvLyBleHRlbmRzIHBhc3NlZCBvYmplY3Qgd2l0aCBhIF9yZXYgcHJvcGVydHlcbiAgLy9cbiAgZnVuY3Rpb24gYWRkUmV2aXNpb25UbyhhdHRyaWJ1dGVzKSB7XG4gICAgdmFyIGN1cnJlbnRSZXZJZCwgY3VycmVudFJldk5yLCBuZXdSZXZpc2lvbklkLCBfcmVmO1xuICAgIHRyeSB7XG4gICAgICBfcmVmID0gYXR0cmlidXRlcy5fcmV2LnNwbGl0KC8tLyksXG4gICAgICBjdXJyZW50UmV2TnIgPSBfcmVmWzBdLFxuICAgICAgY3VycmVudFJldklkID0gX3JlZlsxXTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHt9XG4gICAgY3VycmVudFJldk5yID0gcGFyc2VJbnQoY3VycmVudFJldk5yLCAxMCkgfHwgMDtcbiAgICBuZXdSZXZpc2lvbklkID0gZ2VuZXJhdGVOZXdSZXZpc2lvbklkKCk7XG5cbiAgICAvLyBsb2NhbCBjaGFuZ2VzIGFyZSBub3QgbWVhbnQgdG8gYmUgcmVwbGljYXRlZCBvdXRzaWRlIG9mIHRoZVxuICAgIC8vIHVzZXJzIGRhdGFiYXNlLCB0aGVyZWZvcmUgdGhlIGAtbG9jYWxgIHN1ZmZpeC5cbiAgICBpZiAoYXR0cmlidXRlcy5fJGxvY2FsKSB7XG4gICAgICBuZXdSZXZpc2lvbklkICs9ICctbG9jYWwnO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZXMuX3JldiA9ICcnICsgKGN1cnJlbnRSZXZOciArIDEpICsgJy0nICsgbmV3UmV2aXNpb25JZDtcbiAgICBhdHRyaWJ1dGVzLl9yZXZpc2lvbnMgPSB7XG4gICAgICBzdGFydDogMSxcbiAgICAgIGlkczogW25ld1JldmlzaW9uSWRdXG4gICAgfTtcblxuICAgIGlmIChjdXJyZW50UmV2SWQpIHtcbiAgICAgIGF0dHJpYnV0ZXMuX3JldmlzaW9ucy5zdGFydCArPSBjdXJyZW50UmV2TnI7XG4gICAgICByZXR1cm4gYXR0cmlidXRlcy5fcmV2aXNpb25zLmlkcy5wdXNoKGN1cnJlbnRSZXZJZCk7XG4gICAgfVxuICB9XG5cblxuICAvLyAjIyMgZ2VuZXJhdGUgbmV3IHJldmlzaW9uIGlkXG5cbiAgLy9cbiAgZnVuY3Rpb24gZ2VuZXJhdGVOZXdSZXZpc2lvbklkKCkge1xuICAgIHJldHVybiB1dWlkKDkpO1xuICB9XG5cblxuICAvLyAjIyMgbWFwIGRvY3MgZnJvbSBmaW5kQWxsXG5cbiAgLy9cbiAgZnVuY3Rpb24gbWFwRG9jc0Zyb21GaW5kQWxsKHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIHJvdy5kb2M7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vICMjIyBwdWxsIHVybFxuXG4gIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHJlbW90ZSBpcyBjb25uZWN0ZWQgKD0gcHVsbGluZyBjaGFuZ2VzIGNvbnRpbnVvdXNseSlcbiAgLy8gcmV0dXJuIGEgbG9uZ3BvbGwgVVJMIG9yIG5vdC4gSWYgaXQgaXMgYSBiZWdpbm5pbmcgYm9vdHN0cmFwIHJlcXVlc3QsIGRvXG4gIC8vIG5vdCByZXR1cm4gYSBsb25ncG9sbCBVUkwsIGFzIHdlIHdhbnQgaXQgdG8gZmluaXNoIHJpZ2h0IGF3YXksIGV2ZW4gaWYgdGhlcmVcbiAgLy8gYXJlIG5vIGNoYW5nZXMgb24gcmVtb3RlLlxuICAvL1xuICBmdW5jdGlvbiBwdWxsVXJsKCkge1xuICAgIHZhciBzaW5jZTtcbiAgICBzaW5jZSA9IHJlbW90ZS5nZXRTaW5jZU5yKCk7XG4gICAgaWYgKHJlbW90ZS5pc0Nvbm5lY3RlZCgpICYmICFpc0Jvb3RzdHJhcHBpbmcpIHtcbiAgICAgIHJldHVybiAnL19jaGFuZ2VzP2luY2x1ZGVfZG9jcz10cnVlJnNpbmNlPScgKyBzaW5jZSArICcmaGVhcnRiZWF0PTEwMDAwJmZlZWQ9bG9uZ3BvbGwnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy9fY2hhbmdlcz9pbmNsdWRlX2RvY3M9dHJ1ZSZzaW5jZT0nICsgc2luY2U7XG4gICAgfVxuICB9XG5cblxuICAvLyAjIyMgcmVzdGFydCBwdWxsIHJlcXVlc3RcblxuICAvLyByZXF1ZXN0IGdldHMgcmVzdGFydGVkIGF1dG9tYXRpY2NhbGx5XG4gIC8vIHdoZW4gYWJvcnRlZCAoc2VlIEBfaGFuZGxlUHVsbEVycm9yKVxuICBmdW5jdGlvbiByZXN0YXJ0UHVsbFJlcXVlc3QoKSB7XG4gICAgaWYgKHB1bGxSZXF1ZXN0KSB7XG4gICAgICBwdWxsUmVxdWVzdC5hYm9ydCgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIHB1bGwgc3VjY2VzcyBoYW5kbGVyXG5cbiAgLy8gcmVxdWVzdCBnZXRzIHJlc3RhcnRlZCBhdXRvbWF0aWNjYWxseVxuICAvLyB3aGVuIGFib3J0ZWQgKHNlZSBAX2hhbmRsZVB1bGxFcnJvcilcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlUHVsbFN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICBzZXRTaW5jZU5yKHJlc3BvbnNlLmxhc3Rfc2VxKTtcbiAgICBoYW5kbGVQdWxsUmVzdWx0cyhyZXNwb25zZS5yZXN1bHRzKTtcbiAgICBpZiAocmVtb3RlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHJldHVybiByZW1vdGUucHVsbCgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIHB1bGwgZXJyb3IgaGFuZGxlclxuXG4gIC8vIHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2UsIHRyaWdnZXIgZXZlbnQsXG4gIC8vIHRoZW4gY2hlY2sgZm9yIGFub3RoZXIgY2hhbmdlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVB1bGxFcnJvcih4aHIsIGVycm9yKSB7XG4gICAgaWYgKCFyZW1vdGUuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAoeGhyLnN0YXR1cykge1xuICAgICAgLy8gU2Vzc2lvbiBpcyBpbnZhbGlkLiBVc2VyIGlzIHN0aWxsIGxvZ2luLCBidXQgbmVlZHMgdG8gcmVhdXRoZW50aWNhdGVcbiAgICAgIC8vIGJlZm9yZSBzeW5jIGNhbiBiZSBjb250aW51ZWRcbiAgICBjYXNlIDQwMTpcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdlcnJvcjp1bmF1dGhlbnRpY2F0ZWQnLCBlcnJvcik7XG4gICAgICByZXR1cm4gcmVtb3RlLmRpc2Nvbm5lY3QoKTtcblxuICAgICAvLyB0aGUgNDA0IGNvbWVzLCB3aGVuIHRoZSByZXF1ZXN0ZWQgREIgaGFzIGJlZW4gcmVtb3ZlZFxuICAgICAvLyBvciBkb2VzIG5vdCBleGlzdCB5ZXQuXG4gICAgIC8vXG4gICAgIC8vIEJVVDogaXQgbWlnaHQgYWxzbyBoYXBwZW4gdGhhdCB0aGUgYmFja2dyb3VuZCB3b3JrZXJzIGRpZFxuICAgICAvLyAgICAgIG5vdCBjcmVhdGUgYSBwZW5kaW5nIGRhdGFiYXNlIHlldC4gVGhlcmVmb3JlLFxuICAgICAvLyAgICAgIHdlIHRyeSBpdCBhZ2FpbiBpbiAzIHNlY29uZHNcbiAgICAgLy9cbiAgICAgLy8gVE9ETzogcmV2aWV3IC8gcmV0aGluayB0aGF0LlxuICAgICAvL1xuXG4gICAgY2FzZSA0MDQ6XG4gICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQocmVtb3RlLnB1bGwsIDMwMDApO1xuXG4gICAgY2FzZSA1MDA6XG4gICAgICAvL1xuICAgICAgLy8gUGxlYXNlIHNlcnZlciwgZG9uJ3QgZ2l2ZSB1cyB0aGVzZS4gQXQgbGVhc3Qgbm90IHBlcnNpc3RlbnRseVxuICAgICAgLy9cbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdlcnJvcjpzZXJ2ZXInLCBlcnJvcik7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChyZW1vdGUucHVsbCwgMzAwMCk7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbi5jaGVja0Nvbm5lY3Rpb24oKTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gdXN1YWxseSBhIDAsIHdoaWNoIHN0YW5kcyBmb3IgdGltZW91dCBvciBzZXJ2ZXIgbm90IHJlYWNoYWJsZS5cbiAgICAgIGlmICh4aHIuc3RhdHVzVGV4dCA9PT0gJ2Fib3J0Jykge1xuICAgICAgICAvLyBtYW51YWwgYWJvcnQgYWZ0ZXIgMjVzZWMuIHJlc3RhcnQgcHVsbGluZyBjaGFuZ2VzIGRpcmVjdGx5IHdoZW4gY29ubmVjdGVkXG4gICAgICAgIHJldHVybiByZW1vdGUucHVsbCgpO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBvb3BzLiBUaGlzIG1pZ2h0IGJlIGNhdXNlZCBieSBhbiB1bnJlYWNoYWJsZSBzZXJ2ZXIuXG4gICAgICAgIC8vIE9yIHRoZSBzZXJ2ZXIgY2FuY2VsbGVkIGl0IGZvciB3aGF0IGV2ZXIgcmVhc29uLCBlLmcuXG4gICAgICAgIC8vIGhlcm9rdSBraWxscyB0aGUgcmVxdWVzdCBhZnRlciB+MzBzLlxuICAgICAgICAvLyB3ZSdsbCB0cnkgYWdhaW4gYWZ0ZXIgYSAzcyB0aW1lb3V0XG4gICAgICAgIC8vXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHJlbW90ZS5wdWxsLCAzMDAwKTtcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24uY2hlY2tDb25uZWN0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvLyAjIyMgaGFuZGxlIGNoYW5nZXMgZnJvbSByZW1vdGVcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlQm9vdHN0cmFwU3VjY2VzcygpIHtcbiAgICBpc0Jvb3RzdHJhcHBpbmcgPSBmYWxzZTtcbiAgICByZW1vdGUudHJpZ2dlcignYm9vdHN0cmFwOmVuZCcpO1xuICB9XG5cbiAgLy8gIyMjIGhhbmRsZSBjaGFuZ2VzIGZyb20gcmVtb3RlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVB1bGxSZXN1bHRzKGNoYW5nZXMpIHtcbiAgICB2YXIgZG9jLCBldmVudCwgb2JqZWN0LCBfaSwgX2xlbjtcblxuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gY2hhbmdlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgZG9jID0gY2hhbmdlc1tfaV0uZG9jO1xuXG4gICAgICBpZiAocmVtb3RlLnByZWZpeCAmJiBkb2MuX2lkLmluZGV4T2YocmVtb3RlLnByZWZpeCkgIT09IDApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIG9iamVjdCA9IHBhcnNlRnJvbVJlbW90ZShkb2MpO1xuXG4gICAgICBpZiAob2JqZWN0Ll9kZWxldGVkKSB7XG4gICAgICAgIGlmICghcmVtb3RlLmlzS25vd25PYmplY3Qob2JqZWN0KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50ID0gJ3JlbW92ZSc7XG4gICAgICAgIHJlbW90ZS5pc0tub3duT2JqZWN0KG9iamVjdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVtb3RlLmlzS25vd25PYmplY3Qob2JqZWN0KSkge1xuICAgICAgICAgIGV2ZW50ID0gJ3VwZGF0ZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQgPSAnYWRkJztcbiAgICAgICAgICByZW1vdGUubWFya0FzS25vd25PYmplY3Qob2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZW1vdGUudHJpZ2dlcihldmVudCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKGV2ZW50ICsgJzonICsgb2JqZWN0LnR5cGUsIG9iamVjdCk7XG4gICAgICByZW1vdGUudHJpZ2dlcihldmVudCArICc6JyArIG9iamVjdC50eXBlICsgJzonICsgb2JqZWN0LmlkLCBvYmplY3QpO1xuICAgICAgcmVtb3RlLnRyaWdnZXIoJ2NoYW5nZScsIGV2ZW50LCBvYmplY3QpO1xuICAgICAgcmVtb3RlLnRyaWdnZXIoJ2NoYW5nZTonICsgb2JqZWN0LnR5cGUsIGV2ZW50LCBvYmplY3QpO1xuICAgICAgcmVtb3RlLnRyaWdnZXIoJ2NoYW5nZTonICsgb2JqZWN0LnR5cGUgKyAnOicgKyBvYmplY3QuaWQsIGV2ZW50LCBvYmplY3QpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gYm9vdHN0cmFwIGtub3duIG9iamVjdHNcbiAgLy9cbiAgaWYgKG9wdGlvbnMua25vd25PYmplY3RzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb25zLmtub3duT2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVtb3RlLm1hcmtBc0tub3duT2JqZWN0KHtcbiAgICAgICAgdHlwZTogb3B0aW9ucy5rbm93bk9iamVjdHNbaV0udHlwZSxcbiAgICAgICAgaWQ6IG9wdGlvbnMua25vd25PYmplY3RzW2ldLmlkXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGV4cG9zZSBwdWJsaWMgQVBJXG4gIHJldHVybiByZW1vdGU7XG59O1xuIiwiLyogZXhwb3J0ZWQgaG9vZGllUmVxdWVzdCAqL1xuXG4vL1xuLy8gaG9vZGllLnJlcXVlc3Rcbi8vID09PT09PT09PT09PT09PT1cblxuLy9cbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXG4gIHZhciAkZXh0ZW5kID0gJC5leHRlbmQ7XG4gIHZhciAkYWpheCA9ICQuYWpheDtcblxuICAvLyBIb29kaWUgYmFja2VuZCBsaXN0ZW50cyB0byByZXF1ZXN0cyBwcmVmaXhlZCBieSAvX2FwaSxcbiAgLy8gc28gd2UgcHJlZml4IGFsbCByZXF1ZXN0cyB3aXRoIHJlbGF0aXZlIFVSTHNcbiAgdmFyIEFQSV9QQVRIID0gJy9fYXBpJztcblxuICAvLyBSZXF1ZXN0c1xuICAvLyAtLS0tLS0tLS0tXG5cbiAgLy8gc2VuZHMgcmVxdWVzdHMgdG8gdGhlIGhvb2RpZSBiYWNrZW5kLlxuICAvL1xuICAvLyAgICAgcHJvbWlzZSA9IGhvb2RpZS5yZXF1ZXN0KCdHRVQnLCAnL3VzZXJfZGF0YWJhc2UvZG9jX2lkJylcbiAgLy9cbiAgZnVuY3Rpb24gcmVxdWVzdCh0eXBlLCB1cmwsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdHMsIHJlcXVlc3RQcm9taXNlLCBwaXBlZFByb21pc2U7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICB9O1xuXG4gICAgLy8gaWYgYWJzb2x1dGUgcGF0aCBwYXNzZWQsIHNldCBDT1JTIGhlYWRlcnNcblxuICAgIC8vIGlmIHJlbGF0aXZlIHBhdGggcGFzc2VkLCBwcmVmaXggd2l0aCBiYXNlVXJsXG4gICAgaWYgKCEvXmh0dHAvLnRlc3QodXJsKSkge1xuICAgICAgdXJsID0gKHRoaXMuYmFzZVVybCB8fCAnJykgKyBBUElfUEFUSCArIHVybDtcbiAgICB9XG5cbiAgICAvLyBpZiB1cmwgaXMgY3Jvc3MgZG9tYWluLCBzZXQgQ09SUyBoZWFkZXJzXG4gICAgaWYgKC9eaHR0cC8udGVzdCh1cmwpKSB7XG4gICAgICBkZWZhdWx0cy54aHJGaWVsZHMgPSB7XG4gICAgICAgIHdpdGhDcmVkZW50aWFsczogdHJ1ZVxuICAgICAgfTtcbiAgICAgIGRlZmF1bHRzLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZWZhdWx0cy51cmwgPSB1cmw7XG5cblxuICAgIC8vIHdlIGFyZSBwaXBpbmcgdGhlIHJlc3VsdCBvZiB0aGUgcmVxdWVzdCB0byByZXR1cm4gYSBuaWNlclxuICAgIC8vIGVycm9yIGlmIHRoZSByZXF1ZXN0IGNhbm5vdCByZWFjaCB0aGUgc2VydmVyIGF0IGFsbC5cbiAgICAvLyBXZSBjYW4ndCByZXR1cm4gdGhlIHByb21pc2Ugb2YgYWpheCBkaXJlY3RseSBiZWNhdXNlIG9mXG4gICAgLy8gdGhlIHBpcGluZywgYXMgZm9yIHdoYXRldmVyIHJlYXNvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgIC8vIGRvZXMgbm90IGhhdmUgdGhlIGBhYm9ydGAgbWV0aG9kIGFueSBtb3JlLCBtYXliZSBvdGhlcnNcbiAgICAvLyBhcyB3ZWxsLiBTZWUgYWxzbyBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDEwNFxuICAgIHJlcXVlc3RQcm9taXNlID0gJGFqYXgoJGV4dGVuZChkZWZhdWx0cywgb3B0aW9ucykpO1xuICAgIHBpcGVkUHJvbWlzZSA9IHJlcXVlc3RQcm9taXNlLnRoZW4oIG51bGwsIHBpcGVSZXF1ZXN0RXJyb3IpO1xuICAgIHBpcGVkUHJvbWlzZS5hYm9ydCA9IHJlcXVlc3RQcm9taXNlLmFib3J0O1xuXG4gICAgcmV0dXJuIHBpcGVkUHJvbWlzZTtcbiAgfVxuXG4gIC8vXG4gIC8vXG4gIC8vXG4gIGZ1bmN0aW9uIHBpcGVSZXF1ZXN0RXJyb3IoeGhyKSB7XG4gICAgdmFyIGVycm9yO1xuXG4gICAgdHJ5IHtcbiAgICAgIGVycm9yID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIGVycm9yID0ge1xuICAgICAgICBlcnJvcjogeGhyLnJlc3BvbnNlVGV4dCB8fCAoJ0Nhbm5vdCBjb25uZWN0IHRvIEhvb2RpZSBzZXJ2ZXIgYXQgJyArICh0aGlzLmJhc2VVcmwgfHwgJy8nKSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoZXJyb3IpLnByb21pc2UoKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gcHVibGljIEFQSVxuICAvL1xuICByZXR1cm4gcmVxdWVzdDtcbn0oKSk7XG4iLCJcbi8vIHNjb3BlZCBTdG9yZVxuLy8gPT09PT09PT09PT09XG5cbi8vIHNhbWUgYXMgc3RvcmUsIGJ1dCB3aXRoIHR5cGUgcHJlc2V0IHRvIGFuIGluaXRpYWxseVxuLy8gcGFzc2VkIHZhbHVlLlxuLy9cbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUsIG9wdGlvbnMpIHtcblxuICAvLyBuYW1lXG4gIHZhciBzdG9yZU5hbWU7XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoIXRoaXMub3B0aW9ucy5uYW1lKSB7XG4gICAgc3RvcmVOYW1lID0gJ3N0b3JlJztcbiAgfSBlbHNlIHtcbiAgICBzdG9yZU5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZTtcbiAgfVxuXG4gIHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuICB2YXIgaWQgPSBvcHRpb25zLmlkO1xuXG4gIHZhciBhcGkgPSB7fTtcblxuICAvLyBzY29wZWQgYnkgdHlwZSBvbmx5XG4gIGlmICghaWQpIHtcblxuICAgIC8vIGFkZCBldmVudHNcbiAgICBldmVudHMoe1xuICAgICAgY29udGV4dDogYXBpLFxuICAgICAgbmFtZXNwYWNlOiBzdG9yZU5hbWUgKyAnOicgKyB0eXBlXG4gICAgfSk7XG5cbiAgICAvL1xuICAgIGFwaS5zYXZlID0gZnVuY3Rpb24gc2F2ZShpZCwgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5zYXZlKHR5cGUsIGlkLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuYWRkID0gZnVuY3Rpb24gYWRkKHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuYWRkKHR5cGUsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5maW5kID0gZnVuY3Rpb24gZmluZChpZCkge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5maW5kKHR5cGUsIGlkKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuZmluZE9yQWRkID0gZnVuY3Rpb24gZmluZE9yQWRkKGlkLCBwcm9wZXJ0aWVzKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmZpbmRPckFkZCh0eXBlLCBpZCwgcHJvcGVydGllcyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmZpbmRBbGwgPSBmdW5jdGlvbiBmaW5kQWxsKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuZmluZEFsbCh0eXBlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUudXBkYXRlKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVBbGwob2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnVwZGF0ZUFsbCh0eXBlLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5yZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUoaWQsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUucmVtb3ZlKHR5cGUsIGlkLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVtb3ZlQWxsID0gZnVuY3Rpb24gcmVtb3ZlQWxsKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUucmVtb3ZlQWxsKHR5cGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgfVxuXG4gIC8vIHNjb3BlZCBieSBib3RoOiB0eXBlICYgaWRcbiAgaWYgKGlkKSB7XG5cbiAgICAvLyBhZGQgZXZlbnRzXG4gICAgZXZlbnRzKHtcbiAgICAgIGNvbnRleHQ6IGFwaSxcbiAgICAgIG5hbWVzcGFjZTogc3RvcmVOYW1lICsgJzonICsgdHlwZSArICc6JyArIGlkXG4gICAgfSk7XG5cbiAgICAvL1xuICAgIGFwaS5zYXZlID0gZnVuY3Rpb24gc2F2ZShwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnNhdmUodHlwZSwgaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5maW5kID0gZnVuY3Rpb24gZmluZCgpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuZmluZCh0eXBlLCBpZCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShvYmplY3RVcGRhdGUsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUudXBkYXRlKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5yZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUob3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5yZW1vdmUodHlwZSwgaWQsIG9wdGlvbnMpO1xuICAgIH07XG4gIH1cblxuICAvL1xuICBhcGkuZGVjb3JhdGVQcm9taXNlcyA9IGhvb2RpZS5zdG9yZS5kZWNvcmF0ZVByb21pc2VzO1xuICBhcGkudmFsaWRhdGUgPSBob29kaWUuc3RvcmUudmFsaWRhdGU7XG5cbiAgcmV0dXJuIGFwaTtcblxufTtcbiIsIi8vIHNjb3BlZCBTdG9yZVxuLy8gPT09PT09PT09PT09XG5cbi8vIHNhbWUgYXMgc3RvcmUsIGJ1dCB3aXRoIHR5cGUgcHJlc2V0IHRvIGFuIGluaXRpYWxseVxuLy8gcGFzc2VkIHZhbHVlLlxuXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaG9vZGllLCB0YXNrQXBpLCBvcHRpb25zKSB7XG5cbiAgdmFyIHR5cGUgPSBvcHRpb25zLnR5cGU7XG4gIHZhciBpZCA9IG9wdGlvbnMuaWQ7XG5cbiAgdmFyIGFwaSA9IHt9O1xuXG4gIC8vIHNjb3BlZCBieSB0eXBlIG9ubHlcbiAgaWYgKCFpZCkge1xuXG4gICAgLy8gYWRkIGV2ZW50c1xuICAgIGV2ZW50cyh7XG4gICAgICBjb250ZXh0OiBhcGksXG4gICAgICBuYW1lc3BhY2U6ICd0YXNrOicgKyB0eXBlXG4gICAgfSk7XG5cbiAgICAvL1xuICAgIGFwaS5zdGFydCA9IGZ1bmN0aW9uIHN0YXJ0KHByb3BlcnRpZXMpIHtcbiAgICAgIHJldHVybiB0YXNrQXBpLnN0YXJ0KHR5cGUsIHByb3BlcnRpZXMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5jYW5jZWwgPSBmdW5jdGlvbiBjYW5jZWwoaWQpIHtcbiAgICAgIHJldHVybiB0YXNrQXBpLmNhbmNlbCh0eXBlLCBpZCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnJlc3RhcnQgPSBmdW5jdGlvbiByZXN0YXJ0KGlkLCB1cGRhdGUpIHtcbiAgICAgIHJldHVybiB0YXNrQXBpLnJlc3RhcnQodHlwZSwgaWQsIHVwZGF0ZSk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmNhbmNlbEFsbCA9IGZ1bmN0aW9uIGNhbmNlbEFsbCgpIHtcbiAgICAgIHJldHVybiB0YXNrQXBpLmNhbmNlbEFsbCh0eXBlKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVzdGFydEFsbCA9IGZ1bmN0aW9uIHJlc3RhcnRBbGwodXBkYXRlKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5yZXN0YXJ0QWxsKHR5cGUsIHVwZGF0ZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHNjb3BlZCBieSBib3RoOiB0eXBlICYgaWRcbiAgaWYgKGlkKSB7XG5cbiAgICAvLyBhZGQgZXZlbnRzXG4gICAgZXZlbnRzKHtcbiAgICAgIGNvbnRleHQ6IGFwaSxcbiAgICAgIG5hbWVzcGFjZTogJ3Rhc2s6JyArIHR5cGUgKyAnOicgKyBpZFxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuY2FuY2VsID0gZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgcmV0dXJuIHRhc2tBcGkuY2FuY2VsKHR5cGUsIGlkKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVzdGFydCA9IGZ1bmN0aW9uIHJlc3RhcnQodXBkYXRlKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5yZXN0YXJ0KHR5cGUsIGlkLCB1cGRhdGUpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gYXBpO1xufTtcbiIsIi8vIFN0b3JlXG4vLyA9PT09PT09PT09PT1cblxuLy8gVGhpcyBjbGFzcyBkZWZpbmVzIHRoZSBBUEkgdGhhdCBob29kaWUuc3RvcmUgKGxvY2FsIHN0b3JlKSBhbmQgaG9vZGllLm9wZW5cbi8vIChyZW1vdGUgc3RvcmUpIGltcGxlbWVudCB0byBhc3N1cmUgYSBjb2hlcmVudCBBUEkuIEl0IGFsc28gaW1wbGVtZW50cyBzb21lXG4vLyBiYXNpYyB2YWxpZGF0aW9ucy5cbi8vXG4vLyBUaGUgcmV0dXJuZWQgQVBJIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgbWV0aG9kczpcbi8vXG4vLyAqIHZhbGlkYXRlXG4vLyAqIHNhdmVcbi8vICogYWRkXG4vLyAqIGZpbmRcbi8vICogZmluZE9yQWRkXG4vLyAqIGZpbmRBbGxcbi8vICogdXBkYXRlXG4vLyAqIHVwZGF0ZUFsbFxuLy8gKiByZW1vdmVcbi8vICogcmVtb3ZlQWxsXG4vLyAqIGRlY29yYXRlUHJvbWlzZXNcbi8vICogdHJpZ2dlclxuLy8gKiBvblxuLy8gKiB1bmJpbmRcbi8vXG4vLyBBdCB0aGUgc2FtZSB0aW1lLCB0aGUgcmV0dXJuZWQgQVBJIGNhbiBiZSBjYWxsZWQgYXMgZnVuY3Rpb24gcmV0dXJuaW5nIGFcbi8vIHN0b3JlIHNjb3BlZCBieSB0aGUgcGFzc2VkIHR5cGUsIGZvciBleGFtcGxlXG4vL1xuLy8gICAgIHZhciB0YXNrU3RvcmUgPSBob29kaWUuc3RvcmUoJ3Rhc2snKTtcbi8vICAgICB0YXNrU3RvcmUuZmluZEFsbCgpLnRoZW4oIHNob3dBbGxUYXNrcyApO1xuLy8gICAgIHRhc2tTdG9yZS51cGRhdGUoJ2lkMTIzJywge2RvbmU6IHRydWV9KTtcbi8vXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcbnZhciBzY29wZWRTdG9yZSA9IHJlcXVpcmUoJy4vc2NvcGVkX3N0b3JlJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaG9vZGllLCBvcHRpb25zKSB7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gcGVyc2lzdGFuY2UgbG9naWNcbiAgdmFyIGJhY2tlbmQgPSB7fTtcblxuICAvLyBleHRlbmQgdGhpcyBwcm9wZXJ0eSB3aXRoIGV4dHJhIGZ1bmN0aW9ucyB0aGF0IHdpbGwgYmUgYXZhaWxhYmxlXG4gIC8vIG9uIGFsbCBwcm9taXNlcyByZXR1cm5lZCBieSBob29kaWUuc3RvcmUgQVBJLiBJdCBoYXMgYSByZWZlcmVuY2VcbiAgLy8gdG8gY3VycmVudCBob29kaWUgaW5zdGFuY2UgYnkgZGVmYXVsdFxuICB2YXIgcHJvbWlzZUFwaSA9IHtcbiAgICBob29kaWU6IGhvb2RpZVxuICB9O1xuXG4gIHZhciBzdG9yZU5hbWU7XG5cbiAgaWYgKCF0aGlzLm9wdGlvbnMubmFtZSkge1xuICAgIHN0b3JlTmFtZSA9ICdzdG9yZSc7XG4gIH0gZWxzZSB7XG4gICAgc3RvcmVOYW1lID0gdGhpcy5vcHRpb25zLm5hbWU7XG4gIH1cblxuICB2YXIgYXBpID0ge307XG5cbiAgdmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbiAgdXRpbC5pbmhlcml0cyhhcGksIGZ1bmN0aW9uIGFwaSh0eXBlLCBpZCkge1xuXG4gICAgdmFyIHNjb3BlZE9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaWQ6IGlkXG4gICAgfSwgc2VsZi5vcHRpb25zKTtcblxuICAgIHJldHVybiBzY29wZWRTdG9yZS5jYWxsKHRoaXMsIGhvb2RpZSwgYXBpLCBzY29wZWRPcHRpb25zKTtcbiAgfSk7XG5cbiAgLy8gYWRkIGV2ZW50IEFQSVxuICBldmVudHMoe1xuICAgIGNvbnRleHQ6IGFwaSxcbiAgICBuYW1lc3BhY2U6IHN0b3JlTmFtZVxuICB9KTtcblxuXG4gIC8vIFZhbGlkYXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gYnkgZGVmYXVsdCwgd2Ugb25seSBjaGVjayBmb3IgYSB2YWxpZCB0eXBlICYgaWQuXG4gIC8vIHRoZSB2YWxpZGF0ZSBtZXRob2QgY2FuIGJlIG92ZXJ3cml0ZW4gYnkgcGFzc2luZ1xuICAvLyBvcHRpb25zLnZhbGlkYXRlXG4gIC8vXG4gIC8vIGlmIGB2YWxpZGF0ZWAgcmV0dXJucyBub3RoaW5nLCB0aGUgcGFzc2VkIG9iamVjdCBpc1xuICAvLyB2YWxpZC4gT3RoZXJ3aXNlIGl0IHJldHVybnMgYW4gZXJyb3JcbiAgLy9cbiAgYXBpLnZhbGlkYXRlID0gZnVuY3Rpb24ob2JqZWN0IC8qLCBvcHRpb25zICovKSB7XG5cbiAgICBpZiAoIW9iamVjdC5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghb2JqZWN0KSB7XG4gICAgICByZXR1cm4gZXJyb3JzLklOVkFMSURfQVJHVU1FTlRTKCdubyBvYmplY3QgcGFzc2VkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1ZhbGlkVHlwZShvYmplY3QudHlwZSkpIHtcbiAgICAgIHJldHVybiBlcnJvcnMuSU5WQUxJRF9LRVkoe1xuICAgICAgICB0eXBlOiBvYmplY3QudHlwZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1ZhbGlkSWQob2JqZWN0LmlkKSkge1xuICAgICAgcmV0dXJuIGVycm9ycy5JTlZBTElEX0tFWSh7XG4gICAgICAgIGlkOiBvYmplY3QuaWRcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIFNhdmVcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBjcmVhdGVzIG9yIHJlcGxhY2VzIGFuIGFuIGV2ZW50dWFsbHkgZXhpc3Rpbmcgb2JqZWN0IGluIHRoZSBzdG9yZVxuICAvLyB3aXRoIHNhbWUgdHlwZSAmIGlkLlxuICAvL1xuICAvLyBXaGVuIGlkIGlzIHVuZGVmaW5lZCwgaXQgZ2V0cyBnZW5lcmF0ZWQgYW5kIGEgbmV3IG9iamVjdCBnZXRzIHNhdmVkXG4gIC8vXG4gIC8vIGV4YW1wbGUgdXNhZ2U6XG4gIC8vXG4gIC8vICAgICBzdG9yZS5zYXZlKCdjYXInLCB1bmRlZmluZWQsIHtjb2xvcjogJ3JlZCd9KVxuICAvLyAgICAgc3RvcmUuc2F2ZSgnY2FyJywgJ2FiYzQ1NjcnLCB7Y29sb3I6ICdyZWQnfSlcbiAgLy9cbiAgYXBpLnNhdmUgPSBmdW5jdGlvbiAodHlwZSwgaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgLy8gZG9uJ3QgbWVzcyB3aXRoIHBhc3NlZCBvYmplY3RcbiAgICB2YXIgb2JqZWN0ID0gJC5leHRlbmQodHJ1ZSwge30sIHByb3BlcnRpZXMsIHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBpZDogaWRcbiAgICB9KTtcblxuICAgIC8vIHZhbGlkYXRpb25zXG4gICAgdmFyIGVycm9yID0gYXBpLnZhbGlkYXRlKG9iamVjdCwgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiByZWplY3RXaXRoKGVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKGJhY2tlbmQuc2F2ZShvYmplY3QsIG9wdGlvbnMgfHwge30pKTtcbiAgfTtcblxuXG4gIC8vIEFkZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gYC5hZGRgIGlzIGFuIGFsaWFzIGZvciBgLnNhdmVgLCB3aXRoIHRoZSBkaWZmZXJlbmNlIHRoYXQgdGhlcmUgaXMgbm8gaWQgYXJndW1lbnQuXG4gIC8vIEludGVybmFsbHkgaXQgc2ltcGx5IGNhbGxzIGAuc2F2ZSh0eXBlLCB1bmRlZmluZWQsIG9iamVjdCkuXG4gIC8vXG4gIGFwaS5hZGQgPSBmdW5jdGlvbiAodHlwZSwgcHJvcGVydGllcywgb3B0aW9ucykge1xuXG4gICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICByZXR1cm4gYXBpLnNhdmUodHlwZSwgcHJvcGVydGllcy5pZCwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gIH07XG5cblxuICAvLyBmaW5kXG4gIC8vIC0tLS0tLVxuXG4gIC8vXG4gIGFwaS5maW5kID0gZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLmZpbmQodHlwZSwgaWQpKTtcbiAgfTtcblxuXG4gIC8vIGZpbmQgb3IgYWRkXG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvLyAxLiBUcnkgdG8gZmluZCBhIHNoYXJlIGJ5IGdpdmVuIGlkXG4gIC8vIDIuIElmIHNoYXJlIGNvdWxkIGJlIGZvdW5kLCByZXR1cm4gaXRcbiAgLy8gMy4gSWYgbm90LCBhZGQgb25lIGFuZCByZXR1cm4gaXQuXG4gIC8vXG4gIGFwaS5maW5kT3JBZGQgPSBmdW5jdGlvbiAodHlwZSwgaWQsIHByb3BlcnRpZXMpIHtcblxuICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlTm90Rm91bmQoKSB7XG4gICAgICB2YXIgbmV3UHJvcGVydGllcyA9ICQuZXh0ZW5kKHRydWUsIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9LCBwcm9wZXJ0aWVzKTtcblxuICAgICAgcmV0dXJuIGFwaS5hZGQodHlwZSwgbmV3UHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLy8gcHJvbWlzZSBkZWNvcmF0aW9ucyBnZXQgbG9zdCB3aGVuIHBpcGVkIHRocm91Z2ggYHRoZW5gLFxuICAgIC8vIHRoYXQncyB3aHkgd2UgbmVlZCB0byBkZWNvcmF0ZSB0aGUgZmluZCdzIHByb21pc2UgYWdhaW4uXG4gICAgdmFyIHByb21pc2UgPSBhcGkuZmluZCh0eXBlLCBpZCkudGhlbihudWxsLCBoYW5kbGVOb3RGb3VuZCk7XG5cbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9O1xuXG5cbiAgLy8gZmluZEFsbFxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyByZXR1cm5zIGFsbCBvYmplY3RzIGZyb20gc3RvcmUuXG4gIC8vIENhbiBiZSBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgdHlwZSBvciBhIGZ1bmN0aW9uXG4gIC8vXG4gIGFwaS5maW5kQWxsID0gZnVuY3Rpb24gKHR5cGUsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKGJhY2tlbmQuZmluZEFsbCh0eXBlLCBvcHRpb25zKSk7XG4gIH07XG5cblxuICAvLyBVcGRhdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEluIGNvbnRyYXN0IHRvIGAuc2F2ZWAsIHRoZSBgLnVwZGF0ZWAgbWV0aG9kIGRvZXMgbm90IHJlcGxhY2UgdGhlIHN0b3JlZCBvYmplY3QsXG4gIC8vIGJ1dCBvbmx5IGNoYW5nZXMgdGhlIHBhc3NlZCBhdHRyaWJ1dGVzIG9mIGFuIGV4c3Rpbmcgb2JqZWN0LCBpZiBpdCBleGlzdHNcbiAgLy9cbiAgLy8gYm90aCBhIGhhc2ggb2Yga2V5L3ZhbHVlcyBvciBhIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyB0aGUgdXBkYXRlIHRvIHRoZSBwYXNzZWRcbiAgLy8gb2JqZWN0IGNhbiBiZSBwYXNzZWQuXG4gIC8vXG4gIC8vIGV4YW1wbGUgdXNhZ2VcbiAgLy9cbiAgLy8gaG9vZGllLnN0b3JlLnVwZGF0ZSgnY2FyJywgJ2FiYzQ1NjcnLCB7c29sZDogdHJ1ZX0pXG4gIC8vIGhvb2RpZS5zdG9yZS51cGRhdGUoJ2NhcicsICdhYmM0NTY3JywgZnVuY3Rpb24ob2JqKSB7IG9iai5zb2xkID0gdHJ1ZSB9KVxuICAvL1xuICBhcGkudXBkYXRlID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpIHtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUZvdW5kKGN1cnJlbnRPYmplY3QpIHtcbiAgICAgIHZhciBjaGFuZ2VkUHJvcGVydGllcywgbmV3T2JqLCB2YWx1ZTtcblxuICAgICAgLy8gbm9ybWFsaXplIGlucHV0XG4gICAgICBuZXdPYmogPSAkLmV4dGVuZCh0cnVlLCB7fSwgY3VycmVudE9iamVjdCk7XG5cbiAgICAgIGlmICh0eXBlb2Ygb2JqZWN0VXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9iamVjdFVwZGF0ZSA9IG9iamVjdFVwZGF0ZShuZXdPYmopO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW9iamVjdFVwZGF0ZSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZVdpdGgoY3VycmVudE9iamVjdCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGlmIHNvbWV0aGluZyBjaGFuZ2VkXG4gICAgICBjaGFuZ2VkUHJvcGVydGllcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9yZXN1bHRzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdFVwZGF0ZSkge1xuICAgICAgICAgIGlmIChvYmplY3RVcGRhdGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgdmFsdWUgPSBvYmplY3RVcGRhdGVba2V5XTtcbiAgICAgICAgICAgIGlmICgoY3VycmVudE9iamVjdFtrZXldICE9PSB2YWx1ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBmb3IgdW5kZWZpbmVkIHZhbHVlcywgYXMgJC5leHRlbmQgaWdub3JlcyB0aGVzZVxuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKTtcblxuICAgICAgaWYgKCEoY2hhbmdlZFByb3BlcnRpZXMubGVuZ3RoIHx8IG9wdGlvbnMpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlV2l0aChuZXdPYmopO1xuICAgICAgfVxuXG4gICAgICAvL2FwcGx5IHVwZGF0ZVxuICAgICAgcmV0dXJuIGFwaS5zYXZlKHR5cGUsIGlkLCBuZXdPYmosIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIHByb21pc2UgZGVjb3JhdGlvbnMgZ2V0IGxvc3Qgd2hlbiBwaXBlZCB0aHJvdWdoIGB0aGVuYCxcbiAgICAvLyB0aGF0J3Mgd2h5IHdlIG5lZWQgdG8gZGVjb3JhdGUgdGhlIGZpbmQncyBwcm9taXNlIGFnYWluLlxuICAgIHZhciBwcm9taXNlID0gYXBpLmZpbmQodHlwZSwgaWQpLnRoZW4oaGFuZGxlRm91bmQpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH07XG5cblxuICAvLyB1cGRhdGVPckFkZFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gc2FtZSBhcyBgLnVwZGF0ZSgpYCwgYnV0IGluIGNhc2UgdGhlIG9iamVjdCBjYW5ub3QgYmUgZm91bmQsXG4gIC8vIGl0IGdldHMgY3JlYXRlZFxuICAvL1xuICBhcGkudXBkYXRlT3JBZGQgPSBmdW5jdGlvbiAodHlwZSwgaWQsIG9iamVjdFVwZGF0ZSwgb3B0aW9ucykge1xuICAgIGZ1bmN0aW9uIGhhbmRsZU5vdEZvdW5kKCkge1xuICAgICAgdmFyIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb2JqZWN0VXBkYXRlLCB7aWQ6IGlkfSk7XG4gICAgICByZXR1cm4gYXBpLmFkZCh0eXBlLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IGFwaS51cGRhdGUodHlwZSwgaWQsIG9iamVjdFVwZGF0ZSwgb3B0aW9ucykudGhlbihudWxsLCBoYW5kbGVOb3RGb3VuZCk7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShwcm9taXNlKTtcbiAgfTtcblxuXG4gIC8vIHVwZGF0ZUFsbFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHVwZGF0ZSBhbGwgb2JqZWN0cyBpbiB0aGUgc3RvcmUsIGNhbiBiZSBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgZnVuY3Rpb25cbiAgLy8gQXMgYW4gYWx0ZXJuYXRpdmUsIGFuIGFycmF5IG9mIG9iamVjdHMgY2FuIGJlIHBhc3NlZFxuICAvL1xuICAvLyBleGFtcGxlIHVzYWdlXG4gIC8vXG4gIC8vIGhvb2RpZS5zdG9yZS51cGRhdGVBbGwoKVxuICAvL1xuICBhcGkudXBkYXRlQWxsID0gZnVuY3Rpb24gKGZpbHRlck9yT2JqZWN0cywgb2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgdmFyIHByb21pc2U7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIG5vcm1hbGl6ZSB0aGUgaW5wdXQ6IG1ha2Ugc3VyZSB3ZSBoYXZlIGFsbCBvYmplY3RzXG4gICAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSB0eXBlb2YgZmlsdGVyT3JPYmplY3RzID09PSAnc3RyaW5nJzpcbiAgICAgIHByb21pc2UgPSBhcGkuZmluZEFsbChmaWx0ZXJPck9iamVjdHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBob29kaWUuaXNQcm9taXNlKGZpbHRlck9yT2JqZWN0cyk6XG4gICAgICBwcm9taXNlID0gZmlsdGVyT3JPYmplY3RzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAkLmlzQXJyYXkoZmlsdGVyT3JPYmplY3RzKTpcbiAgICAgIHByb21pc2UgPSBob29kaWUuZGVmZXIoKS5yZXNvbHZlKGZpbHRlck9yT2JqZWN0cykucHJvbWlzZSgpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDogLy8gZS5nLiBudWxsLCB1cGRhdGUgYWxsXG4gICAgICBwcm9taXNlID0gYXBpLmZpbmRBbGwoKTtcbiAgICB9XG5cbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKG9iamVjdHMpIHtcbiAgICAgIC8vIG5vdyB3ZSB1cGRhdGUgYWxsIG9iamVjdHMgb25lIGJ5IG9uZSBhbmQgcmV0dXJuIGEgcHJvbWlzZVxuICAgICAgLy8gdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgYWxsIHVwZGF0ZXMgaGF2ZSBiZWVuIGZpbmlzaGVkXG4gICAgICB2YXIgb2JqZWN0LCBfdXBkYXRlUHJvbWlzZXM7XG5cbiAgICAgIGlmICghJC5pc0FycmF5KG9iamVjdHMpKSB7XG4gICAgICAgIG9iamVjdHMgPSBbb2JqZWN0c107XG4gICAgICB9XG5cbiAgICAgIF91cGRhdGVQcm9taXNlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBvYmplY3RzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgb2JqZWN0ID0gb2JqZWN0c1tfaV07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChhcGkudXBkYXRlKG9iamVjdC50eXBlLCBvYmplY3QuaWQsIG9iamVjdFVwZGF0ZSwgb3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG5cbiAgICAgIHJldHVybiAkLndoZW4uYXBwbHkobnVsbCwgX3VwZGF0ZVByb21pc2VzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH07XG5cblxuICAvLyBSZW1vdmVcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmVtb3ZlcyBvbmUgb2JqZWN0IHNwZWNpZmllZCBieSBgdHlwZWAgYW5kIGBpZGAuXG4gIC8vXG4gIC8vIHdoZW4gb2JqZWN0IGhhcyBiZWVuIHN5bmNlZCBiZWZvcmUsIG1hcmsgaXQgYXMgZGVsZXRlZC5cbiAgLy8gT3RoZXJ3aXNlIHJlbW92ZSBpdCBmcm9tIFN0b3JlLlxuICAvL1xuICBhcGkucmVtb3ZlID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLnJlbW92ZSh0eXBlLCBpZCwgb3B0aW9ucyB8fCB7fSkpO1xuICB9O1xuXG5cbiAgLy8gcmVtb3ZlQWxsXG4gIC8vIC0tLS0tLS0tLS0tXG5cbiAgLy8gRGVzdHJveWUgYWxsIG9iamVjdHMuIENhbiBiZSBmaWx0ZXJlZCBieSBhIHR5cGVcbiAgLy9cbiAgYXBpLnJlbW92ZUFsbCA9IGZ1bmN0aW9uICh0eXBlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLnJlbW92ZUFsbCh0eXBlLCBvcHRpb25zIHx8IHt9KSk7XG4gIH07XG5cblxuICAvLyBkZWNvcmF0ZSBwcm9taXNlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZXh0ZW5kIHByb21pc2VzIHJldHVybmVkIGJ5IHN0b3JlLmFwaVxuICBhcGkuZGVjb3JhdGVQcm9taXNlcyA9IGZ1bmN0aW9uIChtZXRob2RzKSB7XG4gICAgcmV0dXJuIHV0aWxzLmluaGVyaXRzKHByb21pc2VBcGksIG1ldGhvZHMpO1xuICB9O1xuXG4gIC8vIHJlcXVpcmVkIGJhY2tlbmQgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGlmICghb3B0aW9ucy5iYWNrZW5kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zLmJhY2tlbmQgbXVzdCBiZSBwYXNzZWQnKTtcbiAgfVxuXG4gIHZhciByZXF1aXJlZCA9ICdzYXZlIGZpbmQgZmluZEFsbCByZW1vdmUgcmVtb3ZlQWxsJy5zcGxpdCgnICcpO1xuXG4gIHJlcXVpcmVkLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuXG4gICAgaWYgKCFvcHRpb25zLmJhY2tlbmRbbWV0aG9kTmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucy5iYWNrZW5kLicgKyBtZXRob2ROYW1lICsgJyBtdXN0IGJlIHBhc3NlZC4nKTtcbiAgICB9XG5cbiAgICBiYWNrZW5kW21ldGhvZE5hbWVdID0gb3B0aW9ucy5iYWNrZW5kW21ldGhvZE5hbWVdO1xuICB9KTtcblxuXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tXG5cbiAgLy8gLyBub3QgYWxsb3dlZCBmb3IgaWRcbiAgZnVuY3Rpb24gaXNWYWxpZElkKGtleSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKC9eW15cXC9dKyQvKS50ZXN0KGtleSB8fCAnJyk7XG4gIH1cblxuICAvLyAvIG5vdCBhbGxvd2VkIGZvciB0eXBlXG4gIGZ1bmN0aW9uIGlzVmFsaWRUeXBlKGtleSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKC9eW15cXC9dKyQvKS50ZXN0KGtleSB8fCAnJyk7XG4gIH1cblxuICAvL1xuICBmdW5jdGlvbiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSkge1xuICAgIHJldHVybiB1dGlscy5pbmhlcml0cyhwcm9taXNlLCBwcm9taXNlQXBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVXaXRoKCkge1xuICAgIHZhciBwcm9taXNlID0gaG9vZGllLnJlc29sdmVXaXRoLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShwcm9taXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdFdpdGgoKSB7XG4gICAgdmFyIHByb21pc2UgPSBob29kaWUucmVqZWN0V2l0aC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH1cblxuICByZXR1cm4gYXBpO1xuXG59O1xuXG4iLCIvLyBUYXNrc1xuLy8gPT09PT09PT09PT09XG5cbi8vIFRoaXMgY2xhc3MgZGVmaW5lcyB0aGUgaG9vZGllLnRhc2sgQVBJLlxuLy9cbi8vIFRoZSByZXR1cm5lZCBBUEkgcHJvdmlkZXMgdGhlIGZvbGxvd2luZyBtZXRob2RzOlxuLy9cbi8vICogc3RhcnRcbi8vICogY2FuY2VsXG4vLyAqIHJlc3RhcnRcbi8vICogcmVtb3ZlXG4vLyAqIG9uXG4vLyAqIG9uZVxuLy8gKiB1bmJpbmRcbi8vXG4vLyBBdCB0aGUgc2FtZSB0aW1lLCB0aGUgcmV0dXJuZWQgQVBJIGNhbiBiZSBjYWxsZWQgYXMgZnVuY3Rpb24gcmV0dXJuaW5nIGFcbi8vIHN0b3JlIHNjb3BlZCBieSB0aGUgcGFzc2VkIHR5cGUsIGZvciBleGFtcGxlXG4vL1xuLy8gICAgIHZhciBlbWFpbFRhc2tzID0gaG9vZGllLnRhc2soJ2VtYWlsJyk7XG4vLyAgICAgZW1haWxUYXNrcy5zdGFydCggcHJvcGVydGllcyApO1xuLy8gICAgIGVtYWlsVGFza3MuY2FuY2VsKCdpZDEyMycpO1xuLy9cbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xudmFyIHByb21pc2VzID0gcmVxdWlyZSgnLi9wcm9taXNlcycpO1xudmFyIHNjb3BlZFRhc2sgPSByZXF1aXJlKCcuL3Njb3BlZF90YXNrJyk7XG52YXIgYWNjb3VudCA9IHJlcXVpcmUoJy4vYWNjb3VudCcpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBwdWJsaWMgQVBJXG4gIHZhciBhcGkgPSBmdW5jdGlvbiBhcGkodHlwZSwgaWQpIHtcbiAgICByZXR1cm4gc2NvcGVkVGFzayhhcGksIHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBpZDogaWRcbiAgICB9KTtcbiAgfTtcblxuICAvLyBhZGQgZXZlbnRzIEFQSVxuICBldmVudHMoe1xuICAgIGNvbnRleHQ6IGFwaSxcbiAgICBuYW1lc3BhY2U6ICd0YXNrJ1xuICB9KTtcblxuXG4gIC8vIHN0YXJ0XG4gIC8vIC0tLS0tLS1cblxuICAvLyBzdGFydCBhIG5ldyB0YXNrLiBJZiB0aGUgdXNlciBoYXMgbm8gYWNjb3VudCB5ZXQsIGhvb2RpZSB0cmllcyB0byBzaWduIHVwXG4gIC8vIGZvciBhbiBhbm9ueW1vdXMgYWNjb3VudCBpbiB0aGUgYmFja2dyb3VuZC4gSWYgdGhhdCBmYWlscywgdGhlIHJldHVybmVkXG4gIC8vIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZC5cbiAgLy9cbiAgYXBpLnN0YXJ0ID0gZnVuY3Rpb24odHlwZSwgcHJvcGVydGllcykge1xuICAgIGlmIChhY2NvdW50Lmhhc0FjY291bnQoKSkge1xuICAgICAgcmV0dXJuIHN0b3JlLmFkZCgnJCcgKyB0eXBlLCBwcm9wZXJ0aWVzKS50aGVuKGhhbmRsZU5ld1Rhc2spO1xuICAgIH1cblxuICAgIHJldHVybiBhY2NvdW50LmFub255bW91c1NpZ25VcCgpLnRoZW4oIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFwaS5zdGFydCh0eXBlLCBwcm9wZXJ0aWVzKTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vIGNhbmNlbFxuICAvLyAtLS0tLS0tXG5cbiAgLy8gY2FuY2VsIGEgcnVubmluZyB0YXNrXG4gIC8vXG4gIGFwaS5jYW5jZWwgPSBmdW5jdGlvbih0eXBlLCBpZCkge1xuICAgIHJldHVybiBzdG9yZS51cGRhdGUoJyQnICsgdHlwZSwgaWQsIHtcbiAgICAgIGNhbmNlbGxlZEF0OiBub3coKVxuICAgIH0pLnRoZW4oaGFuZGxlQ2FuY2VsbGVkVGFzayk7XG4gIH07XG5cblxuICAvLyByZXN0YXJ0XG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIGZpcnN0LCB3ZSB0cnkgdG8gY2FuY2VsIGEgcnVubmluZyB0YXNrLiBJZiB0aGF0IHN1Y2NlZWRzLCB3ZSBzdGFydFxuICAvLyBhIG5ldyBvbmUgd2l0aCB0aGUgc2FtZSBwcm9wZXJ0aWVzIGFzIHRoZSBvcmlnaW5hbFxuICAvL1xuICBhcGkucmVzdGFydCA9IGZ1bmN0aW9uKHR5cGUsIGlkLCB1cGRhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgICQuZXh0ZW5kKG9iamVjdCwgdXBkYXRlKTtcbiAgICAgIGRlbGV0ZSBvYmplY3QuJGVycm9yO1xuICAgICAgZGVsZXRlIG9iamVjdC4kcHJvY2Vzc2VkQXQ7XG4gICAgICBkZWxldGUgb2JqZWN0LmNhbmNlbGxlZEF0O1xuICAgICAgcmV0dXJuIGFwaS5zdGFydChvYmplY3QudHlwZSwgb2JqZWN0KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFwaS5jYW5jZWwodHlwZSwgaWQpLnRoZW4oc3RhcnQpO1xuICB9O1xuXG4gIC8vIGNhbmNlbEFsbFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGFwaS5jYW5jZWxBbGwgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIGZpbmRBbGwodHlwZSkudGhlbiggY2FuY2VsVGFza09iamVjdHMgKTtcbiAgfTtcblxuICAvLyByZXN0YXJ0QWxsXG4gIC8vIC0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgYXBpLnJlc3RhcnRBbGwgPSBmdW5jdGlvbih0eXBlLCB1cGRhdGUpIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB1cGRhdGUgPSB0eXBlO1xuICAgIH1cbiAgICByZXR1cm4gZmluZEFsbCh0eXBlKS50aGVuKCBmdW5jdGlvbih0YXNrT2JqZWN0cykge1xuICAgICAgcmVzdGFydFRhc2tPYmplY3RzKHRhc2tPYmplY3RzLCB1cGRhdGUpO1xuICAgIH0pO1xuICB9O1xuXG5cbiAgLy9cbiAgLy8gc3Vic2NyaWJlIHRvIHN0b3JlIGV2ZW50c1xuICAvLyB3ZSBzdWJzY3JpYmUgdG8gYWxsIHN0b3JlIGNoYW5nZXMsIHBpcGUgdGhyb3VnaCB0aGUgdGFzayBvbmVzLFxuICAvLyBtYWtpbmcgYSBmZXcgY2hhbmdlcyBhbG9uZyB0aGUgd2F5LlxuICAvL1xuICBmdW5jdGlvbiBzdWJzY3JpYmVUb1N0b3JlRXZlbnRzKCkge1xuXG4gICAgLy8gYWNjb3VudCBldmVudHNcbiAgICBldmVudHMub24oJ3N0b3JlOmNoYW5nZScsIGhhbmRsZVN0b3JlQ2hhbmdlKTtcbiAgfVxuXG4gIC8vIGFsbG93IHRvIHJ1biB0aGlzIG9ubHkgb25jZSBmcm9tIG91dHNpZGUgKGR1cmluZyBIb29kaWUgaW5pdGlhbGl6YXRpb24pXG4gIGFwaS5zdWJzY3JpYmVUb1N0b3JlRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgc3Vic2NyaWJlVG9TdG9yZUV2ZW50cygpO1xuICAgIGRlbGV0ZSBhcGkuc3Vic2NyaWJlVG9TdG9yZUV2ZW50cztcbiAgfTtcblxuXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLVxuXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZU5ld1Rhc2sob2JqZWN0KSB7XG4gICAgdmFyIGRlZmVyID0gcHJvbWlzZXMuZGVmZXIoKTtcbiAgICB2YXIgdGFza1N0b3JlID0gc3RvcmUob2JqZWN0LnR5cGUsIG9iamVjdC5pZCk7XG5cbiAgICB0YXNrU3RvcmUub24oJ3JlbW92ZScsIGZ1bmN0aW9uKG9iamVjdCkge1xuXG4gICAgICAvLyByZW1vdmUgXCIkXCIgZnJvbSB0eXBlXG4gICAgICBvYmplY3QudHlwZSA9IG9iamVjdC50eXBlLnN1YnN0cigxKTtcblxuICAgICAgLy8gdGFzayBmaW5pc2hlZCBieSB3b3JrZXIuXG4gICAgICBpZiAob2JqZWN0LmZpbmlzaGVkQXQpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgIH1cblxuICAgICAgLy8gbWFudWFsbHkgcmVtb3ZlZCAvIGNhbmNlbGxlZC5cbiAgICAgIGRlZmVyLnJlamVjdChvYmplY3QpO1xuICAgIH0pO1xuXG4gICAgdGFza1N0b3JlLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycm9yLCBvYmplY3QpIHtcblxuICAgICAgLy8gcmVtb3ZlIFwiJFwiIGZyb20gdHlwZVxuICAgICAgb2JqZWN0LnR5cGUgPSBvYmplY3QudHlwZS5zdWJzdHIoMSk7XG5cbiAgICAgIGRlZmVyLnJlamVjdChlcnJvciwgb2JqZWN0KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gIH1cblxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVDYW5jZWxsZWRUYXNrICh0YXNrKSB7XG4gICAgdmFyIGRlZmVyO1xuICAgIHZhciB0eXBlID0gJyQnK3Rhc2sudHlwZTtcbiAgICB2YXIgaWQgPSB0YXNrLmlkO1xuICAgIHZhciByZW1vdmVQcm9taXNlID0gc3RvcmUucmVtb3ZlKHR5cGUsIGlkKTtcblxuICAgIGlmICghdGFzay5fcmV2KSB7XG4gICAgICAvLyB0YXNrIGhhcyBub3QgeWV0IGJlZW4gc3luY2VkLlxuICAgICAgcmV0dXJuIHJlbW92ZVByb21pc2U7XG4gICAgfVxuXG4gICAgZGVmZXIgPSBwcm9taXNlcy5kZWZlcigpO1xuICAgIGV2ZW50cy5vbmUoJ3N0b3JlOnN5bmM6JyArIHR5cGUgKyAnOicgKyBpZCwgZGVmZXIucmVzb2x2ZSk7XG4gICAgcmVtb3ZlUHJvbWlzZS5mYWlsKGRlZmVyLnJlamVjdCk7XG5cbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlU3RvcmVDaGFuZ2UoZXZlbnROYW1lLCBvYmplY3QsIG9wdGlvbnMpIHtcbiAgICBpZiAob2JqZWN0LnR5cGVbMF0gIT09ICckJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG9iamVjdC50eXBlID0gb2JqZWN0LnR5cGUuc3Vic3RyKDEpO1xuICAgIHRyaWdnZXJFdmVudHMoZXZlbnROYW1lLCBvYmplY3QsIG9wdGlvbnMpO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gZmluZEFsbCAodHlwZSkge1xuICAgIHZhciBzdGFydHNXaXRoID0gJyQnO1xuICAgIHZhciBmaWx0ZXI7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHN0YXJ0c1dpdGggKz0gdHlwZTtcbiAgICB9XG5cbiAgICBmaWx0ZXIgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHJldHVybiBvYmplY3QudHlwZS5pbmRleE9mKHN0YXJ0c1dpdGgpID09PSAwO1xuICAgIH07XG4gICAgcmV0dXJuIHN0b3JlLmZpbmRBbGwoZmlsdGVyKTtcbiAgfVxuXG4gIC8vXG4gIGZ1bmN0aW9uIGNhbmNlbFRhc2tPYmplY3RzICh0YXNrT2JqZWN0cykge1xuICAgIHJldHVybiB0YXNrT2JqZWN0cy5tYXAoIGZ1bmN0aW9uKHRhc2tPYmplY3QpIHtcbiAgICAgIHJldHVybiBhcGkuY2FuY2VsKHRhc2tPYmplY3QudHlwZS5zdWJzdHIoMSksIHRhc2tPYmplY3QuaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gcmVzdGFydFRhc2tPYmplY3RzICh0YXNrT2JqZWN0cywgdXBkYXRlKSB7XG4gICAgcmV0dXJuIHRhc2tPYmplY3RzLm1hcCggZnVuY3Rpb24odGFza09iamVjdCkge1xuICAgICAgcmV0dXJuIGFwaS5yZXN0YXJ0KHRhc2tPYmplY3QudHlwZS5zdWJzdHIoMSksIHRhc2tPYmplY3QuaWQsIHVwZGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyB0aGlzIGlzIHdoZXJlIGFsbCB0aGUgdGFzayBldmVudHMgZ2V0IHRyaWdnZXJlZCxcbiAgLy8gbGlrZSBhZGQ6bWVzc2FnZSwgY2hhbmdlOm1lc3NhZ2U6YWJjNDU2NywgcmVtb3ZlLCBldGMuXG4gIGZ1bmN0aW9uIHRyaWdnZXJFdmVudHMoZXZlbnROYW1lLCB0YXNrLCBvcHRpb25zKSB7XG4gICAgdmFyIGVycm9yO1xuXG4gICAgLy8gXCJuZXdcIiB0YXNrcyBhcmUgdHJpZ2dlciBhcyBcInN0YXJ0XCIgZXZlbnRzXG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gJ25ldycpIHtcbiAgICAgIGV2ZW50TmFtZSA9ICdzdGFydCc7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3JlbW92ZScgJiYgdGFzay5jYW5jZWxsZWRBdCkge1xuICAgICAgZXZlbnROYW1lID0gJ2NhbmNlbCc7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3JlbW92ZScgJiYgdGFzay4kcHJvY2Vzc2VkQXQpIHtcbiAgICAgIGV2ZW50TmFtZSA9ICdzdWNjZXNzJztcbiAgICB9XG5cbiAgICBpZiAoZXZlbnROYW1lID09PSAndXBkYXRlJyAmJiB0YXNrLiRlcnJvcikge1xuICAgICAgZXZlbnROYW1lID0gJ2Vycm9yJztcbiAgICAgIGVycm9yID0gdGFzay4kZXJyb3I7XG4gICAgICBkZWxldGUgdGFzay4kZXJyb3I7XG5cbiAgICAgIGFwaS50cmlnZ2VyKCdlcnJvcicsIGVycm9yLCB0YXNrLCBvcHRpb25zKTtcbiAgICAgIGFwaS50cmlnZ2VyKCdlcnJvcjonICsgdGFzay50eXBlLCBlcnJvciwgdGFzaywgb3B0aW9ucyk7XG4gICAgICBhcGkudHJpZ2dlcignZXJyb3I6JyArIHRhc2sudHlwZSArICc6JyArIHRhc2suaWQsIGVycm9yLCB0YXNrLCBvcHRpb25zKTtcblxuICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zLCB7ZXJyb3I6IGVycm9yfSk7XG4gICAgICBhcGkudHJpZ2dlcignY2hhbmdlJywgJ2Vycm9yJywgdGFzaywgb3B0aW9ucyk7XG4gICAgICBhcGkudHJpZ2dlcignY2hhbmdlOicgKyB0YXNrLnR5cGUsICdlcnJvcicsIHRhc2ssIG9wdGlvbnMpO1xuICAgICAgYXBpLnRyaWdnZXIoJ2NoYW5nZTonICsgdGFzay50eXBlICsgJzonICsgdGFzay5pZCwgJ2Vycm9yJywgdGFzaywgb3B0aW9ucyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIGFsbCB0aGUgb3RoZXIgZXZlbnRzXG4gICAgaWYgKGV2ZW50TmFtZSAhPT0gJ3N0YXJ0JyAmJiBldmVudE5hbWUgIT09ICdjYW5jZWwnICYmIGV2ZW50TmFtZSAhPT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXBpLnRyaWdnZXIoZXZlbnROYW1lLCB0YXNrLCBvcHRpb25zKTtcbiAgICBhcGkudHJpZ2dlcihldmVudE5hbWUgKyAnOicgKyB0YXNrLnR5cGUsIHRhc2ssIG9wdGlvbnMpO1xuXG4gICAgaWYgKGV2ZW50TmFtZSAhPT0gJ3N0YXJ0Jykge1xuICAgICAgYXBpLnRyaWdnZXIoZXZlbnROYW1lICsgJzonICsgdGFzay50eXBlICsgJzonICsgdGFzay5pZCwgdGFzaywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgYXBpLnRyaWdnZXIoJ2NoYW5nZScsIGV2ZW50TmFtZSwgdGFzaywgb3B0aW9ucyk7XG4gICAgYXBpLnRyaWdnZXIoJ2NoYW5nZTonICsgdGFzay50eXBlLCBldmVudE5hbWUsIHRhc2ssIG9wdGlvbnMpO1xuXG4gICAgaWYgKGV2ZW50TmFtZSAhPT0gJ3N0YXJ0Jykge1xuICAgICAgYXBpLnRyaWdnZXIoJ2NoYW5nZTonICsgdGFzay50eXBlICsgJzonICsgdGFzay5pZCwgZXZlbnROYW1lLCB0YXNrLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3coKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1snXCJdL2csICcnKTtcbiAgfVxuXG4gIHJldHVybiBhcGk7XG5cbn07XG5cbiIsIi8qIGV4cG9ydGVkIGhvb2RpZURpc3Bvc2UgKi9cblxuLy8gaG9vZGllLmRpc3Bvc2Vcbi8vID09PT09PT09PT09PT09PT1cbnZhciBldmVudHMgPSByZXF1aXJlKCcuLi9ldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gaWYgYSBob29kaWUgaW5zdGFuY2UgaXMgbm90IG5lZWRlZCBhbnltb3JlLCBpdCBjYW5cbiAgLy8gYmUgZGlzcG9zZWQgdXNpbmcgdGhpcyBtZXRob2QuIEEgYGRpc3Bvc2VgIGV2ZW50XG4gIC8vIGdldHMgdHJpZ2dlcmVkIHRoYXQgdGhlIG1vZHVsZXMgcmVhY3Qgb24uXG4gIGV2ZW50cy50cmlnZ2VyKCdkaXNwb3NlJyk7XG4gIGV2ZW50cy51bmJpbmQoKTtcblxuICByZXR1cm47XG59O1xuIiwiLyogZXhwb3J0ZWQgaG9vZGllVVVJRCAqL1xuXG4vLyBob29kaWUudXVpZFxuLy8gPT09PT09PT09PT09PVxuXG4vLyB1dWlkcyBjb25zaXN0IG9mIG51bWJlcnMgYW5kIGxvd2VyY2FzZSBsZXR0ZXJzIG9ubHkuXG4vLyBXZSBzdGljayB0byBsb3dlcmNhc2UgbGV0dGVycyB0byBwcmV2ZW50IGNvbmZ1c2lvblxuLy8gYW5kIHRvIHByZXZlbnQgaXNzdWVzIHdpdGggQ291Y2hEQiwgZS5nLiBkYXRhYmFzZVxuLy8gbmFtZXMgZG8gd29ubHkgYWxsb3cgZm9yIGxvd2VyY2FzZSBsZXR0ZXJzLlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICB2YXIgcmFkaXggPSBjaGFycy5sZW5ndGg7XG4gIHZhciBpO1xuICB2YXIgaWQgPSAnJztcblxuICAvLyBkZWZhdWx0IHV1aWQgbGVuZ3RoIHRvIDdcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gNztcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciByYW5kID0gTWF0aC5yYW5kb20oKSAqIHJhZGl4O1xuICAgIHZhciBjaGFyID0gY2hhcnNbTWF0aC5mbG9vcihyYW5kKV07XG4gICAgaWQgKz0gU3RyaW5nKGNoYXIpLmNoYXJBdCgwKTtcbiAgfVxuXG4gIHJldHVybiBpZDtcblxufTtcbiJdfQ==
(3)
});
;