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

var Hoodie = function Hoodie(baseUrl) {
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


module.exports = Hoodie;

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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9fc2hpbXMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi91dGlsLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9hY2NvdW50LmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvY29uZmlnLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvY29ubmVjdGlvbi5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL2Vycm9ycy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL2V2ZW50cy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL29wZW4uanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9wcm9taXNlcy5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3JlbW90ZV9zdG9yZS5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3JlcXVlc3QuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9zY29wZWRfc3RvcmUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9zY29wZWRfdGFzay5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3N0b3JlLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvdGFzay5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL3V0aWxzL2Rpc3Bvc2UuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS91dGlscy91dWlkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuLy9cbi8vIFRoZSBzaGltcyBpbiB0aGlzIGZpbGUgYXJlIG5vdCBmdWxseSBpbXBsZW1lbnRlZCBzaGltcyBmb3IgdGhlIEVTNVxuLy8gZmVhdHVyZXMsIGJ1dCBkbyB3b3JrIGZvciB0aGUgcGFydGljdWxhciB1c2VjYXNlcyB0aGVyZSBpcyBpblxuLy8gdGhlIG90aGVyIG1vZHVsZXMuXG4vL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gQXJyYXkuaXNBcnJheSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5mdW5jdGlvbiBpc0FycmF5KHhzKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cbmV4cG9ydHMuaXNBcnJheSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nID8gQXJyYXkuaXNBcnJheSA6IGlzQXJyYXk7XG5cbi8vIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YoeHMsIHgpIHtcbiAgaWYgKHhzLmluZGV4T2YpIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHggPT09IHhzW2ldKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuZmlsdGVyIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKHhzLCBmbikge1xuICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGZuKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZuKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmZvckVhY2ggaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaCh4cywgZm4sIHNlbGYpIHtcbiAgaWYgKHhzLmZvckVhY2gpIHJldHVybiB4cy5mb3JFYWNoKGZuLCBzZWxmKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIGZuLmNhbGwoc2VsZiwgeHNbaV0sIGksIHhzKTtcbiAgfVxufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLm1hcCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uIG1hcCh4cywgZm4pIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmbik7XG4gIHZhciBvdXQgPSBuZXcgQXJyYXkoeHMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIG91dFtpXSA9IGZuKHhzW2ldLCBpLCB4cyk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5yZWR1Y2UgPSBmdW5jdGlvbiByZWR1Y2UoYXJyYXksIGNhbGxiYWNrLCBvcHRfaW5pdGlhbFZhbHVlKSB7XG4gIGlmIChhcnJheS5yZWR1Y2UpIHJldHVybiBhcnJheS5yZWR1Y2UoY2FsbGJhY2ssIG9wdF9pbml0aWFsVmFsdWUpO1xuICB2YXIgdmFsdWUsIGlzVmFsdWVTZXQgPSBmYWxzZTtcblxuICBpZiAoMiA8IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB2YWx1ZSA9IG9wdF9pbml0aWFsVmFsdWU7XG4gICAgaXNWYWx1ZVNldCA9IHRydWU7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGwgPiBpOyArK2kpIHtcbiAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgIGlmIChpc1ZhbHVlU2V0KSB7XG4gICAgICAgIHZhbHVlID0gY2FsbGJhY2sodmFsdWUsIGFycmF5W2ldLCBpLCBhcnJheSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBhcnJheVtpXTtcbiAgICAgICAgaXNWYWx1ZVNldCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxuaWYgKCdhYicuc3Vic3RyKC0xKSAhPT0gJ2InKSB7XG4gIGV4cG9ydHMuc3Vic3RyID0gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbmd0aCkge1xuICAgIC8vIGRpZCB3ZSBnZXQgYSBuZWdhdGl2ZSBzdGFydCwgY2FsY3VsYXRlIGhvdyBtdWNoIGl0IGlzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgc3RyaW5nXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG5cbiAgICAvLyBjYWxsIHRoZSBvcmlnaW5hbCBmdW5jdGlvblxuICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW5ndGgpO1xuICB9O1xufSBlbHNlIHtcbiAgZXhwb3J0cy5zdWJzdHIgPSBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbmd0aCk7XG4gIH07XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUudHJpbSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLnRyaW0gPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufTtcblxuLy8gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHZhciBmbiA9IGFyZ3Muc2hpZnQoKTtcbiAgaWYgKGZuLmJpbmQpIHJldHVybiBmbi5iaW5kLmFwcGx5KGZuLCBhcmdzKTtcbiAgdmFyIHNlbGYgPSBhcmdzLnNoaWZ0KCk7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgZm4uYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoW0FycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyldKSk7XG4gIH07XG59O1xuXG4vLyBPYmplY3QuY3JlYXRlIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgdmFyIG9iamVjdDtcbiAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuICAgIG9iamVjdCA9IHsgJ19fcHJvdG9fXycgOiBudWxsIH07XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAndHlwZW9mIHByb3RvdHlwZVsnICsgKHR5cGVvZiBwcm90b3R5cGUpICsgJ10gIT0gXFwnb2JqZWN0XFwnJ1xuICAgICAgKTtcbiAgICB9XG4gICAgdmFyIFR5cGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgIG9iamVjdC5fX3Byb3RvX18gPSBwcm90b3R5cGU7XG4gIH1cbiAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG9iamVjdCwgcHJvcGVydGllcyk7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cbmV4cG9ydHMuY3JlYXRlID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicgPyBPYmplY3QuY3JlYXRlIDogY3JlYXRlO1xuXG4vLyBPYmplY3Qua2V5cyBhbmQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgaXMgc3VwcG9ydGVkIGluIElFOSBob3dldmVyXG4vLyB0aGV5IGRvIHNob3cgYSBkZXNjcmlwdGlvbiBhbmQgbnVtYmVyIHByb3BlcnR5IG9uIEVycm9yIG9iamVjdHNcbmZ1bmN0aW9uIG5vdE9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICgodHlwZW9mIG9iamVjdCAhPSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmplY3QgIT0gXCJmdW5jdGlvblwiKSB8fCBvYmplY3QgPT09IG51bGwpO1xufVxuXG5mdW5jdGlvbiBrZXlzU2hpbShvYmplY3QpIHtcbiAgaWYgKG5vdE9iamVjdChvYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5rZXlzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIG5hbWUgaW4gb2JqZWN0KSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBuYW1lKSkge1xuICAgICAgcmVzdWx0LnB1c2gobmFtZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIGdldE93blByb3BlcnR5TmFtZXMgaXMgYWxtb3N0IHRoZSBzYW1lIGFzIE9iamVjdC5rZXlzIG9uZSBrZXkgZmVhdHVyZVxuLy8gIGlzIHRoYXQgaXQgcmV0dXJucyBoaWRkZW4gcHJvcGVydGllcywgc2luY2UgdGhhdCBjYW4ndCBiZSBpbXBsZW1lbnRlZCxcbi8vICB0aGlzIGZlYXR1cmUgZ2V0cyByZWR1Y2VkIHNvIGl0IGp1c3Qgc2hvd3MgdGhlIGxlbmd0aCBwcm9wZXJ0eSBvbiBhcnJheXNcbmZ1bmN0aW9uIHByb3BlcnR5U2hpbShvYmplY3QpIHtcbiAgaWYgKG5vdE9iamVjdChvYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ga2V5c1NoaW0ob2JqZWN0KTtcbiAgaWYgKGV4cG9ydHMuaXNBcnJheShvYmplY3QpICYmIGV4cG9ydHMuaW5kZXhPZihvYmplY3QsICdsZW5ndGgnKSA9PT0gLTEpIHtcbiAgICByZXN1bHQucHVzaCgnbGVuZ3RoJyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIGtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgPyBPYmplY3Qua2V5cyA6IGtleXNTaGltO1xudmFyIGdldE93blByb3BlcnR5TmFtZXMgPSB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgPT09ICdmdW5jdGlvbicgP1xuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA6IHByb3BlcnR5U2hpbTtcblxuaWYgKG5ldyBFcnJvcigpLmhhc093blByb3BlcnR5KCdkZXNjcmlwdGlvbicpKSB7XG4gIHZhciBFUlJPUl9QUk9QRVJUWV9GSUxURVIgPSBmdW5jdGlvbiAob2JqLCBhcnJheSkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEVycm9yXScpIHtcbiAgICAgIGFycmF5ID0gZXhwb3J0cy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiBuYW1lICE9PSAnZGVzY3JpcHRpb24nICYmIG5hbWUgIT09ICdudW1iZXInICYmIG5hbWUgIT09ICdtZXNzYWdlJztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBFUlJPUl9QUk9QRVJUWV9GSUxURVIob2JqZWN0LCBrZXlzKG9iamVjdCkpO1xuICB9O1xuICBleHBvcnRzLmdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEVSUk9SX1BST1BFUlRZX0ZJTFRFUihvYmplY3QsIGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSk7XG4gIH07XG59IGVsc2Uge1xuICBleHBvcnRzLmtleXMgPSBrZXlzO1xuICBleHBvcnRzLmdldE93blByb3BlcnR5TmFtZXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xufVxuXG4vLyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIC0gc3VwcG9ydGVkIGluIElFOCBidXQgb25seSBvbiBkb20gZWxlbWVudHNcbmZ1bmN0aW9uIHZhbHVlT2JqZWN0KHZhbHVlLCBrZXkpIHtcbiAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbn1cblxuaWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gIHRyeSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih7J2EnOiAxfSwgJ2EnKTtcbiAgICBleHBvcnRzLmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJRTggZG9tIGVsZW1lbnQgaXNzdWUgLSB1c2UgYSB0cnkgY2F0Y2ggYW5kIGRlZmF1bHQgdG8gdmFsdWVPYmplY3RcbiAgICBleHBvcnRzLmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlT2JqZWN0KHZhbHVlLCBrZXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0gZWxzZSB7XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gdmFsdWVPYmplY3Q7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHNoaW1zID0gcmVxdWlyZSgnX3NoaW1zJyk7XG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgc2hpbXMuZm9yRWFjaChhcnJheSwgZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcyk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IHNoaW1zLmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gc2hpbXMuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cblxuICBzaGltcy5mb3JFYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IHNoaW1zLmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChzaGltcy5pbmRleE9mKGN0eC5zZWVuLCBkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gc2hpbXMucmVkdWNlKG91dHB1dCwgZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIHNoaW1zLmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmIG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmJpbmFyeVNsaWNlID09PSAnZnVuY3Rpb24nXG4gIDtcbn1cbmV4cG9ydHMuaXNCdWZmZXIgPSBpc0J1ZmZlcjtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IHNoaW1zLmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyogZ2xvYmFsIG9wZW46dHJ1ZSAqL1xuXG4vLyBIb29kaWUgQ29yZVxuLy8gLS0tLS0tLS0tLS0tLVxuLy9cbi8vIHRoZSBkb29yIHRvIHdvcmxkIGRvbWluYXRpb24gKGFwcHMpXG4vL1xuLy9cbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2hvb2RpZS9ldmVudHMnKTtcbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vaG9vZGllL3Byb21pc2VzJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJy4vaG9vZGllL3JlcXVlc3QnKTtcbnZhciBjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9ob29kaWUvY29ubmVjdGlvbicpO1xudmFyIFVVSUQgPSByZXF1aXJlKCcuL2hvb2RpZS91dGlscy91dWlkJyk7XG52YXIgZGlzcG9zZSA9IHJlcXVpcmUoJy4vaG9vZGllL3V0aWxzL2Rpc3Bvc2UnKTtcbnZhciBvcGVuID0gcmVxdWlyZSgnLi9ob29kaWUvb3BlbicpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9ob29kaWUvc3RvcmUnKTtcbnZhciB0YXNrID0gcmVxdWlyZSgnLi9ob29kaWUvdGFzaycpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vaG9vZGllL2NvbmZpZycpO1xudmFyIGFjY291bnQgPSByZXF1aXJlKCcuL2hvb2RpZS9hY2NvdW50Jyk7XG52YXIgcmVtb3RlID0gcmVxdWlyZSgnLi9ob29kaWUvcmVtb3RlX3N0b3JlJyk7XG52YXIgYWNjb3VudCA9IHJlcXVpcmUoJy4vaG9vZGllL2FjY291bnQnKTtcblxuLy8gQ29uc3RydWN0b3Jcbi8vIC0tLS0tLS0tLS0tLS1cblxuLy8gV2hlbiBpbml0aWFsaXppbmcgYSBob29kaWUgaW5zdGFuY2UsIGFuIG9wdGlvbmFsIFVSTFxuLy8gY2FuIGJlIHBhc3NlZC4gVGhhdCdzIHRoZSBVUkwgb2YgdGhlIGhvb2RpZSBiYWNrZW5kLlxuLy8gSWYgbm8gVVJMIHBhc3NlZCBpdCBkZWZhdWx0cyB0byB0aGUgY3VycmVudCBkb21haW4uXG4vL1xuLy8gICAgIC8vIGluaXQgYSBuZXcgaG9vZGllIGluc3RhbmNlXG4vLyAgICAgaG9vZGllID0gbmV3IEhvb2RpZVxuLy9cblxudmFyIEhvb2RpZSA9IGZ1bmN0aW9uIEhvb2RpZShiYXNlVXJsKSB7XG4gIHZhciBob29kaWUgPSB0aGlzO1xuXG4gIC8vIGVuZm9yY2UgaW5pdGlhbGl6YXRpb24gd2l0aCBgbmV3YFxuICBpZiAoIShob29kaWUgaW5zdGFuY2VvZiBIb29kaWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2FnZTogbmV3IEhvb2RpZSh1cmwpOycpO1xuICB9XG5cbiAgaWYgKGJhc2VVcmwpIHtcbiAgICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2hlc1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG4gIH1cblxuXG4gIC8vIGhvb2RpZS5leHRlbmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZXh0ZW5kIGhvb2RpZSBpbnN0YW5jZTpcbiAgLy9cbiAgLy8gICAgIGhvb2RpZS5leHRlbmQoZnVuY3Rpb24oaG9vZGllKSB7fSApXG4gIC8vXG4gIHRoaXMuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKGV4dGVuc2lvbikge1xuICAgIGV4dGVuc2lvbihob29kaWUpO1xuICB9O1xuXG5cbiAgLy9cbiAgLy8gRXh0ZW5kaW5nIGhvb2RpZSBjb3JlXG4gIC8vXG5cbiAgLy8gKiBob29kaWUuYmluZFxuICAvLyAqIGhvb2RpZS5vblxuICAvLyAqIGhvb2RpZS5vbmVcbiAgLy8gKiBob29kaWUudHJpZ2dlclxuICAvLyAqIGhvb2RpZS51bmJpbmRcbiAgLy8gKiBob29kaWUub2ZmXG4gIHRoaXMuYmluZCA9IGV2ZW50cy5iaW5kO1xuICB0aGlzLm9uID0gZXZlbnRzLm9uO1xuICB0aGlzLm9uZSA9IGV2ZW50cy5vbmU7XG4gIHRoaXMudHJpZ2dlciA9IGV2ZW50cy50cmlnZ2VyO1xuICB0aGlzLnVuYmluZCA9IGV2ZW50cy51bmJpbmQ7XG4gIHRoaXMub2ZmID0gZXZlbnRzLm9mZjtcblxuXG4gIC8vICogaG9vZGllLmRlZmVyXG4gIC8vICogaG9vZGllLmlzUHJvbWlzZVxuICAvLyAqIGhvb2RpZS5yZXNvbHZlXG4gIC8vICogaG9vZGllLnJlamVjdFxuICAvLyAqIGhvb2RpZS5yZXNvbHZlV2l0aFxuICAvLyAqIGhvb2RpZS5yZWplY3RXaXRoXG4gIHRoaXMuZGVmZXIgPSBwcm9taXNlcy5kZWZlcjtcbiAgdGhpcy5pc1Byb21pc2UgPSBwcm9taXNlcy5pc1Byb21pc2U7XG4gIHRoaXMucmVzb2x2ZSA9IHByb21pc2VzLnJlc29sdmU7XG4gIHRoaXMucmVqZWN0ID0gcHJvbWlzZXMucmVqZWN0O1xuICB0aGlzLnJlc29sdmVXaXRoID0gcHJvbWlzZXMucmVzb2x2ZVdpdGg7XG5cblxuICAvLyAqIGhvb2RpZS5yZXF1ZXN0XG4gIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgLy8gKiBob29kaWUuaXNPbmxpbmVcbiAgLy8gKiBob29kaWUuY2hlY2tDb25uZWN0aW9uXG4gIHRoaXMuaXNPbmxpbmUgPSBjb25uZWN0aW9uLmlzT25saW5lO1xuICB0aGlzLmNoZWNrQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb24uY2hlY2tDb25uZWN0aW9uO1xuXG4gIC8vICogaG9vZGllLnV1aWRcbiAgdGhpcy5VVUlEID0gVVVJRDtcblxuICAvLyAqIGhvb2RpZS5kaXNwb3NlXG4gIHRoaXMuZGlzcG9zZSA9IGRpc3Bvc2U7XG5cbiAgLy8gKiBob29kaWUub3BlblxuICB0aGlzLm9wZW4gPSBvcGVuO1xuXG4gIC8vICogaG9vZGllLnN0b3JlXG4gIHRoaXMuc3RvcmUgPSBzdG9yZTtcblxuICAvLyAqIGhvb2RpZS50YXNrXG4gIHRoaXMudGFzayA9IHRhc2s7XG5cbiAgLy8gKiBob29kaWUuY29uZmlnXG4gIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gIC8vICogaG9vZGllLmFjY291bnRcbiAgdGhpcy5hY2NvdW50ID0gYWNjb3VudDtcblxuICAvLyAqIGhvb2RpZS5yZW1vdGVcbiAgdGhpcy5yZW1vdGUgPSByZW1vdGU7XG5cblxuICAvL1xuICAvLyBJbml0aWFsaXphdGlvbnNcbiAgLy9cblxuICAvLyBzZXQgdXNlcm5hbWUgZnJvbSBjb25maWcgKGxvY2FsIHN0b3JlKVxuICB0aGlzLmFjY291bnQudXNlcm5hbWUgPSBjb25maWcuZ2V0KCdfYWNjb3VudC51c2VybmFtZScpO1xuXG4gIC8vIGNoZWNrIGZvciBwZW5kaW5nIHBhc3N3b3JkIHJlc2V0XG4gIHRoaXMuYWNjb3VudC5jaGVja1Bhc3N3b3JkUmVzZXQoKTtcblxuICAvLyBjbGVhciBjb25maWcgb24gc2lnbiBvdXRcbiAgZXZlbnRzLm9uKCdhY2NvdW50OnNpZ25vdXQnLCBjb25maWcuY2xlYXIpO1xuXG4gIC8vIGhvb2RpZS5zdG9yZVxuICB0aGlzLnN0b3JlLnBhdGNoSWZOb3RQZXJzaXN0YW50KCk7XG4gIHRoaXMuc3RvcmUuc3Vic2NyaWJlVG9PdXRzaWRlRXZlbnRzKCk7XG4gIHRoaXMuc3RvcmUuYm9vdHN0cmFwRGlydHlPYmplY3RzKCk7XG5cbiAgLy8gaG9vZGllLnJlbW90ZVxuICB0aGlzLnJlbW90ZS5zdWJzY3JpYmVUb0V2ZW50cygpO1xuXG4gIC8vIGhvb2RpZS50YXNrXG4gIHRoaXMudGFzay5zdWJzY3JpYmVUb1N0b3JlRXZlbnRzKCk7XG5cbiAgLy8gYXV0aGVudGljYXRlXG4gIC8vIHdlIHVzZSBhIGNsb3N1cmUgdG8gbm90IHBhc3MgdGhlIHVzZXJuYW1lIHRvIGNvbm5lY3QsIGFzIGl0XG4gIC8vIHdvdWxkIHNldCB0aGUgbmFtZSBvZiB0aGUgcmVtb3RlIHN0b3JlLCB3aGljaCBpcyBub3QgdGhlIHVzZXJuYW1lLlxuICB0aGlzLmFjY291bnQuYXV0aGVudGljYXRlKCkudGhlbihmdW5jdGlvbiggLyogdXNlcm5hbWUgKi8gKSB7XG4gICAgcmVtb3RlLmNvbm5lY3QoKTtcbiAgfSk7XG5cbiAgLy8gY2hlY2sgY29ubmVjdGlvbiB3aGVuIGJyb3dzZXIgZ29lcyBvbmxpbmUgLyBvZmZsaW5lXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLmNoZWNrQ29ubmVjdGlvbiwgZmFsc2UpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuY2hlY2tDb25uZWN0aW9uLCBmYWxzZSk7XG5cbiAgLy8gc3RhcnQgY2hlY2tpbmcgY29ubmVjdGlvblxuICB0aGlzLmNoZWNrQ29ubmVjdGlvbigpO1xuXG4gIC8vXG4gIC8vIGxvYWRpbmcgdXNlciBleHRlbnNpb25zXG4gIC8vXG4gIGFwcGx5RXh0ZW5zaW9ucyhob29kaWUpO1xufTtcblxuLy8gRXh0ZW5kaW5nIGhvb2RpZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFlvdSBjYW4gZWl0aGVyIGV4dGVuZCB0aGUgSG9vZGllIGNsYXNzLCBvciBhIGhvb2RpZVxuLy8gaW5zdGFuY2UgZHVyaW5nIHJ1bnRpbWVcbi8vXG4vLyAgICAgSG9vZGllLmV4dGVuZCgnbWFnaWMxJywgZnVuY2lvbihob29kaWUpIHsgLyogLi4uICovIH0pXG4vLyAgICAgaG9vZGllID0gbmV3IEhvb2RpZVxuLy8gICAgIGhvb2RpZS5leHRlbmQoJ21hZ2ljMicsIGZ1bmN0aW9uKGhvb2RpZSkgeyAvKiAuLi4gKi8gfSlcbi8vICAgICBob29kaWUubWFnaWMxLmRvU29tZXRoaW5nKClcbi8vICAgICBob29kaWUubWFnaWMyLmRvU29tZXRoaW5nRWxzZSgpXG4vL1xuLy8gSG9vZGllIGNhbiBhbHNvIGJlIGV4dGVuZGVkIGFub255bW91c2x5XG4vL1xuLy8gICAgIEhvb2RpZS5leHRlbmQoZnVuY2lvbihob29kaWUpIHsgaG9vZGllLm15TWFnaWMgPSBmdW5jdGlvbigpIHt9IH0pXG4vL1xudmFyIGV4dGVuc2lvbnMgPSBbXTtcblxuSG9vZGllLmV4dGVuZCA9IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICBleHRlbnNpb25zLnB1c2goZXh0ZW5zaW9uKTtcbn07XG5cbi8vXG5mdW5jdGlvbiBhcHBseUV4dGVuc2lvbnMoaG9vZGllKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXh0ZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGV4dGVuc2lvbnNbaV0oaG9vZGllKTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSG9vZGllO1xuIiwiXG4vLyBIb29kaWUuQWNjb3VudFxuLy8gPT09PT09PT09PT09PT09PVxuXG4vL1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgcHJvbWlzZXMgPSByZXF1aXJlKCcuL3Byb21pc2VzJyk7XG52YXIgdXVpZCA9IHJlcXVpcmUoJy4vdXRpbHMvdXVpZCcpO1xudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgcmVtb3RlID0gcmVxdWlyZSgnLi9yZW1vdGVfc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHB1YmxpYyBBUElcbiAgdmFyIGFjY291bnQgPSB7fTtcblxuICAvLyBmbGFnIHdoZXRoZXIgdXNlciBpcyBjdXJyZW50bHkgYXV0aGVudGljYXRlZCBvciBub3RcbiAgdmFyIGF1dGhlbnRpY2F0ZWQ7XG5cbiAgLy8gY2FjaGUgZm9yIENvdWNoREIgX3VzZXJzIGRvY1xuICB2YXIgdXNlckRvYyA9IHt9O1xuXG4gIC8vIG1hcCBvZiByZXF1ZXN0UHJvbWlzZXMuIFdlIG1haW50YWluIHRoaXMgbGlzdCB0byBhdm9pZCBzZW5kaW5nXG4gIC8vIHRoZSBzYW1lIHJlcXVlc3RzIHNldmVyYWwgdGltZXMuXG4gIHZhciByZXF1ZXN0cyA9IHt9O1xuXG4gIC8vIGRlZmF1bHQgY291Y2hEQiB1c2VyIGRvYyBwcmVmaXhcbiAgdmFyIHVzZXJEb2NQcmVmaXggPSAnb3JnLmNvdWNoZGIudXNlcic7XG5cbiAgLy8gYWRkIGV2ZW50cyBBUElcbiAgZXZlbnRzKHtcbiAgICBjb250ZXh0OiBhY2NvdW50LFxuICAgIG5hbWVzcGFjZTogJ2FjY291bnQnXG4gIH0pO1xuXG4gIC8vIEF1dGhlbnRpY2F0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFVzZSB0aGlzIG1ldGhvZCB0byBhc3N1cmUgdGhhdCB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkOlxuICAvLyBgaG9vZGllLmFjY291bnQuYXV0aGVudGljYXRlKCkuZG9uZSggZG9Tb21ldGhpbmcgKS5mYWlsKCBoYW5kbGVFcnJvciApYFxuICAvL1xuICBhY2NvdW50LmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uIGF1dGhlbnRpY2F0ZSgpIHtcbiAgICB2YXIgc2VuZEFuZEhhbmRsZUF1dGhSZXF1ZXN0O1xuXG4gICAgLy8gYWxyZWFkeSB0cmllZCB0byBhdXRoZW50aWNhdGUsIGFuZCBmYWlsZWRcbiAgICBpZiAoYXV0aGVudGljYXRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3QoKTtcbiAgICB9XG5cbiAgICAvLyBhbHJlYWR5IHRyaWVkIHRvIGF1dGhlbnRpY2F0ZSwgYW5kIHN1Y2NlZWRlZFxuICAgIGlmIChhdXRoZW50aWNhdGVkID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZVdpdGgoYWNjb3VudC51c2VybmFtZSk7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBwZW5kaW5nIHNpZ25PdXQgcmVxdWVzdCwgcmV0dXJuIGl0cyBwcm9taXNlLFxuICAgIC8vIGJ1dCBwaXBlIGl0IHNvIHRoYXQgaXQgYWx3YXlzIGVuZHMgdXAgcmVqZWN0ZWRcbiAgICAvL1xuICAgIGlmIChyZXF1ZXN0cy5zaWduT3V0ICYmIHJlcXVlc3RzLnNpZ25PdXQuc3RhdGUoKSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdHMuc2lnbk91dC50aGVuKHByb21pc2VzLnJlamVjdFdpdGgpO1xuICAgIH1cblxuICAgIC8vIGlmIHRoZXJlIGlzIGEgcGVuZGluZyBzaWduSW4gcmVxdWVzdCwgcmV0dXJuIGl0cyBwcm9taXNlXG4gICAgLy9cbiAgICBpZiAocmVxdWVzdHMuc2lnbkluICYmIHJlcXVlc3RzLnNpZ25Jbi5zdGF0ZSgpID09PSAncGVuZGluZycpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0cy5zaWduSW47XG4gICAgfVxuXG4gICAgLy8gaWYgdXNlcm5hbWUgaXMgbm90IHNldCwgbWFrZSBzdXJlIHRvIGVuZCB0aGUgc2Vzc2lvblxuICAgIGlmIChhY2NvdW50LnVzZXJuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzZW5kU2lnbk91dFJlcXVlc3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBhdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3QoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNlbmQgcmVxdWVzdCB0byBjaGVjayBmb3Igc2Vzc2lvbiBzdGF0dXMuIElmIHRoZXJlIGlzIGFcbiAgICAvLyBwZW5kaW5nIHJlcXVlc3QgYWxyZWFkeSwgcmV0dXJuIGl0cyBwcm9taXNlLlxuICAgIC8vXG4gICAgc2VuZEFuZEhhbmRsZUF1dGhSZXF1ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5yZXF1ZXN0KCdHRVQnLCAnL19zZXNzaW9uJykudGhlbihcbiAgICAgICAgaGFuZGxlQXV0aGVudGljYXRlUmVxdWVzdFN1Y2Nlc3MsXG4gICAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHdpdGhTaW5nbGVSZXF1ZXN0KCdhdXRoZW50aWNhdGUnLCBzZW5kQW5kSGFuZGxlQXV0aFJlcXVlc3QpO1xuICB9O1xuXG5cbiAgLy8gc2lnbiB1cCB3aXRoIHVzZXJuYW1lICYgcGFzc3dvcmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHVzZXMgc3RhbmRhcmQgQ291Y2hEQiBBUEkgdG8gY3JlYXRlIGEgbmV3IGRvY3VtZW50IGluIF91c2VycyBkYi5cbiAgLy8gVGhlIGJhY2tlbmQgd2lsbCBhdXRvbWF0aWNhbGx5IGNyZWF0ZSBhIHVzZXJEQiBiYXNlZCBvbiB0aGUgdXNlcm5hbWVcbiAgLy8gYWRkcmVzcyBhbmQgYXBwcm92ZSB0aGUgYWNjb3VudCBieSBhZGRpbmcgYSAnY29uZmlybWVkJyByb2xlIHRvIHRoZVxuICAvLyB1c2VyIGRvYy4gVGhlIGFjY291bnQgY29uZmlybWF0aW9uIG1pZ2h0IHRha2UgYSB3aGlsZSwgc28gd2Uga2VlcCB0cnlpbmdcbiAgLy8gdG8gc2lnbiBpbiB3aXRoIGEgMzAwbXMgdGltZW91dC5cbiAgLy9cbiAgYWNjb3VudC5zaWduVXAgPSBmdW5jdGlvbiBzaWduVXAodXNlcm5hbWUsIHBhc3N3b3JkKSB7XG5cbiAgICBpZiAocGFzc3dvcmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFzc3dvcmQgPSAnJztcbiAgICB9XG5cbiAgICBpZiAoIXVzZXJuYW1lKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVqZWN0V2l0aCh7XG4gICAgICAgIGVycm9yOiAndXNlcm5hbWUgbXVzdCBiZSBzZXQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoYWNjb3VudC5oYXNBbm9ueW1vdXNBY2NvdW50KCkpIHtcbiAgICAgIHJldHVybiB1cGdyYWRlQW5vbnltb3VzQWNjb3VudCh1c2VybmFtZSwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIGlmIChhY2NvdW50Lmhhc0FjY291bnQoKSkge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoe1xuICAgICAgICBlcnJvcjogJ3lvdSBoYXZlIHRvIHNpZ24gb3V0IGZpcnN0J1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gZG93bmNhc2UgdXNlcm5hbWVcbiAgICB1c2VybmFtZSA9IHVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgX2lkOiB1c2VyRG9jS2V5KHVzZXJuYW1lKSxcbiAgICAgICAgbmFtZTogdXNlclR5cGVBbmRJZCh1c2VybmFtZSksXG4gICAgICAgIHR5cGU6ICd1c2VyJyxcbiAgICAgICAgcm9sZXM6IFtdLFxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICAgIG93bmVySGFzaDogYWNjb3VudC5vd25lckhhc2gsXG4gICAgICAgIGRhdGFiYXNlOiBhY2NvdW50LmRiKCksXG4gICAgICAgIHVwZGF0ZWRBdDogbm93KCksXG4gICAgICAgIGNyZWF0ZWRBdDogbm93KCksXG4gICAgICAgIHNpZ25lZFVwQXQ6IHVzZXJuYW1lICE9PSBhY2NvdW50Lm93bmVySGFzaCA/IG5vdygpIDogdm9pZCAwXG4gICAgICB9KSxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbidcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFjY291bnQucmVxdWVzdCgnUFVUJywgdXNlckRvY1VybCh1c2VybmFtZSksIG9wdGlvbnMpLnRoZW4oXG4gICAgICBoYW5kbGVTaWduVXBTdWNjZXModXNlcm5hbWUsIHBhc3N3b3JkKSxcbiAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICk7XG4gIH07XG5cblxuICAvLyBhbm9ueW1vdXMgc2lnbiB1cFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSWYgdGhlIHVzZXIgZGlkIG5vdCBzaWduIHVwIGhpbXNlbGYgeWV0LCBidXQgZGF0YSBuZWVkcyB0byBiZSB0cmFuc2ZlcmVkXG4gIC8vIHRvIHRoZSBjb3VjaCwgZS5nLiB0byBzZW5kIGFuIGVtYWlsIG9yIHRvIHNoYXJlIGRhdGEsIHRoZSBhbm9ueW1vdXNTaWduVXBcbiAgLy8gbWV0aG9kIGNhbiBiZSB1c2VkLiBJdCBnZW5lcmF0ZXMgYSByYW5kb20gcGFzc3dvcmQgYW5kIHN0b3JlcyBpdCBsb2NhbGx5XG4gIC8vIGluIHRoZSBicm93c2VyLlxuICAvL1xuICAvLyBJZiB0aGUgdXNlciBzaWduZXMgdXAgZm9yIHJlYWwgbGF0ZXIsIHdlICd1cGdyYWRlJyBoaXMgYWNjb3VudCwgbWVhbmluZyB3ZVxuICAvLyBjaGFuZ2UgaGlzIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBpbnRlcm5hbGx5IGluc3RlYWQgb2YgY3JlYXRpbmcgYW5vdGhlciB1c2VyLlxuICAvL1xuICBhY2NvdW50LmFub255bW91c1NpZ25VcCA9IGZ1bmN0aW9uIGFub255bW91c1NpZ25VcCgpIHtcbiAgICB2YXIgcGFzc3dvcmQgPSB1dWlkKDEwKTtcbiAgICB2YXIgdXNlcm5hbWUgPSBhY2NvdW50Lm93bmVySGFzaDtcblxuICAgIHJldHVybiBhY2NvdW50LnNpZ25VcCh1c2VybmFtZSwgcGFzc3dvcmQpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICBzZXRBbm9ueW1vdXNQYXNzd29yZChwYXNzd29yZCk7XG4gICAgICByZXR1cm4gYWNjb3VudC50cmlnZ2VyKCdzaWdudXA6YW5vbnltb3VzJywgdXNlcm5hbWUpO1xuICAgIH0pO1xuICB9O1xuXG5cbiAgLy8gaGFzQWNjb3VudFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1xuICBhY2NvdW50Lmhhc0FjY291bnQgPSBmdW5jdGlvbiBoYXNBY2NvdW50KCkge1xuICAgIHJldHVybiAhIWFjY291bnQudXNlcm5hbWU7XG4gIH07XG5cblxuICAvLyBoYXNBbm9ueW1vdXNBY2NvdW50XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGFjY291bnQuaGFzQW5vbnltb3VzQWNjb3VudCA9IGZ1bmN0aW9uIGhhc0Fub255bW91c0FjY291bnQoKSB7XG4gICAgcmV0dXJuIGdldEFub255bW91c1Bhc3N3b3JkKCkgIT09IHVuZGVmaW5lZDtcbiAgfTtcblxuXG4gIC8vIHNldCAvIGdldCAvIHJlbW92ZSBhbm9ueW1vdXMgcGFzc3dvcmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9cbiAgdmFyIGFub255bW91c1Bhc3N3b3JkS2V5ID0gJ19hY2NvdW50LmFub255bW91c1Bhc3N3b3JkJztcblxuICBmdW5jdGlvbiBzZXRBbm9ueW1vdXNQYXNzd29yZChwYXNzd29yZCkge1xuICAgIHJldHVybiBjb25maWcuc2V0KGFub255bW91c1Bhc3N3b3JkS2V5LCBwYXNzd29yZCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBbm9ueW1vdXNQYXNzd29yZCgpIHtcbiAgICByZXR1cm4gY29uZmlnLmdldChhbm9ueW1vdXNQYXNzd29yZEtleSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVBbm9ueW1vdXNQYXNzd29yZCgpIHtcbiAgICByZXR1cm4gY29uZmlnLnVuc2V0KGFub255bW91c1Bhc3N3b3JkS2V5KTtcbiAgfVxuXG5cbiAgLy8gc2lnbiBpbiB3aXRoIHVzZXJuYW1lICYgcGFzc3dvcmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHVzZXMgc3RhbmRhcmQgQ291Y2hEQiBBUEkgdG8gY3JlYXRlIGEgbmV3IHVzZXIgc2Vzc2lvbiAoUE9TVCAvX3Nlc3Npb24pLlxuICAvLyBCZXNpZGVzIHRoZSBzdGFuZGFyZCBzaWduIGluIHdlIGFsc28gY2hlY2sgaWYgdGhlIGFjY291bnQgaGFzIGJlZW4gY29uZmlybWVkXG4gIC8vIChyb2xlcyBpbmNsdWRlICdjb25maXJtZWQnIHJvbGUpLlxuICAvL1xuICAvLyBOT1RFOiBXaGVuIHNpZ25pbmcgaW4sIGFsbCBsb2NhbCBkYXRhIGdldHMgY2xlYXJlZCBiZWZvcmVoYW5kICh3aXRoIGEgc2lnbk91dCkuXG4gIC8vICAgICAgIE90aGVyd2lzZSBkYXRhIHRoYXQgaGFzIGJlZW4gY3JlYXRlZCBiZWZvcmVoYW5kIChhdXRoZW50aWNhdGVkIHdpdGhcbiAgLy8gICAgICAgYW5vdGhlciB1c2VyIGFjY291bnQgb3IgYW5vbnltb3VzbHkpIHdvdWxkIGJlIG1lcmdlZCBpbnRvIHRoZSB1c2VyXG4gIC8vICAgICAgIGFjY291bnQgdGhhdCBzaWducyBpbi4gVGhhdCBhcHBsaWVzIG9ubHkgaWYgdXNlcm5hbWUgaXNuJ3QgdGhlIHNhbWUgYXNcbiAgLy8gICAgICAgY3VycmVudCB1c2VybmFtZS5cbiAgLy9cbiAgYWNjb3VudC5zaWduSW4gPSBmdW5jdGlvbiBzaWduSW4odXNlcm5hbWUsIHBhc3N3b3JkKSB7XG5cbiAgICBpZiAodXNlcm5hbWUgPT09IG51bGwpIHtcbiAgICAgIHVzZXJuYW1lID0gJyc7XG4gICAgfVxuXG4gICAgaWYgKHBhc3N3b3JkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhc3N3b3JkID0gJyc7XG4gICAgfVxuXG4gICAgLy8gZG93bmNhc2VcbiAgICB1c2VybmFtZSA9IHVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAodXNlcm5hbWUgIT09IGFjY291bnQudXNlcm5hbWUpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LnNpZ25PdXQoe1xuICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZW5kU2lnbkluUmVxdWVzdCh1c2VybmFtZSwgcGFzc3dvcmQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzZW5kU2lnbkluUmVxdWVzdCh1c2VybmFtZSwgcGFzc3dvcmQsIHtcbiAgICAgICAgcmVhdXRoZW50aWNhdGVkOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cblxuICAvLyBzaWduIG91dFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyB1c2VzIHN0YW5kYXJkIENvdWNoREIgQVBJIHRvIGludmFsaWRhdGUgYSB1c2VyIHNlc3Npb24gKERFTEVURSAvX3Nlc3Npb24pXG4gIC8vXG4gIGFjY291bnQuc2lnbk91dCA9IGZ1bmN0aW9uIHNpZ25PdXQob3B0aW9ucykge1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBpZiAoIWFjY291bnQuaGFzQWNjb3VudCgpKSB7XG4gICAgICByZXR1cm4gY2xlYW51cCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICByZXR1cm4gYWNjb3VudC50cmlnZ2VyKCdzaWdub3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZW1vdGUuZGlzY29ubmVjdCgpO1xuICAgIHJldHVybiBzZW5kU2lnbk91dFJlcXVlc3QoKS50aGVuKGNsZWFudXBBbmRUcmlnZ2VyU2lnbk91dCk7XG4gIH07XG5cblxuICAvLyBSZXF1ZXN0XG4gIC8vIC0tLVxuXG4gIC8vIHNob3J0Y3V0IGZvciBgaG9vZGllLnJlcXVlc3RgXG4gIC8vXG4gIGFjY291bnQucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QodHlwZSwgcGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiByZXF1ZXN0LmFwcGx5KGFyZ3VtZW50cyk7XG4gIH07XG5cblxuICAvLyBkYlxuICAvLyAtLS0tXG5cbiAgLy8gcmV0dXJuIG5hbWUgb2YgZGJcbiAgLy9cbiAgYWNjb3VudC5kYiA9IGZ1bmN0aW9uIGRiKCkge1xuICAgIHJldHVybiAndXNlci8nICsgYWNjb3VudC5vd25lckhhc2g7XG4gIH07XG5cblxuICAvLyBmZXRjaFxuICAvLyAtLS0tLS0tXG5cbiAgLy8gZmV0Y2hlcyBfdXNlcnMgZG9jIGZyb20gQ291Y2hEQiBhbmQgY2FjaGVzIGl0IGluIF9kb2NcbiAgLy9cbiAgYWNjb3VudC5mZXRjaCA9IGZ1bmN0aW9uIGZldGNoKHVzZXJuYW1lKSB7XG5cbiAgICBpZiAodXNlcm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdXNlcm5hbWUgPSBhY2NvdW50LnVzZXJuYW1lO1xuICAgIH1cblxuICAgIGlmICghdXNlcm5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKHtcbiAgICAgICAgZXJyb3I6ICd1bmF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICByZWFzb246ICdub3QgbG9nZ2VkIGluJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdpdGhTaW5nbGVSZXF1ZXN0KCdmZXRjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFjY291bnQucmVxdWVzdCgnR0VUJywgdXNlckRvY1VybCh1c2VybmFtZSkpLnRoZW4oXG4gICAgICAgIG51bGwsXG4gICAgICAgIGhhbmRsZVJlcXVlc3RFcnJvclxuICAgICAgKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIHVzZXJEb2MgPSByZXNwb25zZTtcbiAgICAgICAgcmV0dXJuIHVzZXJEb2M7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vIGNoYW5nZSBwYXNzd29yZFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIE5vdGU6IHRoZSBob29kaWUgQVBJIHJlcXVpcmVzIHRoZSBjdXJyZW50UGFzc3dvcmQgZm9yIHNlY3VyaXR5IHJlYXNvbnMsXG4gIC8vIGJ1dCBjb3VjaERiIGRvZXNuJ3QgcmVxdWlyZSBpdCBmb3IgYSBwYXNzd29yZCBjaGFuZ2UsIHNvIGl0J3MgaWdub3JlZFxuICAvLyBpbiB0aGlzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBob29kaWUgQVBJLlxuICAvL1xuICBhY2NvdW50LmNoYW5nZVBhc3N3b3JkID0gZnVuY3Rpb24gY2hhbmdlUGFzc3dvcmQoY3VycmVudFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuXG4gICAgaWYgKCFhY2NvdW50LnVzZXJuYW1lKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVqZWN0V2l0aCh7XG4gICAgICAgIGVycm9yOiAndW5hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgcmVhc29uOiAnbm90IGxvZ2dlZCBpbidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW90ZS5kaXNjb25uZWN0KCk7XG5cbiAgICByZXR1cm4gYWNjb3VudC5mZXRjaCgpLnRoZW4oXG4gICAgICBzZW5kQ2hhbmdlVXNlcm5hbWVBbmRQYXNzd29yZFJlcXVlc3QoY3VycmVudFBhc3N3b3JkLCBudWxsLCBuZXdQYXNzd29yZCksXG4gICAgICBoYW5kbGVSZXF1ZXN0RXJyb3JcbiAgICApO1xuICB9O1xuXG5cbiAgLy8gcmVzZXQgcGFzc3dvcmRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoaXMgaXMga2luZCBvZiBhIGhhY2suIFdlIG5lZWQgdG8gY3JlYXRlIGFuIG9iamVjdCBhbm9ueW1vdXNseVxuICAvLyB0aGF0IGlzIG5vdCBleHBvc2VkIHRvIG90aGVycy4gVGhlIG9ubHkgQ291Y2hEQiBBUEkgb3RoZXJpbmcgc3VjaFxuICAvLyBmdW5jdGlvbmFsaXR5IGlzIHRoZSBfdXNlcnMgZGF0YWJhc2UuXG4gIC8vXG4gIC8vIFNvIHdlIGFjdHVhbHkgc2lnbiB1cCBhIG5ldyBjb3VjaERCIHVzZXIgd2l0aCBzb21lIHNwZWNpYWwgYXR0cmlidXRlcy5cbiAgLy8gSXQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgdGhlIHBhc3N3b3JkIHJlc2V0IHdvcmtlciBhbmQgcmVtb3ZlZWRcbiAgLy8gb25jZSB0aGUgcGFzc3dvcmQgd2FzIHJlc2V0dGVkLlxuICAvL1xuICBhY2NvdW50LnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiByZXNldFBhc3N3b3JkKHVzZXJuYW1lKSB7XG4gICAgdmFyIGRhdGEsIGtleSwgb3B0aW9ucywgcmVzZXRQYXNzd29yZElkO1xuXG4gICAgcmVzZXRQYXNzd29yZElkID0gY29uZmlnLmdldCgnX2FjY291bnQucmVzZXRQYXNzd29yZElkJyk7XG5cbiAgICBpZiAocmVzZXRQYXNzd29yZElkKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5jaGVja1Bhc3N3b3JkUmVzZXQoKTtcbiAgICB9XG5cbiAgICByZXNldFBhc3N3b3JkSWQgPSAnJyArIHVzZXJuYW1lICsgJy8nICsgKHV1aWQoKSk7XG5cbiAgICBjb25maWcuc2V0KCdfYWNjb3VudC5yZXNldFBhc3N3b3JkSWQnLCByZXNldFBhc3N3b3JkSWQpO1xuXG4gICAga2V5ID0gJycgKyB1c2VyRG9jUHJlZml4ICsgJzokcGFzc3dvcmRSZXNldC8nICsgcmVzZXRQYXNzd29yZElkO1xuXG4gICAgZGF0YSA9IHtcbiAgICAgIF9pZDoga2V5LFxuICAgICAgbmFtZTogJyRwYXNzd29yZFJlc2V0LycgKyByZXNldFBhc3N3b3JkSWQsXG4gICAgICB0eXBlOiAndXNlcicsXG4gICAgICByb2xlczogW10sXG4gICAgICBwYXNzd29yZDogcmVzZXRQYXNzd29yZElkLFxuICAgICAgY3JlYXRlZEF0OiBub3coKSxcbiAgICAgIHVwZGF0ZWRBdDogbm93KClcbiAgICB9O1xuXG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH07XG5cbiAgICAvLyBUT0RPOiBzcGVjIHRoYXQgY2hlY2tQYXNzd29yZFJlc2V0IGdldHMgZXhlY3V0ZWRcbiAgICByZXR1cm4gd2l0aFByZXZpb3VzUmVxdWVzdHNBYm9ydGVkKCdyZXNldFBhc3N3b3JkJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5yZXF1ZXN0KCdQVVQnLCAnL191c2Vycy8nICsgKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKSwgb3B0aW9ucykudGhlbihcbiAgICAgICAgbnVsbCwgaGFuZGxlUmVxdWVzdEVycm9yXG4gICAgICApLmRvbmUoYWNjb3VudC5jaGVja1Bhc3N3b3JkUmVzZXQpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIGNoZWNrUGFzc3dvcmRSZXNldFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBjaGVjayBmb3IgdGhlIHN0YXR1cyBvZiBhIHBhc3N3b3JkIHJlc2V0LiBJdCBtaWdodCB0YWtlXG4gIC8vIGEgd2hpbGUgdW50aWwgdGhlIHBhc3N3b3JkIHJlc2V0IHdvcmtlciBwaWNrcyB1cCB0aGUgam9iXG4gIC8vIGFuZCB1cGRhdGVzIGl0XG4gIC8vXG4gIC8vIElmIGEgcGFzc3dvcmQgcmVzZXQgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bCwgdGhlICRwYXNzd29yZFJlcXVlc3RcbiAgLy8gZG9jIGdldHMgcmVtb3ZlZCBmcm9tIF91c2VycyBieSB0aGUgd29ya2VyLCB0aGVyZWZvcmUgYSA0MDEgaXNcbiAgLy8gd2hhdCB3ZSBhcmUgd2FpdGluZyBmb3IuXG4gIC8vXG4gIC8vIE9uY2UgY2FsbGVkLCBpdCBjb250aW51ZXMgdG8gcmVxdWVzdCB0aGUgc3RhdHVzIHVwZGF0ZSB3aXRoIGFcbiAgLy8gb25lIHNlY29uZCB0aW1lb3V0LlxuICAvL1xuICBhY2NvdW50LmNoZWNrUGFzc3dvcmRSZXNldCA9IGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmRSZXNldCgpIHtcbiAgICB2YXIgaGFzaCwgb3B0aW9ucywgcmVzZXRQYXNzd29yZElkLCB1cmwsIHVzZXJuYW1lO1xuXG4gICAgLy8gcmVqZWN0IGlmIHRoZXJlIGlzIG5vIHBlbmRpbmcgcGFzc3dvcmQgcmVzZXQgcmVxdWVzdFxuICAgIHJlc2V0UGFzc3dvcmRJZCA9IGNvbmZpZy5nZXQoJ19hY2NvdW50LnJlc2V0UGFzc3dvcmRJZCcpO1xuXG4gICAgaWYgKCFyZXNldFBhc3N3b3JkSWQpIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKHtcbiAgICAgICAgZXJyb3I6ICdtaXNzaW5nJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2VuZCByZXF1ZXN0IHRvIGNoZWNrIHN0YXR1cyBvZiBwYXNzd29yZCByZXNldFxuICAgIHVzZXJuYW1lID0gJyRwYXNzd29yZFJlc2V0LycgKyByZXNldFBhc3N3b3JkSWQ7XG4gICAgdXJsID0gJy9fdXNlcnMvJyArIChlbmNvZGVVUklDb21wb25lbnQodXNlckRvY1ByZWZpeCArICc6JyArIHVzZXJuYW1lKSk7XG4gICAgaGFzaCA9IGJ0b2EodXNlcm5hbWUgKyAnOicgKyByZXNldFBhc3N3b3JkSWQpO1xuXG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogJ0Jhc2ljICcgKyBoYXNoXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3aXRoUHJldmlvdXNSZXF1ZXN0c0Fib3J0ZWQoJ3Bhc3N3b3JkUmVzZXRTdGF0dXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhY2NvdW50LnJlcXVlc3QoJ0dFVCcsIHVybCwgb3B0aW9ucykudGhlbihcbiAgICAgICAgaGFuZGxlUGFzc3dvcmRSZXNldFN0YXR1c1JlcXVlc3RTdWNjZXNzLFxuICAgICAgICBoYW5kbGVQYXNzd29yZFJlc2V0U3RhdHVzUmVxdWVzdEVycm9yXG4gICAgICApLmZhaWwoZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yLmVycm9yID09PSAncGVuZGluZycpIHtcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhY2NvdW50LmNoZWNrUGFzc3dvcmRSZXNldCwgMTAwMCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2NvdW50LnRyaWdnZXIoJ3Bhc3N3b3JkX3Jlc2V0OmVycm9yJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vIGNoYW5nZSB1c2VybmFtZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIE5vdGU6IHRoZSBob29kaWUgQVBJIHJlcXVpcmVzIHRoZSBjdXJyZW50IHBhc3N3b3JkIGZvciBzZWN1cml0eSByZWFzb25zLFxuICAvLyBidXQgdGVjaG5pY2FsbHkgd2UgY2Fubm90ICh5ZXQpIHByZXZlbnQgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSB1c2VybmFtZVxuICAvLyB3aXRob3V0IGtub3dpbmcgdGhlIGN1cnJlbnQgcGFzc3dvcmQsIHNvIGl0J3Mgbm90IGltcHVsZW1lbnRlZCBpbiB0aGUgY3VycmVudFxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgaG9vZGllIEFQSS5cbiAgLy9cbiAgLy8gQnV0IHRoZSBjdXJyZW50IHBhc3N3b3JkIGlzIG5lZWRlZCB0byBsb2dpbiB3aXRoIHRoZSBuZXcgdXNlcm5hbWUuXG4gIC8vXG4gIGFjY291bnQuY2hhbmdlVXNlcm5hbWUgPSBmdW5jdGlvbiBjaGFuZ2VVc2VybmFtZShjdXJyZW50UGFzc3dvcmQsIG5ld1VzZXJuYW1lKSB7XG4gICAgbmV3VXNlcm5hbWUgPSBuZXdVc2VybmFtZSB8fCAnJztcbiAgICByZXR1cm4gY2hhbmdlVXNlcm5hbWVBbmRQYXNzd29yZChjdXJyZW50UGFzc3dvcmQsIG5ld1VzZXJuYW1lLnRvTG93ZXJDYXNlKCkpO1xuICB9O1xuXG5cbiAgLy8gZGVzdHJveVxuICAvLyAtLS0tLS0tLS1cblxuICAvLyBkZXN0cm95cyBhIHVzZXIncyBhY2NvdW50XG4gIC8vXG4gIGFjY291bnQuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKCFhY2NvdW50Lmhhc0FjY291bnQoKSkge1xuICAgICAgcmV0dXJuIGNsZWFudXBBbmRUcmlnZ2VyU2lnbk91dCgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY2NvdW50LmZldGNoKCkudGhlbihcbiAgICAgIGhhbmRsZUZldGNoQmVmb3JlRGVzdHJveVN1Y2Nlc3MsXG4gICAgICBoYW5kbGVGZXRjaEJlZm9yZURlc3Ryb3lFcnJvclxuICAgICkudGhlbihjbGVhbnVwQW5kVHJpZ2dlclNpZ25PdXQpO1xuICB9O1xuXG5cbiAgLy8gUFJJVkFURVxuICAvLyAtLS0tLS0tLS1cblxuICAvLyBzZXR0ZXJzXG4gIGZ1bmN0aW9uIHNldFVzZXJuYW1lKG5ld1VzZXJuYW1lKSB7XG4gICAgaWYgKGFjY291bnQudXNlcm5hbWUgPT09IG5ld1VzZXJuYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWNjb3VudC51c2VybmFtZSA9IG5ld1VzZXJuYW1lO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5zZXQoJ19hY2NvdW50LnVzZXJuYW1lJywgbmV3VXNlcm5hbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0T3duZXIobmV3T3duZXJIYXNoKSB7XG5cbiAgICBpZiAoYWNjb3VudC5vd25lckhhc2ggPT09IG5ld093bmVySGFzaCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjY291bnQub3duZXJIYXNoID0gbmV3T3duZXJIYXNoO1xuXG4gICAgLy8gYG93bmVySGFzaGAgaXMgc3RvcmVkIHdpdGggZXZlcnkgbmV3IG9iamVjdCBpbiB0aGUgY3JlYXRlZEJ5XG4gICAgLy8gYXR0cmlidXRlLiBJdCBkb2VzIG5vdCBnZXQgY2hhbmdlZCBvbmNlIGl0J3Mgc2V0LiBUaGF0J3Mgd2h5XG4gICAgLy8gd2UgaGF2ZSB0byBmb3JjZSBpdCB0byBiZSBjaGFuZ2UgZm9yIHRoZSBgJGNvbmZpZy9ob29kaWVgIG9iamVjdC5cbiAgICBjb25maWcuc2V0KCdjcmVhdGVkQnknLCBuZXdPd25lckhhc2gpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5zZXQoJ19hY2NvdW50Lm93bmVySGFzaCcsIG5ld093bmVySGFzaCk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIGhhbmRsZSBhIHN1Y2Nlc3NmdWwgYXV0aGVudGljYXRpb24gcmVxdWVzdC5cbiAgLy9cbiAgLy8gQXMgbG9uZyBhcyB0aGVyZSBpcyBubyBzZXJ2ZXIgZXJyb3Igb3IgaW50ZXJuZXQgY29ubmVjdGlvbiBpc3N1ZSxcbiAgLy8gdGhlIGF1dGhlbnRpY2F0ZSByZXF1ZXN0IChHRVQgL19zZXNzaW9uKSBkb2VzIGFsd2F5cyByZXR1cm5cbiAgLy8gYSAyMDAgc3RhdHVzLiBUbyBkaWZmZXJlbnRpYXRlIHdoZXRoZXIgdGhlIHVzZXIgaXMgc2lnbmVkIGluIG9yXG4gIC8vIG5vdCwgd2UgY2hlY2sgYHVzZXJDdHgubmFtZWAgaW4gdGhlIHJlc3BvbnNlLiBJZiB0aGUgdXNlciBpcyBub3RcbiAgLy8gc2lnbmVkIGluLCBpdCdzIG51bGwsIG90aGVyd2lzZSB0aGUgbmFtZSB0aGUgdXNlciBzaWduZWQgaW4gd2l0aFxuICAvL1xuICAvLyBJZiB0aGUgdXNlciBpcyBub3Qgc2lnbmVkIGluLCB3ZSBkaWZlZXJlbnRpYXRlIGJldHdlZW4gdXNlcnMgdGhhdFxuICAvLyBzaWduZWQgaW4gd2l0aCBhIHVzZXJuYW1lIC8gcGFzc3dvcmQgb3IgYW5vbnltb3VzbHkuIEZvciBhbm9ueW1vdXNcbiAgLy8gdXNlcnMsIHRoZSBwYXNzd29yZCBpcyBzdG9yZWQgaW4gbG9jYWwgc3RvcmUsIHNvIHdlIGRvbid0IG5lZWRcbiAgLy8gdG8gdHJpZ2dlciBhbiAndW5hdXRoZW50aWNhdGVkJyBlcnJvciwgYnV0IGluc3RlYWQgdHJ5IHRvIHNpZ24gaW4uXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUF1dGhlbnRpY2F0ZVJlcXVlc3RTdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlLnVzZXJDdHgubmFtZSkge1xuICAgICAgYXV0aGVudGljYXRlZCA9IHRydWU7XG4gICAgICBzZXRVc2VybmFtZShyZXNwb25zZS51c2VyQ3R4Lm5hbWUucmVwbGFjZSgvXnVzZXIoX2Fub255bW91cyk/XFwvLywgJycpKTtcbiAgICAgIHNldE93bmVyKHJlc3BvbnNlLnVzZXJDdHgucm9sZXNbMF0pO1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlc29sdmVXaXRoKGFjY291bnQudXNlcm5hbWUpO1xuICAgIH1cblxuICAgIGlmIChhY2NvdW50Lmhhc0Fub255bW91c0FjY291bnQoKSkge1xuICAgICAgcmV0dXJuIGFjY291bnQuc2lnbkluKGFjY291bnQudXNlcm5hbWUsIGdldEFub255bW91c1Bhc3N3b3JkKCkpO1xuICAgIH1cblxuICAgIGF1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcbiAgICBhY2NvdW50LnRyaWdnZXIoJ2Vycm9yOnVuYXV0aGVudGljYXRlZCcpO1xuICAgIHJldHVybiBwcm9taXNlcy5yZWplY3QoKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gc3RhbmRhcmQgZXJyb3IgaGFuZGxpbmcgZm9yIEFKQVggcmVxdWVzdHNcbiAgLy9cbiAgLy8gaW4gc29tZSBjYXNlIHdlIGdldCB0aGUgb2JqZWN0IGVycm9yIGRpcmVjdGx5LFxuICAvLyBpbiBvdGhlcnMgd2UgZ2V0IGFuIHhociBvciBldmVuIGp1c3QgYSBzdHJpbmcgYmFja1xuICAvLyB3aGVuIHRoZSBjb3VjaCBkaWVkIGVudGlyZWx5LiBXaGUgaGF2ZSB0byBoYW5kbGVcbiAgLy8gZWFjaCBjYXNlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3RFcnJvcihlcnJvcikge1xuICAgIHZhciBlO1xuXG4gICAgZXJyb3IgPSBlcnJvciB8fCB7fTtcblxuICAgIGlmIChlcnJvci5yZWFzb24pIHtcbiAgICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKGVycm9yKTtcbiAgICB9XG5cbiAgICB2YXIgeGhyID0gZXJyb3I7XG5cbiAgICB0cnkge1xuICAgICAgZXJyb3IgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgZSA9IF9lcnJvcjtcbiAgICAgIGVycm9yID0ge1xuICAgICAgICBlcnJvcjogeGhyLnJlc3BvbnNlVGV4dCB8fCAndW5rbm93bidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoZXJyb3IpO1xuICB9XG5cblxuICAvL1xuICAvLyBoYW5kbGUgcmVzcG9uc2Ugb2YgYSBzdWNjZXNzZnVsIHNpZ25VcCByZXF1ZXN0LlxuICAvLyBSZXNwb25zZSBsb29rcyBsaWtlOlxuICAvL1xuICAvLyAgICAge1xuICAvLyAgICAgICAgICdvayc6IHRydWUsXG4gIC8vICAgICAgICAgJ2lkJzogJ29yZy5jb3VjaGRiLnVzZXI6am9lJyxcbiAgLy8gICAgICAgICAncmV2JzogJzEtZTg3NDdkOWFlOTc3NjcwNmRhOTI4MTBiMWJhYTQyNDgnXG4gIC8vICAgICB9XG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVNpZ25VcFN1Y2Nlcyh1c2VybmFtZSwgcGFzc3dvcmQpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgYWNjb3VudC50cmlnZ2VyKCdzaWdudXAnLCB1c2VybmFtZSk7XG4gICAgICB1c2VyRG9jLl9yZXYgPSByZXNwb25zZS5yZXY7XG4gICAgICByZXR1cm4gZGVsYXllZFNpZ25Jbih1c2VybmFtZSwgcGFzc3dvcmQpO1xuICAgIH07XG4gIH1cblxuXG4gIC8vXG4gIC8vIGEgZGVsYXllZCBzaWduIGluIGlzIHVzZWQgYWZ0ZXIgc2lnbiB1cCBhbmQgYWZ0ZXIgYVxuICAvLyB1c2VybmFtZSBjaGFuZ2UuXG4gIC8vXG4gIGZ1bmN0aW9uIGRlbGF5ZWRTaWduSW4odXNlcm5hbWUsIHBhc3N3b3JkLCBvcHRpb25zLCBkZWZlcikge1xuXG4gICAgLy8gZGVsYXllZFNpZ25JbiBtaWdodCBjYWxsIGl0c2VsZiwgd2hlbiB0aGUgdXNlciBhY2NvdW50XG4gICAgLy8gaXMgcGVuZGluZy4gSW4gdGhpcyBjYXNlIGl0IHBhc3NlcyB0aGUgb3JpZ2luYWwgZGVmZXIsXG4gICAgLy8gdG8ga2VlcCBhIHJlZmVyZW5jZSBhbmQgZmluYWxseSByZXNvbHZlIC8gcmVqZWN0IGl0XG4gICAgLy8gYXQgc29tZSBwb2ludFxuICAgIGlmICghZGVmZXIpIHtcbiAgICAgIGRlZmVyID0gcHJvbWlzZXMuZGVmZXIoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlID0gc2VuZFNpZ25JblJlcXVlc3QodXNlcm5hbWUsIHBhc3N3b3JkKTtcbiAgICAgIHByb21pc2UuZG9uZShkZWZlci5yZXNvbHZlKTtcbiAgICAgIHByb21pc2UuZmFpbChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuZXJyb3IgPT09ICd1bmNvbmZpcm1lZCcpIHtcblxuICAgICAgICAgIC8vIEl0IG1pZ2h0IHRha2UgYSBiaXQgdW50aWwgdGhlIGFjY291bnQgaGFzIGJlZW4gY29uZmlybWVkXG4gICAgICAgICAgZGVsYXllZFNpZ25Jbih1c2VybmFtZSwgcGFzc3dvcmQsIG9wdGlvbnMsIGRlZmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlci5yZWplY3QuYXBwbHkoZGVmZXIsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSwgMzAwKTtcblxuICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHBhcnNlIGEgc3VjY2Vzc2Z1bCBzaWduIGluIHJlc3BvbnNlIGZyb20gY291Y2hEQi5cbiAgLy8gUmVzcG9uc2UgbG9va3MgbGlrZTpcbiAgLy9cbiAgLy8gICAgIHtcbiAgLy8gICAgICAgICAnb2snOiB0cnVlLFxuICAvLyAgICAgICAgICduYW1lJzogJ3Rlc3QxJyxcbiAgLy8gICAgICAgICAncm9sZXMnOiBbXG4gIC8vICAgICAgICAgICAgICdtdnU4NWh5JyxcbiAgLy8gICAgICAgICAgICAgJ2NvbmZpcm1lZCdcbiAgLy8gICAgICAgICBdXG4gIC8vICAgICB9XG4gIC8vXG4gIC8vIHdlIHdhbnQgdG8gdHVybiBpdCBpbnRvICd0ZXN0MScsICdtdnU4NWh5JyBvciByZWplY3QgdGhlIHByb21pc2VcbiAgLy8gaW4gY2FzZSBhbiBlcnJvciBvY2N1cmVkICgncm9sZXMnIGFycmF5IGNvbnRhaW5zICdlcnJvcicpXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVNpZ25JblN1Y2Nlc3Mob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICB2YXIgZGVmZXIsIHVzZXJuYW1lO1xuXG4gICAgICBkZWZlciA9IHByb21pc2VzLmRlZmVyKCk7XG4gICAgICB1c2VybmFtZSA9IHJlc3BvbnNlLm5hbWUucmVwbGFjZSgvXnVzZXIoX2Fub255bW91cyk/XFwvLywgJycpO1xuXG4gICAgICAvL1xuICAgICAgLy8gaWYgYW4gZXJyb3Igb2NjdXJlZCwgdGhlIHVzZXJEQiB3b3JrZXIgc3RvcmVzIGl0IHRvIHRoZSAkZXJyb3IgYXR0cmlidXRlXG4gICAgICAvLyBhbmQgYWRkcyB0aGUgJ2Vycm9yJyByb2xlIHRvIHRoZSB1c2VycyBkb2Mgb2JqZWN0LiBJZiB0aGUgdXNlciBoYXMgdGhlXG4gICAgICAvLyAnZXJyb3InIHJvbGUsIHdlIG5lZWQgdG8gZmV0Y2ggaGlzIF91c2VycyBkb2MgdG8gZmluZCBvdXQgd2hhdCB0aGUgZXJyb3JcbiAgICAgIC8vIGlzLCBiZWZvcmUgd2UgY2FuIHJlamVjdCB0aGUgcHJvbWlzZS5cbiAgICAgIC8vXG4gICAgICBpZiAocmVzcG9uc2Uucm9sZXMuaW5kZXhPZignZXJyb3InKSAhPT0gLTEpIHtcbiAgICAgICAgYWNjb3VudC5mZXRjaCh1c2VybmFtZSkuZmFpbChkZWZlci5yZWplY3QpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZmVyLnJlamVjdCh7XG4gICAgICAgICAgICBlcnJvcjogJ2Vycm9yJyxcbiAgICAgICAgICAgIHJlYXNvbjogdXNlckRvYy4kZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vXG4gICAgICAvLyBXaGVuIHRoZSB1c2VyREIgd29ya2VyIGNyZWF0ZWQgdGhlIGRhdGFiYXNlIGZvciB0aGUgdXNlciBhbmQgZXZlcnRoaW5nXG4gICAgICAvLyB3b3JrZWQgb3V0LCBpdCBhZGRzIHRoZSByb2xlICdjb25maXJtZWQnIHRvIHRoZSB1c2VyLiBJZiB0aGUgcm9sZSBpc1xuICAgICAgLy8gbm90IHByZXNlbnQgeWV0LCBpdCBtaWdodCBiZSB0aGF0IHRoZSB3b3JrZXIgZGlkbid0IHBpY2sgdXAgdGhlIHRoZVxuICAgICAgLy8gdXNlciBkb2MgeWV0LCBvciB0aGVyZSB3YXMgYW4gZXJyb3IuIEluIHRoaXMgY2FzZXMsIHdlIHJlamVjdCB0aGUgcHJvbWlzZVxuICAgICAgLy8gd2l0aCBhbiAndW5jb2Zpcm1lZCBlcnJvcidcbiAgICAgIC8vXG4gICAgICBpZiAocmVzcG9uc2Uucm9sZXMuaW5kZXhPZignY29uZmlybWVkJykgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBkZWZlci5yZWplY3Qoe1xuICAgICAgICAgIGVycm9yOiAndW5jb25maXJtZWQnLFxuICAgICAgICAgIHJlYXNvbjogJ2FjY291bnQgaGFzIG5vdCBiZWVuIGNvbmZpcm1lZCB5ZXQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzZXRVc2VybmFtZSh1c2VybmFtZSk7XG4gICAgICBzZXRPd25lcihyZXNwb25zZS5yb2xlc1swXSk7XG4gICAgICBhdXRoZW50aWNhdGVkID0gdHJ1ZTtcblxuICAgICAgLy9cbiAgICAgIC8vIG9wdGlvbnMudmVyYm9zZSBpcyB0cnVlLCB3aGVuIGEgdXNlciBtYW51YWxseSBzaWduZWQgdmlhIGhvb2RpZS5hY2NvdW50LnNpZ25JbigpLlxuICAgICAgLy8gV2UgbmVlZCB0byBkaWZmZXJlbnRpYXRlIHRvIG90aGVyIHNpZ25JbiByZXF1ZXN0cywgZm9yIGV4YW1wbGUgcmlnaHQgYWZ0ZXJcbiAgICAgIC8vIHRoZSBzaWdudXAgb3IgYWZ0ZXIgYSBzZXNzaW9uIHRpbWVkIG91dC5cbiAgICAgIC8vXG4gICAgICBpZiAoIShvcHRpb25zLnNpbGVudCB8fCBvcHRpb25zLnJlYXV0aGVudGljYXRlZCkpIHtcbiAgICAgICAgaWYgKGFjY291bnQuaGFzQW5vbnltb3VzQWNjb3VudCgpKSB7XG4gICAgICAgICAgYWNjb3VudC50cmlnZ2VyKCdzaWduaW46YW5vbnltb3VzJywgdXNlcm5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjY291bnQudHJpZ2dlcignc2lnbmluJywgdXNlcm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHVzZXIgcmVhdXRoZW50aWNhdGVkLCBtZWFuaW5nXG4gICAgICBpZiAob3B0aW9ucy5yZWF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgYWNjb3VudC50cmlnZ2VyKCdyZWF1dGhlbnRpY2F0ZWQnLCB1c2VybmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGFjY291bnQuZmV0Y2goKTtcbiAgICAgIHJldHVybiBkZWZlci5yZXNvbHZlKHVzZXJuYW1lLCByZXNwb25zZS5yb2xlc1swXSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gSWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc3NmdWwgdGhlcmUgbWlnaHQgaGF2ZSBvY2N1cmVkIGFuXG4gIC8vIGVycm9yLCB3aGljaCB0aGUgd29ya2VyIHN0b3JlZCBpbiB0aGUgc3BlY2lhbCAkZXJyb3IgYXR0cmlidXRlLlxuICAvLyBJZiB0aGF0IGhhcHBlbnMsIHdlIHJldHVybiBhIHJlamVjdGVkIHByb21pc2Ugd2l0aCB0aGUgJGVycm9yLFxuICAvLyBlcnJvci4gT3RoZXJ3aXNlIHJlamVjdCB0aGUgcHJvbWlzZSB3aXRoIGEgJ3BlbmRpbmcnIGVycm9yLFxuICAvLyBhcyB3ZSBhcmUgbm90IHdhaXRpbmcgZm9yIGEgc3VjY2VzcyBmdWxsIHJlc3BvbnNlLCBidXQgYSA0MDFcbiAgLy8gZXJyb3IsIGluZGljYXRpbmcgdGhhdCBvdXIgcGFzc3dvcmQgd2FzIGNoYW5nZWQgYW5kIG91clxuICAvLyBjdXJyZW50IHNlc3Npb24gaGFzIGJlZW4gaW52YWxpZGF0ZWRcbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlUGFzc3dvcmRSZXNldFN0YXR1c1JlcXVlc3RTdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgdmFyIGVycm9yO1xuXG4gICAgaWYgKHJlc3BvbnNlLiRlcnJvcikge1xuICAgICAgZXJyb3IgPSByZXNwb25zZS4kZXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0geyBlcnJvcjogJ3BlbmRpbmcnIH07XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKGVycm9yKTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gSWYgdGhlIGVycm9yIGlzIGEgNDAxLCBpdCdzIGV4YWN0bHkgd2hhdCB3ZSd2ZSBiZWVuIHdhaXRpbmcgZm9yLlxuICAvLyBJbiB0aGlzIGNhc2Ugd2UgcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlUGFzc3dvcmRSZXNldFN0YXR1c1JlcXVlc3RFcnJvcih4aHIpIHtcbiAgICBpZiAoeGhyLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICBjb25maWcudW5zZXQoJ19hY2NvdW50LnJlc2V0UGFzc3dvcmRJZCcpO1xuICAgICAgYWNjb3VudC50cmlnZ2VyKCdwYXNzd29yZHJlc2V0Jyk7XG5cbiAgICAgIHJldHVybiBwcm9taXNlcy5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0RXJyb3IoeGhyKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vXG4gIC8vIGNoYW5nZSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgaW4gMyBzdGVwc1xuICAvL1xuICAvLyAxLiBhc3N1cmUgd2UgaGF2ZSBhIHZhbGlkIHNlc3Npb25cbiAgLy8gMi4gdXBkYXRlIF91c2VycyBkb2Mgd2l0aCBuZXcgdXNlcm5hbWUgYW5kIG5ldyBwYXNzd29yZCAoaWYgcHJvdmlkZWQpXG4gIC8vIDMuIHNpZ24gaW4gd2l0aCBuZXcgY3JlZGVudGlhbHMgdG8gY3JlYXRlIG5ldyBzZXNpb24uXG4gIC8vXG4gIGZ1bmN0aW9uIGNoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmQoY3VycmVudFBhc3N3b3JkLCBuZXdVc2VybmFtZSwgbmV3UGFzc3dvcmQpIHtcblxuICAgIHJldHVybiBzZW5kU2lnbkluUmVxdWVzdChhY2NvdW50LnVzZXJuYW1lLCBjdXJyZW50UGFzc3dvcmQsIHtcbiAgICAgIHNpbGVudDogdHJ1ZVxuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5mZXRjaCgpLnRoZW4oXG4gICAgICAgIHNlbmRDaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkUmVxdWVzdChjdXJyZW50UGFzc3dvcmQsIG5ld1VzZXJuYW1lLCBuZXdQYXNzd29yZClcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHR1cm4gYW4gYW5vbnltb3VzIGFjY291bnQgaW50byBhIHJlYWwgYWNjb3VudFxuICAvL1xuICBmdW5jdGlvbiB1cGdyYWRlQW5vbnltb3VzQWNjb3VudCh1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICB2YXIgY3VycmVudFBhc3N3b3JkID0gZ2V0QW5vbnltb3VzUGFzc3dvcmQoKTtcblxuICAgIHJldHVybiBjaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkKGN1cnJlbnRQYXNzd29yZCwgdXNlcm5hbWUsIHBhc3N3b3JkKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgYWNjb3VudC50cmlnZ2VyKCdzaWdudXAnLCB1c2VybmFtZSk7XG4gICAgICByZW1vdmVBbm9ueW1vdXNQYXNzd29yZCgpO1xuICAgIH0pO1xuICB9XG5cblxuICAvL1xuICAvLyB3ZSBub3cgY2FuIGJlIHN1cmUgdGhhdCB3ZSBmZXRjaGVkIHRoZSBsYXRlc3QgX3VzZXJzIGRvYywgc28gd2UgY2FuIHVwZGF0ZSBpdFxuICAvLyB3aXRob3V0IGEgcG90ZW50aWFsIGNvbmZsaWN0IGVycm9yLlxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVGZXRjaEJlZm9yZURlc3Ryb3lTdWNjZXNzKCkge1xuXG4gICAgcmVtb3RlLmRpc2Nvbm5lY3QoKTtcbiAgICB1c2VyRG9jLl9kZWxldGVkID0gdHJ1ZTtcblxuICAgIHJldHVybiB3aXRoUHJldmlvdXNSZXF1ZXN0c0Fib3J0ZWQoJ3VwZGF0ZVVzZXJzRG9jJywgZnVuY3Rpb24oKSB7XG4gICAgICBhY2NvdW50LnJlcXVlc3QoJ1BVVCcsIHVzZXJEb2NVcmwoKSwge1xuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh1c2VyRG9jKSxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIGRlcGVuZGVuZCBvbiB3aGF0IGtpbmQgb2YgZXJyb3Igd2UgZ2V0LCB3ZSB3YW50IHRvIGlnbm9yZVxuICAvLyBpdCBvciBub3QuXG4gIC8vIFdoZW4gd2UgZ2V0IGEgJ25vdF9mb3VuZCcgaXQgbWVhbnMgdGhhdCB0aGUgX3VzZXJzIGRvYyBoYWJlXG4gIC8vIGJlZW4gcmVtb3ZlZCBhbHJlYWR5LCBzbyB3ZSBkb24ndCBuZWVkIHRvIGRvIGl0IGFueW1vcmUsIGJ1dFxuICAvLyBzdGlsbCB3YW50IHRvIGZpbmlzaCB0aGUgZGVzdHJveSBsb2NhbGx5LCBzbyB3ZSByZXR1cm4gYVxuICAvLyByZXNvbHZlZCBwcm9taXNlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUZldGNoQmVmb3JlRGVzdHJveUVycm9yKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLmVycm9yID09PSAnbm90X2ZvdW5kJykge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHByb21pc2VzLnJlamVjdFdpdGgoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIHJlbW92ZSBldmVyeXRoaW5nIGZvcm0gdGhlIGN1cnJlbnQgYWNjb3VudCwgc28gYSBuZXcgYWNjb3VudCBjYW4gYmUgaW5pdGlhdGVkLlxuICAvL1xuICBmdW5jdGlvbiBjbGVhbnVwKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIGhvb2RpZS5zdG9yZSBpcyBsaXN0ZW5pbmcgb24gdGhpcyBvbmVcbiAgICBhY2NvdW50LnRyaWdnZXIoJ2NsZWFudXAnKTtcbiAgICBhdXRoZW50aWNhdGVkID0gb3B0aW9ucy5hdXRoZW50aWNhdGVkO1xuICAgIGNvbmZpZy5jbGVhcigpO1xuICAgIHNldFVzZXJuYW1lKG9wdGlvbnMudXNlcm5hbWUpO1xuICAgIHNldE93bmVyKG9wdGlvbnMub3duZXJIYXNoIHx8IHV1aWQoKSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZSgpO1xuICB9XG5cblxuICAvL1xuICBmdW5jdGlvbiBjbGVhbnVwQW5kVHJpZ2dlclNpZ25PdXQoKSB7XG4gICAgcmV0dXJuIGNsZWFudXAoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFjY291bnQudHJpZ2dlcignc2lnbm91dCcpO1xuICAgIH0pO1xuICB9XG5cblxuICAvL1xuICAvLyBkZXBlbmRpbmcgb24gd2V0aGVyIHRoZSB1c2VyIHNpZ25lZFVwIG1hbnVhbGx5IG9yIGhhcyBiZWVuIHNpZ25lZCB1cFxuICAvLyBhbm9ueW1vdXNseSB0aGUgcHJlZml4IGluIHRoZSBDb3VjaERCIF91c2VycyBkb2MgZGlmZmVyZW50aWF0ZXMuXG4gIC8vIEFuIGFub255bW91cyB1c2VyIGlzIGNoYXJhY3Rlcml6ZWQgYnkgaXRzIHVzZXJuYW1lLCB0aGF0IGVxdWFsc1xuICAvLyBpdHMgb3duZXJIYXNoIChzZWUgYGFub255bW91c1NpZ25VcGApXG4gIC8vXG4gIC8vIFdlIGRpZmZlcmVudGlhdGUgd2l0aCBgaGFzQW5vbnltb3VzQWNjb3VudCgpYCwgYmVjYXVzZSBgdXNlclR5cGVBbmRJZGBcbiAgLy8gaXMgdXNlZCB3aXRoaW4gYHNpZ25VcGAgbWV0aG9kLCBzbyB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gZGlmZmVyZW50aWF0ZVxuICAvLyBiZXR3ZWVuIGFub255b211cyBhbmQgbm9ybWFsIHVzZXJzIGJlZm9yZSBhbiBhY2NvdW50IGhhcyBiZWVuIGNyZWF0ZWQuXG4gIC8vXG4gIGZ1bmN0aW9uIHVzZXJUeXBlQW5kSWQodXNlcm5hbWUpIHtcbiAgICB2YXIgdHlwZTtcblxuICAgIGlmICh1c2VybmFtZSA9PT0gYWNjb3VudC5vd25lckhhc2gpIHtcbiAgICAgIHR5cGUgPSAndXNlcl9hbm9ueW1vdXMnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ3VzZXInO1xuICAgIH1cbiAgICByZXR1cm4gJycgKyB0eXBlICsgJy8nICsgdXNlcm5hbWU7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHR1cm4gYSB1c2VybmFtZSBpbnRvIGEgdmFsaWQgX3VzZXJzIGRvYy5faWRcbiAgLy9cbiAgZnVuY3Rpb24gdXNlckRvY0tleSh1c2VybmFtZSkge1xuICAgIHVzZXJuYW1lID0gdXNlcm5hbWUgfHwgYWNjb3VudC51c2VybmFtZTtcbiAgICByZXR1cm4gJycgKyB1c2VyRG9jUHJlZml4ICsgJzonICsgKHVzZXJUeXBlQW5kSWQodXNlcm5hbWUpKTtcbiAgfVxuXG4gIC8vXG4gIC8vIGdldCBVUkwgb2YgbXkgX3VzZXJzIGRvY1xuICAvL1xuICBmdW5jdGlvbiB1c2VyRG9jVXJsKHVzZXJuYW1lKSB7XG4gICAgcmV0dXJuICcvX3VzZXJzLycgKyAoZW5jb2RlVVJJQ29tcG9uZW50KHVzZXJEb2NLZXkodXNlcm5hbWUpKSk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHVwZGF0ZSBteSBfdXNlcnMgZG9jLlxuICAvL1xuICAvLyBJZiBhIG5ldyB1c2VybmFtZSBoYXMgYmVlbiBwYXNzZWQsIHdlIHNldCB0aGUgc3BlY2lhbCBhdHRyaWJ1dCAkbmV3VXNlcm5hbWUuXG4gIC8vIFRoaXMgd2lsbCBsZXQgdGhlIHVzZXJuYW1lIGNoYW5nZSB3b3JrZXIgY3JlYXRlIGNyZWF0ZSBhIG5ldyBfdXNlcnMgZG9jIGZvclxuICAvLyB0aGUgbmV3IHVzZXJuYW1lIGFuZCByZW1vdmUgdGhlIGN1cnJlbnQgb25lXG4gIC8vXG4gIC8vIElmIGEgbmV3IHBhc3N3b3JkIGhhcyBiZWVuIHBhc3NlZCwgc2FsdCBhbmQgcGFzc3dvcmRfc2hhIGdldCByZW1vdmVkXG4gIC8vIGZyb20gX3VzZXJzIGRvYyBhbmQgYWRkIHRoZSBwYXNzd29yZCBpbiBjbGVhciB0ZXh0LiBDb3VjaERCIHdpbGwgcmVwbGFjZSBpdCB3aXRoXG4gIC8vIGFjY29yZGluZyBwYXNzd29yZF9zaGEgYW5kIGEgbmV3IHNhbHQgc2VydmVyIHNpZGVcbiAgLy9cbiAgZnVuY3Rpb24gc2VuZENoYW5nZVVzZXJuYW1lQW5kUGFzc3dvcmRSZXF1ZXN0KGN1cnJlbnRQYXNzd29yZCwgbmV3VXNlcm5hbWUsIG5ld1Bhc3N3b3JkKSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBwcmVwYXJlIHVwZGF0ZWQgX3VzZXJzIGRvY1xuICAgICAgdmFyIGRhdGEgPSAkLmV4dGVuZCh7fSwgdXNlckRvYyk7XG5cbiAgICAgIGlmIChuZXdVc2VybmFtZSkge1xuICAgICAgICBkYXRhLiRuZXdVc2VybmFtZSA9IG5ld1VzZXJuYW1lO1xuICAgICAgfVxuXG4gICAgICBkYXRhLnVwZGF0ZWRBdCA9IG5vdygpO1xuICAgICAgZGF0YS5zaWduZWRVcEF0ID0gZGF0YS5zaWduZWRVcEF0IHx8IG5vdygpO1xuXG4gICAgICAvLyB0cmlnZ2VyIHBhc3N3b3JkIHVwZGF0ZSB3aGVuIG5ld1Bhc3N3b3JkIHNldFxuICAgICAgaWYgKG5ld1Bhc3N3b3JkICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGV0ZSBkYXRhLnNhbHQ7XG4gICAgICAgIGRlbGV0ZSBkYXRhLnBhc3N3b3JkX3NoYTtcbiAgICAgICAgZGF0YS5wYXNzd29yZCA9IG5ld1Bhc3N3b3JkO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB3aXRoUHJldmlvdXNSZXF1ZXN0c0Fib3J0ZWQoJ3VwZGF0ZVVzZXJzRG9jJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhY2NvdW50LnJlcXVlc3QoJ1BVVCcsIHVzZXJEb2NVcmwoKSwgb3B0aW9ucykudGhlbihcbiAgICAgICAgICBoYW5kbGVDaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkUmVxdWVzdChuZXdVc2VybmFtZSwgbmV3UGFzc3dvcmQgfHwgY3VycmVudFBhc3N3b3JkKSxcbiAgICAgICAgICBoYW5kbGVSZXF1ZXN0RXJyb3JcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgfTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gZGVwZW5kaW5nIG9uIHdoZXRoZXIgYSBuZXdVc2VybmFtZSBoYXMgYmVlbiBwYXNzZWQsIHdlIGNhbiBzaWduIGluIHJpZ2h0IGF3YXlcbiAgLy8gb3IgaGF2ZSB0byB1c2UgdGhlIGRlbGF5ZWQgc2lnbiBpbiB0byBnaXZlIHRoZSB1c2VybmFtZSBjaGFuZ2Ugd29ya2VyIHNvbWUgdGltZVxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVDaGFuZ2VVc2VybmFtZUFuZFBhc3N3b3JkUmVxdWVzdChuZXdVc2VybmFtZSwgbmV3UGFzc3dvcmQpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW90ZS5kaXNjb25uZWN0KCk7XG5cbiAgICAgIGlmIChuZXdVc2VybmFtZSkge1xuICAgICAgICByZXR1cm4gZGVsYXllZFNpZ25JbihuZXdVc2VybmFtZSwgbmV3UGFzc3dvcmQsIHtcbiAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYWNjb3VudC5zaWduSW4oYWNjb3VudC51c2VybmFtZSwgbmV3UGFzc3dvcmQpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuXG4gIC8vXG4gIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBzYW1lIHJlcXVlc3QgZG9lc24ndCBnZXQgc2VudCB0d2ljZVxuICAvLyBieSBjYW5jZWxsaW5nIHRoZSBwcmV2aW91cyBvbmUuXG4gIC8vXG4gIGZ1bmN0aW9uIHdpdGhQcmV2aW91c1JlcXVlc3RzQWJvcnRlZChuYW1lLCByZXF1ZXN0RnVuY3Rpb24pIHtcbiAgICBpZiAocmVxdWVzdHNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0c1tuYW1lXS5hYm9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXF1ZXN0c1tuYW1lXS5hYm9ydCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXF1ZXN0c1tuYW1lXSA9IHJlcXVlc3RGdW5jdGlvbigpO1xuICAgIHJldHVybiByZXF1ZXN0c1tuYW1lXTtcbiAgfVxuXG5cbiAgLy9cbiAgLy8gaWYgdGhlcmUgaXMgYSBwZW5kaW5nIHJlcXVlc3QsIHJldHVybiBpdHMgcHJvbWlzZSBpbnN0ZWFkXG4gIC8vIG9mIHNlbmRpbmcgYW5vdGhlciByZXF1ZXN0XG4gIC8vXG4gIGZ1bmN0aW9uIHdpdGhTaW5nbGVSZXF1ZXN0KG5hbWUsIHJlcXVlc3RGdW5jdGlvbikge1xuXG4gICAgaWYgKHJlcXVlc3RzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgcmVxdWVzdHNbbmFtZV0uc3RhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKHJlcXVlc3RzW25hbWVdLnN0YXRlKCkgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgIHJldHVybiByZXF1ZXN0c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlcXVlc3RzW25hbWVdID0gcmVxdWVzdEZ1bmN0aW9uKCk7XG4gICAgcmV0dXJuIHJlcXVlc3RzW25hbWVdO1xuICB9XG5cblxuICAvL1xuICBmdW5jdGlvbiBzZW5kU2lnbk91dFJlcXVlc3QoKSB7XG4gICAgcmV0dXJuIHdpdGhTaW5nbGVSZXF1ZXN0KCdzaWduT3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYWNjb3VudC5yZXF1ZXN0KCdERUxFVEUnLCAnL19zZXNzaW9uJykudGhlbihudWxsLCBoYW5kbGVSZXF1ZXN0RXJyb3IpO1xuICAgIH0pO1xuICB9XG5cblxuICAvL1xuICAvLyB0aGUgc2lnbiBpbiByZXF1ZXN0IHRoYXQgc3RhcnRzIGEgQ291Y2hEQiBzZXNzaW9uIGlmXG4gIC8vIGl0IHN1Y2NlZWRzLiBXZSBzZXBhcmF0ZWQgdGhlIGFjdHVhbCBzaWduIGluIHJlcXVlc3QgZnJvbVxuICAvLyB0aGUgc2lnbkluIG1ldGhvZCwgYXMgdGhlIGxhdHRlciBhbHNvIHJ1bnMgc2lnbk91dCBpbnRlbnJ0YWxseVxuICAvLyB0byBjbGVhbiB1cCBsb2NhbCBkYXRhIGJlZm9yZSBzdGFydGluZyBhIG5ldyBzZXNzaW9uLiBCdXQgYXNcbiAgLy8gb3RoZXIgbWV0aG9kcyBsaWtlIHNpZ25VcCBvciBjaGFuZ2VQYXNzd29yZCBkbyBhbHNvIG5lZWQgdG9cbiAgLy8gc2lnbiBpbiB0aGUgdXNlciAoYWdhaW4pLCB0aGVzZSBuZWVkIHRvIHNlbmQgdGhlIHNpZ24gaW5cbiAgLy8gcmVxdWVzdCBidXQgd2l0aG91dCBhIHNpZ25PdXQgYmVmb3JlaGFuZCwgYXMgdGhlIHVzZXIgcmVtYWluc1xuICAvLyB0aGUgc2FtZS5cbiAgLy9cbiAgZnVuY3Rpb24gc2VuZFNpZ25JblJlcXVlc3QodXNlcm5hbWUsIHBhc3N3b3JkLCBvcHRpb25zKSB7XG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgZGF0YToge1xuICAgICAgICBuYW1lOiB1c2VyVHlwZUFuZElkKHVzZXJuYW1lKSxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB3aXRoUHJldmlvdXNSZXF1ZXN0c0Fib3J0ZWQoJ3NpZ25JbicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2UgPSBhY2NvdW50LnJlcXVlc3QoJ1BPU1QnLCAnL19zZXNzaW9uJywgcmVxdWVzdE9wdGlvbnMpO1xuXG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKFxuICAgICAgICBoYW5kbGVTaWduSW5TdWNjZXNzKG9wdGlvbnMpLFxuICAgICAgICBoYW5kbGVSZXF1ZXN0RXJyb3JcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvL1xuICBmdW5jdGlvbiBub3coKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG4gIH1cblxuXG4gIC8vIFRPRE86IHdlIHNob3VsZCBtb3ZlIHRoZSBvd25lciBoYXNoIG9uIGhvb2RpZSBjb3JlLCBhc1xuICAvLyAgICAgICBvdGhlciBtb2R1bGVzIGRlcGVuZCBvbiBpdCBhcyB3ZWxsLCBsaWtlIGhvb2RpZS5zdG9yZS5cbiAgLy8gdGhlIG93bmVySGFzaCBnZXRzIHN0b3JlZCBpbiBldmVyeSBvYmplY3QgY3JlYXRlZCBieSB0aGUgdXNlci5cbiAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgb25lLlxuICBhY2NvdW50Lm93bmVySGFzaCA9IGNvbmZpZy5nZXQoJ19hY2NvdW50Lm93bmVySGFzaCcpO1xuXG4gIGlmICghYWNjb3VudC5vd25lckhhc2gpIHtcbiAgICBzZXRPd25lcih1dWlkKCkpO1xuICB9XG5cbiAgcmV0dXJuIGFjY291bnQ7XG5cbn07XG4iLCIvKiBleHBvcnRlZCBob29kaWVDb25maWcgKi9cblxuLy8gSG9vZGllIENvbmZpZyBBUElcbi8vID09PT09PT09PT09PT09PT09PT1cblxuLy9cbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHR5cGUgPSAnJGNvbmZpZyc7XG4gIHZhciBpZCA9ICdob29kaWUnO1xuICB2YXIgY2FjaGUgPSB7fTtcblxuICAvLyBwdWJsaWMgQVBJXG4gIHZhciBjb25maWcgPSB7fTtcblxuXG4gIC8vIHNldFxuICAvLyAtLS0tLS0tLS0tXG5cbiAgLy8gYWRkcyBhIGNvbmZpZ3VyYXRpb25cbiAgLy9cbiAgY29uZmlnLnNldCA9IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgdmFyIGlzU2lsZW50LCB1cGRhdGU7XG5cbiAgICBpZiAoY2FjaGVba2V5XSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjYWNoZVtrZXldID0gdmFsdWU7XG5cbiAgICB1cGRhdGUgPSB7fTtcbiAgICB1cGRhdGVba2V5XSA9IHZhbHVlO1xuICAgIGlzU2lsZW50ID0ga2V5LmNoYXJBdCgwKSA9PT0gJ18nO1xuXG4gICAgcmV0dXJuIHN0b3JlLnVwZGF0ZU9yQWRkKHR5cGUsIGlkLCB1cGRhdGUsIHtcbiAgICAgIHNpbGVudDogaXNTaWxlbnRcbiAgICB9KTtcbiAgfTtcblxuICAvLyBnZXRcbiAgLy8gLS0tLS0tLS0tLVxuXG4gIC8vIHJlY2VpdmVzIGEgY29uZmlndXJhdGlvblxuICAvL1xuICBjb25maWcuZ2V0ID0gZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIHJldHVybiBjYWNoZVtrZXldO1xuICB9O1xuXG4gIC8vIGNsZWFyXG4gIC8vIC0tLS0tLS0tLS1cblxuICAvLyBjbGVhcnMgY2FjaGUgYW5kIHJlbW92ZXMgb2JqZWN0IGZyb20gc3RvcmVcbiAgLy9cbiAgY29uZmlnLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gc3RvcmUucmVtb3ZlKHR5cGUsIGlkKTtcbiAgfTtcblxuICAvLyB1bnNldFxuICAvLyAtLS0tLS0tLS0tXG5cbiAgLy8gdW5zZXRzIGEgY29uZmlndXJhdGlvbiwgaXMgYSBzaW1wbGUgYWxpYXMgZm9yIGNvbmZpZy5zZXQoa2V5LCB1bmRlZmluZWQpXG4gIC8vXG4gIGNvbmZpZy51bnNldCA9IGZ1bmN0aW9uIHVuc2V0KGtleSkge1xuICAgIHJldHVybiBjb25maWcuc2V0KGtleSwgdW5kZWZpbmVkKTtcbiAgfTtcblxuICAvLyBsb2FkIGNhY2hlXG4gIC8vIFRPRE86IEkgcmVhbGx5IGRvbid0IGxpa2UgdGhpcyBiZWluZyBoZXJlLiBBbmQgSSBkb24ndCBsaWtlIHRoYXQgaWYgdGhlXG4gIC8vICAgICAgIHN0b3JlIEFQSSB3aWxsIGJlIHRydWx5IGFzeW5jIG9uZSBkYXksIHRoaXMgd2lsbCBmYWxsIG9uIG91ciBmZWV0LlxuICBzdG9yZS5maW5kKHR5cGUsIGlkKS5kb25lKGZ1bmN0aW9uKG9iaikge1xuICAgIGNhY2hlID0gb2JqO1xuICB9KTtcblxuICAvLyBleHNwb3NlIHB1YmxpYyBBUElcbiAgcmV0dXJuIGNvbmZpZztcblxufTtcbiIsInZhciBnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIGV4cG9ydGVkIGhvb2RpZUNvbm5lY3Rpb24gKi9cblxuLy9cbi8vIGhvb2RpZS5jaGVja0Nvbm5lY3Rpb24oKSAmIGhvb2RpZS5pc0Nvbm5lY3RlZCgpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKTtcblxuLy8gc3RhdGVcbnZhciBvbmxpbmUgPSB0cnVlO1xudmFyIGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDA7XG52YXIgY2hlY2tDb25uZWN0aW9uUmVxdWVzdCA9IG51bGw7XG52YXIgY2hlY2tDb25uZWN0aW9uVGltZW91dCA9IG51bGw7XG5cbi8vIENoZWNrIENvbm5lY3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyB0aGUgYGNoZWNrQ29ubmVjdGlvbmAgbWV0aG9kIGlzIHVzZWQsIHdlbGwsIHRvIGNoZWNrIGlmXG4vLyB0aGUgaG9vZGllIGJhY2tlbmQgaXMgcmVhY2hhYmxlIGF0IGBiYXNlVXJsYCBvciBub3QuXG4vLyBDaGVjayBDb25uZWN0aW9uIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIHN0YXJ0dXBcbi8vIGFuZCB0aGVuIGVhY2ggMzAgc2Vjb25kcy4gSWYgaXQgZmFpbHMsIGl0XG4vL1xuLy8gLSBzZXRzIGBvbmxpbmUgPSBmYWxzZWBcbi8vIC0gdHJpZ2dlcnMgYG9mZmxpbmVgIGV2ZW50XG4vLyAtIHNldHMgYGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMGBcbi8vXG4vLyB3aGVuIGNvbm5lY3Rpb24gY2FuIGJlIHJlZXN0YWJsaXNoZWQsIGl0XG4vL1xuLy8gLSBzZXRzIGBvbmxpbmUgPSB0cnVlYFxuLy8gLSB0cmlnZ2VycyBgb25saW5lYCBldmVudFxuLy8gLSBzZXRzIGBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbCA9IDMwMDAwYFxuLy9cbnZhciBjaGVja0Nvbm5lY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByZXEgPSBjaGVja0Nvbm5lY3Rpb25SZXF1ZXN0O1xuXG4gIGlmIChyZXEgJiYgcmVxLnN0YXRlKCkgPT09ICdwZW5kaW5nJykge1xuICAgIHJldHVybiByZXE7XG4gIH1cblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0KGNoZWNrQ29ubmVjdGlvblRpbWVvdXQpO1xuXG4gIGNoZWNrQ29ubmVjdGlvblJlcXVlc3QgPSByZXF1ZXN0KCdHRVQnLCAnLycpLnRoZW4oXG4gICAgaGFuZGxlQ2hlY2tDb25uZWN0aW9uU3VjY2VzcyxcbiAgICBoYW5kbGVDaGVja0Nvbm5lY3Rpb25FcnJvclxuICApO1xuXG4gIHJldHVybiBjaGVja0Nvbm5lY3Rpb25SZXF1ZXN0O1xufTtcblxuXG4vLyBpc0Nvbm5lY3RlZFxuLy8gLS0tLS0tLS0tLS0tLVxuXG4vL1xudmFyIGlzQ29ubmVjdGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gb25saW5lO1xufTtcblxuXG4vL1xuLy9cbi8vXG5mdW5jdGlvbiBoYW5kbGVDaGVja0Nvbm5lY3Rpb25TdWNjZXNzKCkge1xuICBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbCA9IDMwMDAwO1xuXG4gIGNoZWNrQ29ubmVjdGlvblRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcbiAgICBleHBvcnRzLmNoZWNrQ29ubmVjdGlvbixcbiAgICBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbFxuICApO1xuXG4gIGlmICghZXhwb3J0cy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgZXZlbnRzLnRyaWdnZXIoJ3JlY29ubmVjdGVkJyk7XG4gICAgb25saW5lID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlcy5yZXNvbHZlKCk7XG59XG5cblxuLy9cbi8vXG4vL1xuZnVuY3Rpb24gaGFuZGxlQ2hlY2tDb25uZWN0aW9uRXJyb3IoKSB7XG4gIGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDtcblxuICBjaGVja0Nvbm5lY3Rpb25UaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXG4gICAgZXhwb3J0cy5jaGVja0Nvbm5lY3Rpb24sXG4gICAgY2hlY2tDb25uZWN0aW9uSW50ZXJ2YWxcbiAgKTtcblxuICBpZiAoZXhwb3J0cy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgZXZlbnRzLnRyaWdnZXIoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgIG9ubGluZSA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2VzLnJlamVjdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2hlY2tDb25uZWN0aW9uOiBjaGVja0Nvbm5lY3Rpb24sXG4gIGlzQ29ubmVjdGVkOiBpc0Nvbm5lY3RlZFxufTtcblxuIiwiLy9cbi8vIG9uZSBwbGFjZSB0byBydWxlIHRoZW0gYWxsIVxuLy9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gSU5WQUxJRF9LRVlcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyB0aHJvd24gd2hlbiBpbnZhbGlkIGtleXMgYXJlIHVzZWQgdG8gc3RvcmUgYW4gb2JqZWN0XG4gIC8vXG4gIElOVkFMSURfS0VZOiBmdW5jdGlvbiAoaWRPclR5cGUpIHtcbiAgICB2YXIga2V5ID0gaWRPclR5cGUuaWQgPyAnaWQnIDogJ3R5cGUnO1xuXG4gICAgcmV0dXJuIG5ldyBFcnJvcignaW52YWxpZCAnICsga2V5ICsgJ1xcJycgKyBpZE9yVHlwZVtrZXldICsgJ1xcJzogbnVtYmVycyBhbmQgbG93ZXJjYXNlIGxldHRlcnMgYWxsb3dlZCBvbmx5Jyk7XG4gIH0sXG5cbiAgLy8gSU5WQUxJRF9BUkdVTUVOVFNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIElOVkFMSURfQVJHVU1FTlRTOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtc2cpO1xuICB9LFxuXG4gIC8vIE5PVF9GT1VORFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vXG4gIE5PVF9GT1VORDogZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcignJyArIHR5cGUgKyAnIHdpdGggJyArIGlkICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfVxuXG59O1xuIiwiLyogZXhwb3J0ZWQgaG9vZGllRXZlbnRzICovXG5cbi8vXG4vLyBFdmVudHNcbi8vID09PT09PT09XG4vL1xuLy8gZXh0ZW5kIGFueSBDbGFzcyB3aXRoIHN1cHBvcnQgZm9yXG4vL1xuLy8gKiBgb2JqZWN0LmJpbmQoJ2V2ZW50JywgY2IpYFxuLy8gKiBgb2JqZWN0LnVuYmluZCgnZXZlbnQnLCBjYilgXG4vLyAqIGBvYmplY3QudHJpZ2dlcignZXZlbnQnLCBhcmdzLi4uKWBcbi8vICogYG9iamVjdC5vbmUoJ2V2JywgY2IpYFxuLy9cbi8vIGJhc2VkIG9uIFtFdmVudHMgaW1wbGVtZW50YXRpb25zIGZyb20gU3BpbmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9tYWNjbWFuL3NwaW5lL2Jsb2IvbWFzdGVyL3NyYy9zcGluZS5jb2ZmZWUjTDEpXG4vL1xuXG4vLyBjYWxsYmFja3MgYXJlIGdsb2JhbCwgd2hpbGUgdGhlIGV2ZW50cyBBUEkgaXMgdXNlZCBhdCBzZXZlcmFsIHBsYWNlcyxcbi8vIGxpa2UgaG9vZGllLm9uIC8gaG9vZGllLnN0b3JlLm9uIC8gaG9vZGllLnRhc2sub24gZXRjLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaG9vZGllLCBvcHRpb25zKSB7XG4gIHZhciBjb250ZXh0ID0gaG9vZGllO1xuICB2YXIgbmFtZXNwYWNlID0gJyc7XG5cbiAgLy8gbm9ybWFsaXplIG9wdGlvbnMgaGFzaFxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBtYWtlIHN1cmUgY2FsbGJhY2tzIGhhc2ggZXhpc3RzXG4gIGhvb2RpZS5ldmVudHNDYWxsYmFja3MgfHwgaG9vZGllLmV2ZW50c0NhbGxiYWNrcyB8fCB7fTtcblxuICBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dDtcbiAgICBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZSArICc6JztcbiAgfVxuXG4gIC8vIEJpbmRcbiAgLy8gLS0tLS0tXG4gIC8vXG4gIC8vIGJpbmQgYSBjYWxsYmFjayB0byBhbiBldmVudCB0cmlnZ2VyZCBieSB0aGUgb2JqZWN0XG4gIC8vXG4gIC8vICAgICBvYmplY3QuYmluZCAnY2hlYXQnLCBibGFtZVxuICAvL1xuICBmdW5jdGlvbiBiaW5kKGV2LCBjYWxsYmFjaykge1xuICAgIHZhciBldnMsIG5hbWUsIF9pLCBfbGVuO1xuXG4gICAgZXZzID0gZXYuc3BsaXQoJyAnKTtcblxuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZXZzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBuYW1lID0gbmFtZXNwYWNlICsgZXZzW19pXTtcbiAgICAgIGhvb2RpZS5ldmVudHNDYWxsYmFja3NbbmFtZV0gPSBob29kaWUuZXZlbnRzQ2FsbGJhY2tzW25hbWVdIHx8IFtdO1xuICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICAvLyBvbmVcbiAgLy8gLS0tLS1cbiAgLy9cbiAgLy8gc2FtZSBhcyBgYmluZGAsIGJ1dCBkb2VzIGdldCBleGVjdXRlZCBvbmx5IG9uY2VcbiAgLy9cbiAgLy8gICAgIG9iamVjdC5vbmUgJ2dyb3VuZFRvdWNoJywgZ2FtZU92ZXJcbiAgLy9cbiAgZnVuY3Rpb24gb25lKGV2LCBjYWxsYmFjaykge1xuICAgIGV2ID0gbmFtZXNwYWNlICsgZXY7XG4gICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGV4cG9ydHMudW5iaW5kKGV2LCB3cmFwcGVyKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBleHBvcnRzLmJpbmQoZXYsIHdyYXBwZXIpO1xuICB9XG5cbiAgLy8gdHJpZ2dlclxuICAvLyAtLS0tLS0tLS1cbiAgLy9cbiAgLy8gdHJpZ2dlciBhbiBldmVudCBhbmQgcGFzcyBvcHRpb25hbCBwYXJhbWV0ZXJzIGZvciBiaW5kaW5nLlxuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIgJ3dpbicsIHNjb3JlOiAxMjMwXG4gIC8vXG4gIGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgdmFyIGFyZ3MsIGNhbGxiYWNrLCBldiwgbGlzdCwgX2ksIF9sZW47XG5cbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIGV2ID0gYXJncy5zaGlmdCgpO1xuICAgIGV2ID0gbmFtZXNwYWNlICsgZXY7XG4gICAgbGlzdCA9IGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBsaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBjYWxsYmFjayA9IGxpc3RbX2ldO1xuICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyB1bmJpbmRcbiAgLy8gLS0tLS0tLS1cbiAgLy9cbiAgLy8gdW5iaW5kIHRvIGZyb20gYWxsIGJpbmRpbmdzLCBmcm9tIGFsbCBiaW5kaW5ncyBvZiBhIHNwZWNpZmljIGV2ZW50XG4gIC8vIG9yIGZyb20gYSBzcGVjaWZpYyBiaW5kaW5nLlxuICAvL1xuICAvLyAgICAgb2JqZWN0LnVuYmluZCgpXG4gIC8vICAgICBvYmplY3QudW5iaW5kICdtb3ZlJ1xuICAvLyAgICAgb2JqZWN0LnVuYmluZCAnbW92ZScsIGZvbGxvd1xuICAvL1xuICBmdW5jdGlvbiB1bmJpbmQoZXYsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNiLCBpLCBsaXN0LCBfaSwgX2xlbiwgZXZOYW1lcztcblxuICAgIGlmICghZXYpIHtcbiAgICAgIGlmICghbmFtZXNwYWNlKSB7XG4gICAgICAgIGhvb2RpZS5ldmVudHNDYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cblxuICAgICAgZXZOYW1lcyA9IE9iamVjdC5rZXlzKGhvb2RpZS5ldmVudHNDYWxsYmFja3MpO1xuICAgICAgZXZOYW1lcyA9IGV2TmFtZXMuZmlsdGVyKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMDtcbiAgICAgIH0pO1xuICAgICAgZXZOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBkZWxldGUgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1trZXldO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldiA9IG5hbWVzcGFjZSArIGV2O1xuXG4gICAgbGlzdCA9IGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgZGVsZXRlIGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IGxpc3QubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgICBjYiA9IGxpc3RbaV07XG5cblxuICAgICAgaWYgKGNiICE9PSBjYWxsYmFjaykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGlzdCA9IGxpc3Quc2xpY2UoKTtcbiAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tldl0gPSBsaXN0O1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiaW5kOiBiaW5kLFxuICAgIG9uOiBiaW5kLFxuICAgIG9uZTogb25lLFxuICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgdW5iaW5kOiB1bmJpbmQsXG4gICAgb2ZmOiB1bmJpbmRcbiAgfTtcblxufTtcblxuIiwiLyogZ2xvYmFsICQ6dHJ1ZSAqL1xuXG4vLyBPcGVuIHN0b3Jlc1xuLy8gLS0tLS0tLS0tLS0tLVxuXG52YXIgcmVtb3RlU3RvcmUgPSByZXF1aXJlKCcuL3JlbW90ZV9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUpIHtcbiAgdmFyICRleHRlbmQgPSAkLmV4dGVuZDtcblxuICAvLyBnZW5lcmljIG1ldGhvZCB0byBvcGVuIGEgc3RvcmUuIFVzZWQgYnlcbiAgLy9cbiAgLy8gKiBob29kaWUucmVtb3RlXG4gIC8vICogaG9vZGllLnVzZXIoXCJqb2VcIilcbiAgLy8gKiBob29kaWUuZ2xvYmFsXG4gIC8vICogLi4uIGFuZCBtb3JlXG4gIC8vXG4gIC8vICAgICBob29kaWUub3BlbihcInNvbWVfc3RvcmVfbmFtZVwiKS5maW5kQWxsKClcbiAgLy9cbiAgZnVuY3Rpb24gb3BlbihzdG9yZU5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICRleHRlbmQob3B0aW9ucywge1xuICAgICAgbmFtZTogc3RvcmVOYW1lXG4gICAgfSk7XG5cblxuICAgIHJldHVybiByZW1vdGVTdG9yZS5jYWxsKHRoaXMsIGhvb2RpZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvL1xuICAvLyBQdWJsaWMgQVBJXG4gIC8vXG4gIHJldHVybiBvcGVuO1xufTtcblxuIiwiLy8gSG9vZGllIERlZmVycyAvIFByb21pc2VzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gcmV0dXJucyBhIGRlZmVyIG9iamVjdCBmb3IgY3VzdG9tIHByb21pc2UgaGFuZGxpbmdzLlxuLy8gUHJvbWlzZXMgYXJlIGhlYXZlbHkgdXNlZCB0aHJvdWdob3V0IHRoZSBjb2RlIG9mIGhvb2RpZS5cbi8vIFdlIGN1cnJlbnRseSBib3Jyb3cgalF1ZXJ5J3MgaW1wbGVtZW50YXRpb246XG4vLyBodHRwOi8vYXBpLmpxdWVyeS5jb20vY2F0ZWdvcnkvZGVmZXJyZWQtb2JqZWN0L1xuLy9cbi8vICAgICBkZWZlciA9IGhvb2RpZS5kZWZlcigpXG4vLyAgICAgaWYgKGdvb2QpIHtcbi8vICAgICAgIGRlZmVyLnJlc29sdmUoJ2dvb2QuJylcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgZGVmZXIucmVqZWN0KCdub3QgZ29vZC4nKVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpXG4vL1xudmFyIGRmZCA9ICQuRGVmZXJyZWQoKTtcblxuLy8gcmV0dXJucyB0cnVlIGlmIHBhc3NlZCBvYmplY3QgaXMgYSBwcm9taXNlIChidXQgbm90IGEgZGVmZXJyZWQpLFxuLy8gb3RoZXJ3aXNlIGZhbHNlLlxuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICB2YXIgaGFzRG9uZSA9IHR5cGVvZiBvYmplY3QuZG9uZSA9PT0gJ2Z1bmN0aW9uJztcbiAgdmFyIGhhc1Jlc29sdmVkID0gdHlwZW9mIG9iamVjdC5yZXNvbHZlICE9PSAnZnVuY3Rpb24nO1xuXG4gIHJldHVybiAhIShvYmplY3QgJiYgaGFzRG9uZSAmJiBoYXNSZXNvbHZlZCk7XG59XG5cbi8vXG5mdW5jdGlvbiByZXNvbHZlKCkge1xuICByZXR1cm4gZGZkLnJlc29sdmUoKS5wcm9taXNlKCk7XG59XG5cblxuLy9cbmZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgcmV0dXJuIGRmZC5yZWplY3QoKS5wcm9taXNlKCk7XG59XG5cblxuLy9cbmZ1bmN0aW9uIHJlc29sdmVXaXRoKCkge1xuICByZXR1cm4gZGZkLnJlc29sdmUuYXBwbHkoZGZkLCBhcmd1bWVudHMpLnByb21pc2UoKTtcbn1cblxuLy9cbmZ1bmN0aW9uIHJlamVjdFdpdGgoKSB7XG4gIHJldHVybiBkZmQucmVqZWN0LmFwcGx5KGRmZCwgYXJndW1lbnRzKS5wcm9taXNlKCk7XG59XG5cbi8vXG4vLyBQdWJsaWMgQVBJXG4vL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlZmVyOiBkZmQsXG4gIGlzUHJvbWlzZTogaXNQcm9taXNlLFxuICByZXNvbHZlOiByZXNvbHZlLFxuICByZWplY3Q6IHJlamVjdCxcbiAgcmVzb2x2ZVdpdGg6IHJlc29sdmVXaXRoLFxuICByZWplY3RXaXRoOiByZWplY3RXaXRoXG59O1xuIiwiLy8gUmVtb3RlXG4vLyA9PT09PT09PVxuXG4vLyBDb25uZWN0aW9uIHRvIGEgcmVtb3RlIENvdWNoIERhdGFiYXNlLlxuLy9cbi8vIHN0b3JlIEFQSVxuLy8gLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIG9iamVjdCBsb2FkaW5nIC8gdXBkYXRpbmcgLyBkZWxldGluZ1xuLy9cbi8vICogZmluZCh0eXBlLCBpZClcbi8vICogZmluZEFsbCh0eXBlIClcbi8vICogYWRkKHR5cGUsIG9iamVjdClcbi8vICogc2F2ZSh0eXBlLCBpZCwgb2JqZWN0KVxuLy8gKiB1cGRhdGUodHlwZSwgaWQsIG5ld19wcm9wZXJ0aWVzIClcbi8vICogdXBkYXRlQWxsKCB0eXBlLCBuZXdfcHJvcGVydGllcylcbi8vICogcmVtb3ZlKHR5cGUsIGlkKVxuLy8gKiByZW1vdmVBbGwodHlwZSlcbi8vXG4vLyBjdXN0b20gcmVxdWVzdHNcbi8vXG4vLyAqIHJlcXVlc3QodmlldywgcGFyYW1zKVxuLy8gKiBnZXQodmlldywgcGFyYW1zKVxuLy8gKiBwb3N0KHZpZXcsIHBhcmFtcylcbi8vXG4vLyBzeW5jaHJvbml6YXRpb25cbi8vXG4vLyAqIGNvbm5lY3QoKVxuLy8gKiBkaXNjb25uZWN0KClcbi8vICogcHVsbCgpXG4vLyAqIHB1c2goKVxuLy8gKiBzeW5jKClcbi8vXG4vLyBldmVudCBiaW5kaW5nXG4vL1xuLy8gKiBvbihldmVudCwgY2FsbGJhY2spXG4vL1xuXG4vL1xudmFyIHV1aWQgPSByZXF1aXJlKCcuL3V0aWxzL3V1aWQnKTtcbnZhciBjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9jb25uZWN0aW9uJyk7XG52YXIgcHJvbWlzZXMgPSByZXF1aXJlKCcuL3Byb21pc2VzJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xudmFyIHN0b3JlQXBpID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUsIG9wdGlvbnMpIHtcblxuICB2YXIgcmVtb3RlU3RvcmUgPSB7fTtcblxuXG4gIC8vIFJlbW90ZSBTdG9yZSBQZXJzaXN0YW5jZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBmaW5kXG4gIC8vIC0tLS0tLVxuXG4gIC8vIGZpbmQgb25lIG9iamVjdFxuICAvL1xuICByZW1vdGVTdG9yZS5maW5kID0gZnVuY3Rpb24gZmluZCh0eXBlLCBpZCkge1xuICAgIHZhciBwYXRoO1xuXG4gICAgcGF0aCA9IHR5cGUgKyAnLycgKyBpZDtcblxuICAgIGlmIChyZW1vdGUucHJlZml4KSB7XG4gICAgICBwYXRoID0gcmVtb3RlLnByZWZpeCArIHBhdGg7XG4gICAgfVxuXG4gICAgcGF0aCA9ICcvJyArIGVuY29kZVVSSUNvbXBvbmVudChwYXRoKTtcblxuICAgIHJldHVybiByZXF1ZXN0KCdHRVQnLCBwYXRoKS50aGVuKHBhcnNlRnJvbVJlbW90ZSk7XG4gIH07XG5cblxuICAvLyBmaW5kQWxsXG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIGZpbmQgYWxsIG9iamVjdHMsIGNhbiBiZSBmaWxldGVyZWQgYnkgYSB0eXBlXG4gIC8vXG4gIHJlbW90ZVN0b3JlLmZpbmRBbGwgPSBmdW5jdGlvbiBmaW5kQWxsKHR5cGUpIHtcbiAgICB2YXIgZW5ka2V5LCBwYXRoLCBzdGFydGtleTtcblxuICAgIHBhdGggPSAnL19hbGxfZG9jcz9pbmNsdWRlX2RvY3M9dHJ1ZSc7XG5cbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlICh0eXBlICE9PSB1bmRlZmluZWQpICYmIHJlbW90ZS5wcmVmaXggIT09ICcnOlxuICAgICAgc3RhcnRrZXkgPSByZW1vdGUucHJlZml4ICsgdHlwZSArICcvJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdHlwZSAhPT0gdW5kZWZpbmVkOlxuICAgICAgc3RhcnRrZXkgPSB0eXBlICsgJy8nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSByZW1vdGUucHJlZml4ICE9PSAnJzpcbiAgICAgIHN0YXJ0a2V5ID0gcmVtb3RlLnByZWZpeDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBzdGFydGtleSA9ICcnO1xuICAgIH1cblxuICAgIGlmIChzdGFydGtleSkge1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhhdCBvbmx5IG9iamVjdHMgc3RhcnRpbmcgd2l0aFxuICAgICAgLy8gYHN0YXJ0a2V5YCB3aWxsIGJlIHJldHVybmVkXG4gICAgICBlbmRrZXkgPSBzdGFydGtleS5yZXBsYWNlKC8uJC8sIGZ1bmN0aW9uKGNoYXJzKSB7XG4gICAgICAgIHZhciBjaGFyQ29kZTtcbiAgICAgICAgY2hhckNvZGUgPSBjaGFycy5jaGFyQ29kZUF0KDApO1xuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSArIDEpO1xuICAgICAgfSk7XG4gICAgICBwYXRoID0gJycgKyBwYXRoICsgJyZzdGFydGtleT1cIicgKyAoZW5jb2RlVVJJQ29tcG9uZW50KHN0YXJ0a2V5KSkgKyAnXCImZW5ka2V5PVwiJyArIChlbmNvZGVVUklDb21wb25lbnQoZW5ka2V5KSkgKyAnXCInO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1ZXN0KCdHRVQnLCBwYXRoKS50aGVuKG1hcERvY3NGcm9tRmluZEFsbCkudGhlbihwYXJzZUFsbEZyb21SZW1vdGUpO1xuICB9O1xuXG5cbiAgLy8gc2F2ZVxuICAvLyAtLS0tLS1cblxuICAvLyBzYXZlIGEgbmV3IG9iamVjdC4gSWYgaXQgZXhpc3RlZCBiZWZvcmUsIGFsbCBwcm9wZXJ0aWVzXG4gIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgLy9cbiAgcmVtb3RlU3RvcmUuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUob2JqZWN0KSB7XG4gICAgdmFyIHBhdGg7XG5cbiAgICBpZiAoIW9iamVjdC5pZCkge1xuICAgICAgb2JqZWN0LmlkID0gdXVpZCgpO1xuICAgIH1cblxuICAgIG9iamVjdCA9IHBhcnNlRm9yUmVtb3RlKG9iamVjdCk7XG4gICAgcGF0aCA9ICcvJyArIGVuY29kZVVSSUNvbXBvbmVudChvYmplY3QuX2lkKTtcbiAgICByZXR1cm4gcmVxdWVzdCgnUFVUJywgcGF0aCwge1xuICAgICAgZGF0YTogb2JqZWN0XG4gICAgfSk7XG4gIH07XG5cblxuICAvLyByZW1vdmVcbiAgLy8gLS0tLS0tLS0tXG5cbiAgLy8gcmVtb3ZlIG9uZSBvYmplY3RcbiAgLy9cbiAgcmVtb3RlU3RvcmUucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIHJlbW90ZS51cGRhdGUodHlwZSwgaWQsIHtcbiAgICAgIF9kZWxldGVkOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cblxuICAvLyByZW1vdmVBbGxcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmVtb3ZlIGFsbCBvYmplY3RzLCBjYW4gYmUgZmlsdGVyZWQgYnkgdHlwZVxuICAvL1xuICByZW1vdGVTdG9yZS5yZW1vdmVBbGwgPSBmdW5jdGlvbiByZW1vdmVBbGwodHlwZSkge1xuICAgIHJldHVybiByZW1vdGUudXBkYXRlQWxsKHR5cGUsIHtcbiAgICAgIF9kZWxldGVkOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlbW90ZSA9IHN0b3JlQXBpKGhvb2RpZSwge1xuXG4gICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuXG4gICAgYmFja2VuZDoge1xuICAgICAgc2F2ZTogcmVtb3RlU3RvcmUuc2F2ZSxcbiAgICAgIGZpbmQ6IHJlbW90ZVN0b3JlLmZpbmQsXG4gICAgICBmaW5kQWxsOiByZW1vdGVTdG9yZS5maW5kQWxsLFxuICAgICAgcmVtb3ZlOiByZW1vdGVTdG9yZS5yZW1vdmUsXG4gICAgICByZW1vdmVBbGw6IHJlbW90ZVN0b3JlLnJlbW92ZUFsbFxuICAgIH1cblxuICB9KTtcblxuICAvLyBwcm9wZXJ0aWVzXG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIG5hbWVcblxuICAvLyB0aGUgbmFtZSBvZiB0aGUgUmVtb3RlIGlzIHRoZSBuYW1lIG9mIHRoZVxuICAvLyBDb3VjaERCIGRhdGFiYXNlIGFuZCBpcyBhbHNvIHVzZWQgdG8gcHJlZml4XG4gIC8vIHRyaWdnZXJlZCBldmVudHNcbiAgLy9cbiAgdmFyIHJlbW90ZU5hbWUgPSBudWxsO1xuXG5cbiAgLy8gc3luY1xuXG4gIC8vIGlmIHNldCB0byB0cnVlLCB1cGRhdGVzIHdpbGwgYmUgY29udGludW91c2x5IHB1bGxlZFxuICAvLyBhbmQgcHVzaGVkLiBBbHRlcm5hdGl2ZWx5LCBgc3luY2AgY2FuIGJlIHNldCB0b1xuICAvLyBgcHVsbDogdHJ1ZWAgb3IgYHB1c2g6IHRydWVgLlxuICAvL1xuICByZW1vdGUuY29ubmVjdGVkID0gZmFsc2U7XG5cblxuICAvLyBwcmVmaXhcblxuICAvL3ByZWZpeCBmb3IgZG9jcyBpbiBhIENvdWNoREIgZGF0YWJhc2UsIGUuZy4gYWxsIGRvY3NcbiAgLy8gaW4gcHVibGljIHVzZXIgc3RvcmVzIGFyZSBwcmVmaXhlZCBieSAnJHB1YmxpYy8nXG4gIC8vXG4gIHJlbW90ZS5wcmVmaXggPSAnJztcblxuXG5cbiAgLy8gZGVmYXVsdHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGlmIChvcHRpb25zLm5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlbW90ZU5hbWUgPSBvcHRpb25zLm5hbWU7XG4gIH1cblxuICBpZiAob3B0aW9ucy5wcmVmaXggIT09IHVuZGVmaW5lZCkge1xuICAgIHJlbW90ZS5wcmVmaXggPSBvcHRpb25zLnByZWZpeDtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmJhc2VVcmwgIT09IG51bGwpIHtcbiAgICByZW1vdGUuYmFzZVVybCA9IG9wdGlvbnMuYmFzZVVybDtcbiAgfVxuXG5cbiAgLy8gcmVxdWVzdFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyB3cmFwcGVyIGZvciBob29kaWUucmVxdWVzdCwgd2l0aCBzb21lIHN0b3JlIHNwZWNpZmljIGRlZmF1bHRzXG4gIC8vIGFuZCBhIHByZWZpeGVkIHBhdGhcbiAgLy9cbiAgcmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QodHlwZSwgcGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKHJlbW90ZU5hbWUpIHtcbiAgICAgIHBhdGggPSAnLycgKyAoZW5jb2RlVVJJQ29tcG9uZW50KHJlbW90ZU5hbWUpKSArIHBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHJlbW90ZS5iYXNlVXJsKSB7XG4gICAgICBwYXRoID0gJycgKyByZW1vdGUuYmFzZVVybCArIHBhdGg7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5jb250ZW50VHlwZSA9IG9wdGlvbnMuY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG4gICAgaWYgKHR5cGUgPT09ICdQT1NUJyB8fCB0eXBlID09PSAnUFVUJykge1xuICAgICAgb3B0aW9ucy5kYXRhVHlwZSA9IG9wdGlvbnMuZGF0YVR5cGUgfHwgJ2pzb24nO1xuICAgICAgb3B0aW9ucy5wcm9jZXNzRGF0YSA9IG9wdGlvbnMucHJvY2Vzc0RhdGEgfHwgZmFsc2U7XG4gICAgICBvcHRpb25zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdCh0eXBlLCBwYXRoLCBvcHRpb25zKTtcbiAgfTtcblxuXG4gIC8vIGlzS25vd25PYmplY3RcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZGV0ZXJtaW5lIGJldHdlZW4gYSBrbm93biBhbmQgYSBuZXcgb2JqZWN0XG4gIC8vXG4gIHJlbW90ZS5pc0tub3duT2JqZWN0ID0gZnVuY3Rpb24gaXNLbm93bk9iamVjdChvYmplY3QpIHtcbiAgICB2YXIga2V5ID0gJycgKyBvYmplY3QudHlwZSArICcvJyArIG9iamVjdC5pZDtcblxuICAgIGlmIChrbm93bk9iamVjdHNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ga25vd25PYmplY3RzW2tleV07XG4gICAgfVxuICB9O1xuXG5cbiAgLy8gbWFya0FzS25vd25PYmplY3RcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGRldGVybWluZSBiZXR3ZWVuIGEga25vd24gYW5kIGEgbmV3IG9iamVjdFxuICAvL1xuICByZW1vdGUubWFya0FzS25vd25PYmplY3QgPSBmdW5jdGlvbiBtYXJrQXNLbm93bk9iamVjdChvYmplY3QpIHtcbiAgICB2YXIga2V5ID0gJycgKyBvYmplY3QudHlwZSArICcvJyArIG9iamVjdC5pZDtcbiAgICBrbm93bk9iamVjdHNba2V5XSA9IDE7XG4gICAgcmV0dXJuIGtub3duT2JqZWN0c1trZXldO1xuICB9O1xuXG5cbiAgLy8gc3luY2hyb25pemF0aW9uXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQ29ubmVjdFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyBzdGFydCBzeW5jaW5nLiBgcmVtb3RlLmJvb3RzdHJhcCgpYCB3aWxsIGF1dG9tYXRpY2FsbHkgc3RhcnRcbiAgLy8gcHVsbGluZyB3aGVuIGByZW1vdGUuY29ubmVjdGVkYCByZW1haW5zIHRydWUuXG4gIC8vXG4gIHJlbW90ZS5jb25uZWN0ID0gZnVuY3Rpb24gY29ubmVjdChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJlbW90ZU5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICByZW1vdGUuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICByZW1vdGUudHJpZ2dlcignY29ubmVjdCcpOyAvLyBUT0RPOiBzcGVjIHRoYXRcbiAgICByZXR1cm4gcmVtb3RlLmJvb3RzdHJhcCgpO1xuICB9O1xuXG5cbiAgLy8gRGlzY29ubmVjdFxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyBzdG9wIHN5bmNpbmcgY2hhbmdlcyBmcm9tIHJlbW90ZSBzdG9yZVxuICAvL1xuICByZW1vdGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgcmVtb3RlLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHJlbW90ZS50cmlnZ2VyKCdkaXNjb25uZWN0Jyk7IC8vIFRPRE86IHNwZWMgdGhhdFxuXG4gICAgaWYgKHB1bGxSZXF1ZXN0KSB7XG4gICAgICBwdWxsUmVxdWVzdC5hYm9ydCgpO1xuICAgIH1cblxuICAgIGlmIChwdXNoUmVxdWVzdCkge1xuICAgICAgcHVzaFJlcXVlc3QuYWJvcnQoKTtcbiAgICB9XG5cbiAgfTtcblxuXG4gIC8vIGlzQ29ubmVjdGVkXG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvL1xuICByZW1vdGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gcmVtb3RlLmNvbm5lY3RlZDtcbiAgfTtcblxuXG4gIC8vIGdldFNpbmNlTnJcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmV0dXJucyB0aGUgc2VxdWVuY2UgbnVtYmVyIGZyb20gd2ljaCB0byBzdGFydCB0byBmaW5kIGNoYW5nZXMgaW4gcHVsbFxuICAvL1xuICB2YXIgc2luY2UgPSBvcHRpb25zLnNpbmNlIHx8IDA7IC8vIFRPRE86IHNwZWMgdGhhdCFcbiAgcmVtb3RlLmdldFNpbmNlTnIgPSBmdW5jdGlvbiBnZXRTaW5jZU5yKCkge1xuICAgIGlmICh0eXBlb2Ygc2luY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBzaW5jZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBzaW5jZTtcbiAgfTtcblxuXG4gIC8vIGJvb3RzdHJhcFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vIGluaXRhbCBwdWxsIG9mIGRhdGEgb2YgdGhlIHJlbW90ZSBzdG9yZS4gQnkgZGVmYXVsdCwgd2UgcHVsbCBhbGxcbiAgLy8gY2hhbmdlcyBzaW5jZSB0aGUgYmVnaW5uaW5nLCBidXQgdGhpcyBiZWhhdmlvciBtaWdodCBiZSBhZGp1c3RlZCxcbiAgLy8gZS5nIGZvciBhIGZpbHRlcmVkIGJvb3RzdHJhcC5cbiAgLy9cbiAgdmFyIGlzQm9vdHN0cmFwcGluZyA9IGZhbHNlO1xuICByZW1vdGUuYm9vdHN0cmFwID0gZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICAgIGlzQm9vdHN0cmFwcGluZyA9IHRydWU7XG4gICAgcmVtb3RlLnRyaWdnZXIoJ2Jvb3RzdHJhcDpzdGFydCcpO1xuICAgIHJldHVybiByZW1vdGUucHVsbCgpLmRvbmUoIGhhbmRsZUJvb3RzdHJhcFN1Y2Nlc3MgKTtcbiAgfTtcblxuXG4gIC8vIHB1bGwgY2hhbmdlc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGEuay5hLiBtYWtlIGEgR0VUIHJlcXVlc3QgdG8gQ291Y2hEQidzIGBfY2hhbmdlc2AgZmVlZC5cbiAgLy8gV2UgY3VycmVudGx5IG1ha2UgbG9uZyBwb2xsIHJlcXVlc3RzLCB0aGF0IHdlIG1hbnVhbGx5IGFib3J0XG4gIC8vIGFuZCByZXN0YXJ0IGVhY2ggMjUgc2Vjb25kcy5cbiAgLy9cbiAgdmFyIHB1bGxSZXF1ZXN0LCBwdWxsUmVxdWVzdFRpbWVvdXQ7XG4gIHJlbW90ZS5wdWxsID0gZnVuY3Rpb24gcHVsbCgpIHtcbiAgICBwdWxsUmVxdWVzdCA9IHJlcXVlc3QoJ0dFVCcsIHB1bGxVcmwoKSk7XG5cbiAgICBpZiAocmVtb3RlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQocHVsbFJlcXVlc3RUaW1lb3V0KTtcbiAgICAgIHB1bGxSZXF1ZXN0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KHJlc3RhcnRQdWxsUmVxdWVzdCwgMjUwMDApO1xuICAgIH1cblxuICAgIHJldHVybiBwdWxsUmVxdWVzdC5kb25lKGhhbmRsZVB1bGxTdWNjZXNzKS5mYWlsKGhhbmRsZVB1bGxFcnJvcik7XG4gIH07XG5cblxuICAvLyBwdXNoIGNoYW5nZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBQdXNoIG9iamVjdHMgdG8gcmVtb3RlIHN0b3JlIHVzaW5nIHRoZSBgX2J1bGtfZG9jc2AgQVBJLlxuICAvL1xuICB2YXIgcHVzaFJlcXVlc3Q7XG4gIHJlbW90ZS5wdXNoID0gZnVuY3Rpb24gcHVzaChvYmplY3RzKSB7XG4gICAgdmFyIG9iamVjdCwgb2JqZWN0c0ZvclJlbW90ZSwgX2ksIF9sZW47XG5cbiAgICBpZiAoISQuaXNBcnJheShvYmplY3RzKSkge1xuICAgICAgb2JqZWN0cyA9IGRlZmF1bHRPYmplY3RzVG9QdXNoKCk7XG4gICAgfVxuXG4gICAgaWYgKG9iamVjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZVdpdGgoW10pO1xuICAgIH1cblxuICAgIG9iamVjdHNGb3JSZW1vdGUgPSBbXTtcblxuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuXG4gICAgICAvLyBkb24ndCBtZXNzIHdpdGggb3JpZ2luYWwgb2JqZWN0c1xuICAgICAgb2JqZWN0ID0gJC5leHRlbmQodHJ1ZSwge30sIG9iamVjdHNbX2ldKTtcbiAgICAgIGFkZFJldmlzaW9uVG8ob2JqZWN0KTtcbiAgICAgIG9iamVjdCA9IHBhcnNlRm9yUmVtb3RlKG9iamVjdCk7XG4gICAgICBvYmplY3RzRm9yUmVtb3RlLnB1c2gob2JqZWN0KTtcbiAgICB9XG4gICAgcHVzaFJlcXVlc3QgPSByZXF1ZXN0KCdQT1NUJywgJy9fYnVsa19kb2NzJywge1xuICAgICAgZGF0YToge1xuICAgICAgICBkb2NzOiBvYmplY3RzRm9yUmVtb3RlLFxuICAgICAgICBuZXdfZWRpdHM6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwdXNoUmVxdWVzdC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlbW90ZS50cmlnZ2VyKCdwdXNoJywgb2JqZWN0c1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHB1c2hSZXF1ZXN0O1xuICB9O1xuXG4gIC8vIHN5bmMgY2hhbmdlc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHB1c2ggb2JqZWN0cywgdGhlbiBwdWxsIHVwZGF0ZXMuXG4gIC8vXG4gIHJlbW90ZS5zeW5jID0gZnVuY3Rpb24gc3luYyhvYmplY3RzKSB7XG4gICAgcmV0dXJuIHJlbW90ZS5wdXNoKG9iamVjdHMpLnRoZW4ocmVtb3RlLnB1bGwpO1xuICB9O1xuXG4gIC8vXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tXG4gIC8vXG5cbiAgLy8gaW4gb3JkZXIgdG8gZGlmZmVyZW50aWF0ZSB3aGV0aGVyIGFuIG9iamVjdCBmcm9tIHJlbW90ZSBzaG91bGQgdHJpZ2dlciBhICduZXcnXG4gIC8vIG9yIGFuICd1cGRhdGUnIGV2ZW50LCB3ZSBzdG9yZSBhIGhhc2ggb2Yga25vd24gb2JqZWN0c1xuICB2YXIga25vd25PYmplY3RzID0ge307XG5cblxuICAvLyB2YWxpZCBDb3VjaERCIGRvYyBhdHRyaWJ1dGVzIHN0YXJ0aW5nIHdpdGggYW4gdW5kZXJzY29yZVxuICAvL1xuICB2YXIgdmFsaWRTcGVjaWFsQXR0cmlidXRlcyA9IFsnX2lkJywgJ19yZXYnLCAnX2RlbGV0ZWQnLCAnX3JldmlzaW9ucycsICdfYXR0YWNobWVudHMnXTtcblxuXG4gIC8vIGRlZmF1bHQgb2JqZWN0cyB0byBwdXNoXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gd2hlbiBwdXNoZWQgd2l0aG91dCBwYXNzaW5nIGFueSBvYmplY3RzLCB0aGUgb2JqZWN0cyByZXR1cm5lZCBmcm9tXG4gIC8vIHRoaXMgbWV0aG9kIHdpbGwgYmUgcGFzc2VkLiBJdCBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgcGFzc2luZyBhblxuICAvLyBhcnJheSBvZiBvYmplY3RzIG9yIGEgZnVuY3Rpb24gYXMgYG9wdGlvbnMub2JqZWN0c2BcbiAgLy9cbiAgdmFyIGRlZmF1bHRPYmplY3RzVG9QdXNoID0gZnVuY3Rpb24gZGVmYXVsdE9iamVjdHNUb1B1c2goKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9O1xuICBpZiAob3B0aW9ucy5kZWZhdWx0T2JqZWN0c1RvUHVzaCkge1xuICAgIGlmICgkLmlzQXJyYXkob3B0aW9ucy5kZWZhdWx0T2JqZWN0c1RvUHVzaCkpIHtcbiAgICAgIGRlZmF1bHRPYmplY3RzVG9QdXNoID0gZnVuY3Rpb24gZGVmYXVsdE9iamVjdHNUb1B1c2goKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmYXVsdE9iamVjdHNUb1B1c2ggPSBvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gc2V0U2luY2VOclxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyBzZXRzIHRoZSBzZXF1ZW5jZSBudW1iZXIgZnJvbSB3aWNoIHRvIHN0YXJ0IHRvIGZpbmQgY2hhbmdlcyBpbiBwdWxsLlxuICAvLyBJZiByZW1vdGUgc3RvcmUgd2FzIGluaXRpYWxpemVkIHdpdGggc2luY2UgOiBmdW5jdGlvbihucikgeyAuLi4gfSxcbiAgLy8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgc2VxIHBhc3NlZC4gT3RoZXJ3aXNlIHNpbXBseSBzZXQgdGhlIHNlcVxuICAvLyBudW1iZXIgYW5kIHJldHVybiBpdC5cbiAgLy9cbiAgZnVuY3Rpb24gc2V0U2luY2VOcihzZXEpIHtcbiAgICBpZiAodHlwZW9mIHNpbmNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gc2luY2Uoc2VxKTtcbiAgICB9XG5cbiAgICBzaW5jZSA9IHNlcTtcbiAgICByZXR1cm4gc2luY2U7XG4gIH1cblxuXG4gIC8vIFBhcnNlIGZvciByZW1vdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gcGFyc2Ugb2JqZWN0IGZvciByZW1vdGUgc3RvcmFnZS4gQWxsIHByb3BlcnRpZXMgc3RhcnRpbmcgd2l0aCBhblxuICAvLyBgdW5kZXJzY29yZWAgZG8gbm90IGdldCBzeW5jaHJvbml6ZWQgZGVzcGl0ZSB0aGUgc3BlY2lhbCBwcm9wZXJ0aWVzXG4gIC8vIGBfaWRgLCBgX3JldmAgYW5kIGBfZGVsZXRlZGAgKHNlZSBhYm92ZSlcbiAgLy9cbiAgLy8gQWxzbyBgaWRgIGdldHMgcmVwbGFjZWQgd2l0aCBgX2lkYCB3aGljaCBjb25zaXN0cyBvZiB0eXBlICYgaWRcbiAgLy9cbiAgZnVuY3Rpb24gcGFyc2VGb3JSZW1vdGUob2JqZWN0KSB7XG4gICAgdmFyIGF0dHIsIHByb3BlcnRpZXM7XG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCBvYmplY3QpO1xuXG4gICAgZm9yIChhdHRyIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgIGlmICh2YWxpZFNwZWNpYWxBdHRyaWJ1dGVzLmluZGV4T2YoYXR0cikgIT09IC0xKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEvXl8vLnRlc3QoYXR0cikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgcHJvcGVydGllc1thdHRyXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwcmVwYXJlIENvdWNoREIgaWRcbiAgICBwcm9wZXJ0aWVzLl9pZCA9ICcnICsgcHJvcGVydGllcy50eXBlICsgJy8nICsgcHJvcGVydGllcy5pZDtcbiAgICBpZiAocmVtb3RlLnByZWZpeCkge1xuICAgICAgcHJvcGVydGllcy5faWQgPSAnJyArIHJlbW90ZS5wcmVmaXggKyBwcm9wZXJ0aWVzLl9pZDtcbiAgICB9XG4gICAgZGVsZXRlIHByb3BlcnRpZXMuaWQ7XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuXG4gIC8vICMjIyBfcGFyc2VGcm9tUmVtb3RlXG5cbiAgLy8gbm9ybWFsaXplIG9iamVjdHMgY29taW5nIGZyb20gcmVtb3RlXG4gIC8vXG4gIC8vIHJlbmFtZXMgYF9pZGAgYXR0cmlidXRlIHRvIGBpZGAgYW5kIHJlbW92ZXMgdGhlIHR5cGUgZnJvbSB0aGUgaWQsXG4gIC8vIGUuZy4gYHR5cGUvMTIzYCAtPiBgMTIzYFxuICAvL1xuICBmdW5jdGlvbiBwYXJzZUZyb21SZW1vdGUob2JqZWN0KSB7XG4gICAgdmFyIGlkLCBpZ25vcmUsIF9yZWY7XG5cbiAgICAvLyBoYW5kbGUgaWQgYW5kIHR5cGVcbiAgICBpZCA9IG9iamVjdC5faWQgfHwgb2JqZWN0LmlkO1xuICAgIGRlbGV0ZSBvYmplY3QuX2lkO1xuXG4gICAgaWYgKHJlbW90ZS5wcmVmaXgpIHtcbiAgICAgIGlkID0gaWQucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIHJlbW90ZS5wcmVmaXgpLCAnJyk7XG4gICAgfVxuXG4gICAgLy8gdHVybiBkb2MvMTIzIGludG8gdHlwZSA9IGRvYyAmIGlkID0gMTIzXG4gICAgLy8gTk9URTogd2UgZG9uJ3QgdXNlIGEgc2ltcGxlIGlkLnNwbGl0KC9cXC8vKSBoZXJlLFxuICAgIC8vIGFzIGluIHNvbWUgY2FzZXMgSURzIG1pZ2h0IGNvbnRhaW4gJy8nLCB0b29cbiAgICAvL1xuICAgIF9yZWYgPSBpZC5tYXRjaCgvKFteXFwvXSspXFwvKC4qKS8pLFxuICAgIGlnbm9yZSA9IF9yZWZbMF0sXG4gICAgb2JqZWN0LnR5cGUgPSBfcmVmWzFdLFxuICAgIG9iamVjdC5pZCA9IF9yZWZbMl07XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VBbGxGcm9tUmVtb3RlKG9iamVjdHMpIHtcbiAgICB2YXIgb2JqZWN0LCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG9iamVjdHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG9iamVjdCA9IG9iamVjdHNbX2ldO1xuICAgICAgX3Jlc3VsdHMucHVzaChwYXJzZUZyb21SZW1vdGUob2JqZWN0KSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfVxuXG5cbiAgLy8gIyMjIF9hZGRSZXZpc2lvblRvXG5cbiAgLy8gZXh0ZW5kcyBwYXNzZWQgb2JqZWN0IHdpdGggYSBfcmV2IHByb3BlcnR5XG4gIC8vXG4gIGZ1bmN0aW9uIGFkZFJldmlzaW9uVG8oYXR0cmlidXRlcykge1xuICAgIHZhciBjdXJyZW50UmV2SWQsIGN1cnJlbnRSZXZOciwgbmV3UmV2aXNpb25JZCwgX3JlZjtcbiAgICB0cnkge1xuICAgICAgX3JlZiA9IGF0dHJpYnV0ZXMuX3Jldi5zcGxpdCgvLS8pLFxuICAgICAgY3VycmVudFJldk5yID0gX3JlZlswXSxcbiAgICAgIGN1cnJlbnRSZXZJZCA9IF9yZWZbMV07XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgIGN1cnJlbnRSZXZOciA9IHBhcnNlSW50KGN1cnJlbnRSZXZOciwgMTApIHx8IDA7XG4gICAgbmV3UmV2aXNpb25JZCA9IGdlbmVyYXRlTmV3UmV2aXNpb25JZCgpO1xuXG4gICAgLy8gbG9jYWwgY2hhbmdlcyBhcmUgbm90IG1lYW50IHRvIGJlIHJlcGxpY2F0ZWQgb3V0c2lkZSBvZiB0aGVcbiAgICAvLyB1c2VycyBkYXRhYmFzZSwgdGhlcmVmb3JlIHRoZSBgLWxvY2FsYCBzdWZmaXguXG4gICAgaWYgKGF0dHJpYnV0ZXMuXyRsb2NhbCkge1xuICAgICAgbmV3UmV2aXNpb25JZCArPSAnLWxvY2FsJztcbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVzLl9yZXYgPSAnJyArIChjdXJyZW50UmV2TnIgKyAxKSArICctJyArIG5ld1JldmlzaW9uSWQ7XG4gICAgYXR0cmlidXRlcy5fcmV2aXNpb25zID0ge1xuICAgICAgc3RhcnQ6IDEsXG4gICAgICBpZHM6IFtuZXdSZXZpc2lvbklkXVxuICAgIH07XG5cbiAgICBpZiAoY3VycmVudFJldklkKSB7XG4gICAgICBhdHRyaWJ1dGVzLl9yZXZpc2lvbnMuc3RhcnQgKz0gY3VycmVudFJldk5yO1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXMuX3JldmlzaW9ucy5pZHMucHVzaChjdXJyZW50UmV2SWQpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIGdlbmVyYXRlIG5ldyByZXZpc2lvbiBpZFxuXG4gIC8vXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTmV3UmV2aXNpb25JZCgpIHtcbiAgICByZXR1cm4gdXVpZCg5KTtcbiAgfVxuXG5cbiAgLy8gIyMjIG1hcCBkb2NzIGZyb20gZmluZEFsbFxuXG4gIC8vXG4gIGZ1bmN0aW9uIG1hcERvY3NGcm9tRmluZEFsbChyZXNwb25zZSkge1xuICAgIHJldHVybiByZXNwb25zZS5yb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiByb3cuZG9jO1xuICAgIH0pO1xuICB9XG5cblxuICAvLyAjIyMgcHVsbCB1cmxcblxuICAvLyBEZXBlbmRpbmcgb24gd2hldGhlciByZW1vdGUgaXMgY29ubmVjdGVkICg9IHB1bGxpbmcgY2hhbmdlcyBjb250aW51b3VzbHkpXG4gIC8vIHJldHVybiBhIGxvbmdwb2xsIFVSTCBvciBub3QuIElmIGl0IGlzIGEgYmVnaW5uaW5nIGJvb3RzdHJhcCByZXF1ZXN0LCBkb1xuICAvLyBub3QgcmV0dXJuIGEgbG9uZ3BvbGwgVVJMLCBhcyB3ZSB3YW50IGl0IHRvIGZpbmlzaCByaWdodCBhd2F5LCBldmVuIGlmIHRoZXJlXG4gIC8vIGFyZSBubyBjaGFuZ2VzIG9uIHJlbW90ZS5cbiAgLy9cbiAgZnVuY3Rpb24gcHVsbFVybCgpIHtcbiAgICB2YXIgc2luY2U7XG4gICAgc2luY2UgPSByZW1vdGUuZ2V0U2luY2VOcigpO1xuICAgIGlmIChyZW1vdGUuaXNDb25uZWN0ZWQoKSAmJiAhaXNCb290c3RyYXBwaW5nKSB7XG4gICAgICByZXR1cm4gJy9fY2hhbmdlcz9pbmNsdWRlX2RvY3M9dHJ1ZSZzaW5jZT0nICsgc2luY2UgKyAnJmhlYXJ0YmVhdD0xMDAwMCZmZWVkPWxvbmdwb2xsJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcvX2NoYW5nZXM/aW5jbHVkZV9kb2NzPXRydWUmc2luY2U9JyArIHNpbmNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIHJlc3RhcnQgcHVsbCByZXF1ZXN0XG5cbiAgLy8gcmVxdWVzdCBnZXRzIHJlc3RhcnRlZCBhdXRvbWF0aWNjYWxseVxuICAvLyB3aGVuIGFib3J0ZWQgKHNlZSBAX2hhbmRsZVB1bGxFcnJvcilcbiAgZnVuY3Rpb24gcmVzdGFydFB1bGxSZXF1ZXN0KCkge1xuICAgIGlmIChwdWxsUmVxdWVzdCkge1xuICAgICAgcHVsbFJlcXVlc3QuYWJvcnQoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vICMjIyBwdWxsIHN1Y2Nlc3MgaGFuZGxlclxuXG4gIC8vIHJlcXVlc3QgZ2V0cyByZXN0YXJ0ZWQgYXV0b21hdGljY2FsbHlcbiAgLy8gd2hlbiBhYm9ydGVkIChzZWUgQF9oYW5kbGVQdWxsRXJyb3IpXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVB1bGxTdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgc2V0U2luY2VOcihyZXNwb25zZS5sYXN0X3NlcSk7XG4gICAgaGFuZGxlUHVsbFJlc3VsdHMocmVzcG9uc2UucmVzdWx0cyk7XG4gICAgaWYgKHJlbW90ZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICByZXR1cm4gcmVtb3RlLnB1bGwoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vICMjIyBwdWxsIGVycm9yIGhhbmRsZXJcblxuICAvLyB3aGVuIHRoZXJlIGlzIGEgY2hhbmdlLCB0cmlnZ2VyIGV2ZW50LFxuICAvLyB0aGVuIGNoZWNrIGZvciBhbm90aGVyIGNoYW5nZVxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQdWxsRXJyb3IoeGhyLCBlcnJvcikge1xuICAgIGlmICghcmVtb3RlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHhoci5zdGF0dXMpIHtcbiAgICAgIC8vIFNlc3Npb24gaXMgaW52YWxpZC4gVXNlciBpcyBzdGlsbCBsb2dpbiwgYnV0IG5lZWRzIHRvIHJlYXV0aGVudGljYXRlXG4gICAgICAvLyBiZWZvcmUgc3luYyBjYW4gYmUgY29udGludWVkXG4gICAgY2FzZSA0MDE6XG4gICAgICByZW1vdGUudHJpZ2dlcignZXJyb3I6dW5hdXRoZW50aWNhdGVkJywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHJlbW90ZS5kaXNjb25uZWN0KCk7XG5cbiAgICAgLy8gdGhlIDQwNCBjb21lcywgd2hlbiB0aGUgcmVxdWVzdGVkIERCIGhhcyBiZWVuIHJlbW92ZWRcbiAgICAgLy8gb3IgZG9lcyBub3QgZXhpc3QgeWV0LlxuICAgICAvL1xuICAgICAvLyBCVVQ6IGl0IG1pZ2h0IGFsc28gaGFwcGVuIHRoYXQgdGhlIGJhY2tncm91bmQgd29ya2VycyBkaWRcbiAgICAgLy8gICAgICBub3QgY3JlYXRlIGEgcGVuZGluZyBkYXRhYmFzZSB5ZXQuIFRoZXJlZm9yZSxcbiAgICAgLy8gICAgICB3ZSB0cnkgaXQgYWdhaW4gaW4gMyBzZWNvbmRzXG4gICAgIC8vXG4gICAgIC8vIFRPRE86IHJldmlldyAvIHJldGhpbmsgdGhhdC5cbiAgICAgLy9cblxuICAgIGNhc2UgNDA0OlxuICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHJlbW90ZS5wdWxsLCAzMDAwKTtcblxuICAgIGNhc2UgNTAwOlxuICAgICAgLy9cbiAgICAgIC8vIFBsZWFzZSBzZXJ2ZXIsIGRvbid0IGdpdmUgdXMgdGhlc2UuIEF0IGxlYXN0IG5vdCBwZXJzaXN0ZW50bHlcbiAgICAgIC8vXG4gICAgICByZW1vdGUudHJpZ2dlcignZXJyb3I6c2VydmVyJywgZXJyb3IpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQocmVtb3RlLnB1bGwsIDMwMDApO1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb24uY2hlY2tDb25uZWN0aW9uKCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHVzdWFsbHkgYSAwLCB3aGljaCBzdGFuZHMgZm9yIHRpbWVvdXQgb3Igc2VydmVyIG5vdCByZWFjaGFibGUuXG4gICAgICBpZiAoeGhyLnN0YXR1c1RleHQgPT09ICdhYm9ydCcpIHtcbiAgICAgICAgLy8gbWFudWFsIGFib3J0IGFmdGVyIDI1c2VjLiByZXN0YXJ0IHB1bGxpbmcgY2hhbmdlcyBkaXJlY3RseSB3aGVuIGNvbm5lY3RlZFxuICAgICAgICByZXR1cm4gcmVtb3RlLnB1bGwoKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gb29wcy4gVGhpcyBtaWdodCBiZSBjYXVzZWQgYnkgYW4gdW5yZWFjaGFibGUgc2VydmVyLlxuICAgICAgICAvLyBPciB0aGUgc2VydmVyIGNhbmNlbGxlZCBpdCBmb3Igd2hhdCBldmVyIHJlYXNvbiwgZS5nLlxuICAgICAgICAvLyBoZXJva3Uga2lsbHMgdGhlIHJlcXVlc3QgYWZ0ZXIgfjMwcy5cbiAgICAgICAgLy8gd2UnbGwgdHJ5IGFnYWluIGFmdGVyIGEgM3MgdGltZW91dFxuICAgICAgICAvL1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChyZW1vdGUucHVsbCwgMzAwMCk7XG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uLmNoZWNrQ29ubmVjdGlvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIGhhbmRsZSBjaGFuZ2VzIGZyb20gcmVtb3RlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUJvb3RzdHJhcFN1Y2Nlc3MoKSB7XG4gICAgaXNCb290c3RyYXBwaW5nID0gZmFsc2U7XG4gICAgcmVtb3RlLnRyaWdnZXIoJ2Jvb3RzdHJhcDplbmQnKTtcbiAgfVxuXG4gIC8vICMjIyBoYW5kbGUgY2hhbmdlcyBmcm9tIHJlbW90ZVxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQdWxsUmVzdWx0cyhjaGFuZ2VzKSB7XG4gICAgdmFyIGRvYywgZXZlbnQsIG9iamVjdCwgX2ksIF9sZW47XG5cbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGNoYW5nZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGRvYyA9IGNoYW5nZXNbX2ldLmRvYztcblxuICAgICAgaWYgKHJlbW90ZS5wcmVmaXggJiYgZG9jLl9pZC5pbmRleE9mKHJlbW90ZS5wcmVmaXgpICE9PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBvYmplY3QgPSBwYXJzZUZyb21SZW1vdGUoZG9jKTtcblxuICAgICAgaWYgKG9iamVjdC5fZGVsZXRlZCkge1xuICAgICAgICBpZiAoIXJlbW90ZS5pc0tub3duT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBldmVudCA9ICdyZW1vdmUnO1xuICAgICAgICByZW1vdGUuaXNLbm93bk9iamVjdChvYmplY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlbW90ZS5pc0tub3duT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgICBldmVudCA9ICd1cGRhdGUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50ID0gJ2FkZCc7XG4gICAgICAgICAgcmVtb3RlLm1hcmtBc0tub3duT2JqZWN0KG9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVtb3RlLnRyaWdnZXIoZXZlbnQsIG9iamVjdCk7XG4gICAgICByZW1vdGUudHJpZ2dlcihldmVudCArICc6JyArIG9iamVjdC50eXBlLCBvYmplY3QpO1xuICAgICAgcmVtb3RlLnRyaWdnZXIoZXZlbnQgKyAnOicgKyBvYmplY3QudHlwZSArICc6JyArIG9iamVjdC5pZCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2UnLCBldmVudCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2U6JyArIG9iamVjdC50eXBlLCBldmVudCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2U6JyArIG9iamVjdC50eXBlICsgJzonICsgb2JqZWN0LmlkLCBldmVudCwgb2JqZWN0KTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGJvb3RzdHJhcCBrbm93biBvYmplY3RzXG4gIC8vXG4gIGlmIChvcHRpb25zLmtub3duT2JqZWN0cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5rbm93bk9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlbW90ZS5tYXJrQXNLbm93bk9iamVjdCh7XG4gICAgICAgIHR5cGU6IG9wdGlvbnMua25vd25PYmplY3RzW2ldLnR5cGUsXG4gICAgICAgIGlkOiBvcHRpb25zLmtub3duT2JqZWN0c1tpXS5pZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBleHBvc2UgcHVibGljIEFQSVxuICByZXR1cm4gcmVtb3RlO1xufTtcbiIsIi8qIGV4cG9ydGVkIGhvb2RpZVJlcXVlc3QgKi9cblxuLy9cbi8vIGhvb2RpZS5yZXF1ZXN0XG4vLyA9PT09PT09PT09PT09PT09XG5cbi8vXG52YXIgcHJvbWlzZXMgPSByZXF1aXJlKCcuL3Byb21pc2VzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuICB2YXIgJGV4dGVuZCA9ICQuZXh0ZW5kO1xuICB2YXIgJGFqYXggPSAkLmFqYXg7XG5cbiAgLy8gSG9vZGllIGJhY2tlbmQgbGlzdGVudHMgdG8gcmVxdWVzdHMgcHJlZml4ZWQgYnkgL19hcGksXG4gIC8vIHNvIHdlIHByZWZpeCBhbGwgcmVxdWVzdHMgd2l0aCByZWxhdGl2ZSBVUkxzXG4gIHZhciBBUElfUEFUSCA9ICcvX2FwaSc7XG5cbiAgLy8gUmVxdWVzdHNcbiAgLy8gLS0tLS0tLS0tLVxuXG4gIC8vIHNlbmRzIHJlcXVlc3RzIHRvIHRoZSBob29kaWUgYmFja2VuZC5cbiAgLy9cbiAgLy8gICAgIHByb21pc2UgPSBob29kaWUucmVxdWVzdCgnR0VUJywgJy91c2VyX2RhdGFiYXNlL2RvY19pZCcpXG4gIC8vXG4gIGZ1bmN0aW9uIHJlcXVlc3QodHlwZSwgdXJsLCBvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzLCByZXF1ZXN0UHJvbWlzZSwgcGlwZWRQcm9taXNlO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgfTtcblxuICAgIC8vIGlmIGFic29sdXRlIHBhdGggcGFzc2VkLCBzZXQgQ09SUyBoZWFkZXJzXG5cbiAgICAvLyBpZiByZWxhdGl2ZSBwYXRoIHBhc3NlZCwgcHJlZml4IHdpdGggYmFzZVVybFxuICAgIGlmICghL15odHRwLy50ZXN0KHVybCkpIHtcbiAgICAgIHVybCA9ICh0aGlzLmJhc2VVcmwgfHwgJycpICsgQVBJX1BBVEggKyB1cmw7XG4gICAgfVxuXG4gICAgLy8gaWYgdXJsIGlzIGNyb3NzIGRvbWFpbiwgc2V0IENPUlMgaGVhZGVyc1xuICAgIGlmICgvXmh0dHAvLnRlc3QodXJsKSkge1xuICAgICAgZGVmYXVsdHMueGhyRmllbGRzID0ge1xuICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWVcbiAgICAgIH07XG4gICAgICBkZWZhdWx0cy5jcm9zc0RvbWFpbiA9IHRydWU7XG4gICAgfVxuXG4gICAgZGVmYXVsdHMudXJsID0gdXJsO1xuXG5cbiAgICAvLyB3ZSBhcmUgcGlwaW5nIHRoZSByZXN1bHQgb2YgdGhlIHJlcXVlc3QgdG8gcmV0dXJuIGEgbmljZXJcbiAgICAvLyBlcnJvciBpZiB0aGUgcmVxdWVzdCBjYW5ub3QgcmVhY2ggdGhlIHNlcnZlciBhdCBhbGwuXG4gICAgLy8gV2UgY2FuJ3QgcmV0dXJuIHRoZSBwcm9taXNlIG9mIGFqYXggZGlyZWN0bHkgYmVjYXVzZSBvZlxuICAgIC8vIHRoZSBwaXBpbmcsIGFzIGZvciB3aGF0ZXZlciByZWFzb24gdGhlIHJldHVybmVkIHByb21pc2VcbiAgICAvLyBkb2VzIG5vdCBoYXZlIHRoZSBgYWJvcnRgIG1ldGhvZCBhbnkgbW9yZSwgbWF5YmUgb3RoZXJzXG4gICAgLy8gYXMgd2VsbC4gU2VlIGFsc28gaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQxMDRcbiAgICByZXF1ZXN0UHJvbWlzZSA9ICRhamF4KCRleHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgICBwaXBlZFByb21pc2UgPSByZXF1ZXN0UHJvbWlzZS50aGVuKCBudWxsLCBwaXBlUmVxdWVzdEVycm9yKTtcbiAgICBwaXBlZFByb21pc2UuYWJvcnQgPSByZXF1ZXN0UHJvbWlzZS5hYm9ydDtcblxuICAgIHJldHVybiBwaXBlZFByb21pc2U7XG4gIH1cblxuICAvL1xuICAvL1xuICAvL1xuICBmdW5jdGlvbiBwaXBlUmVxdWVzdEVycm9yKHhocikge1xuICAgIHZhciBlcnJvcjtcblxuICAgIHRyeSB7XG4gICAgICBlcnJvciA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlcnJvciA9IHtcbiAgICAgICAgZXJyb3I6IHhoci5yZXNwb25zZVRleHQgfHwgKCdDYW5ub3QgY29ubmVjdCB0byBIb29kaWUgc2VydmVyIGF0ICcgKyAodGhpcy5iYXNlVXJsIHx8ICcvJykpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKGVycm9yKS5wcm9taXNlKCk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHB1YmxpYyBBUElcbiAgLy9cbiAgcmV0dXJuIHJlcXVlc3Q7XG59KCkpO1xuIiwiXG4vLyBzY29wZWQgU3RvcmVcbi8vID09PT09PT09PT09PVxuXG4vLyBzYW1lIGFzIHN0b3JlLCBidXQgd2l0aCB0eXBlIHByZXNldCB0byBhbiBpbml0aWFsbHlcbi8vIHBhc3NlZCB2YWx1ZS5cbi8vXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaG9vZGllLCBvcHRpb25zKSB7XG5cbiAgLy8gbmFtZVxuICB2YXIgc3RvcmVOYW1lO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgaWYgKCF0aGlzLm9wdGlvbnMubmFtZSkge1xuICAgIHN0b3JlTmFtZSA9ICdzdG9yZSc7XG4gIH0gZWxzZSB7XG4gICAgc3RvcmVOYW1lID0gdGhpcy5vcHRpb25zLm5hbWU7XG4gIH1cblxuICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgdmFyIGlkID0gb3B0aW9ucy5pZDtcblxuICB2YXIgYXBpID0ge307XG5cbiAgLy8gc2NvcGVkIGJ5IHR5cGUgb25seVxuICBpZiAoIWlkKSB7XG5cbiAgICAvLyBhZGQgZXZlbnRzXG4gICAgZXZlbnRzKHtcbiAgICAgIGNvbnRleHQ6IGFwaSxcbiAgICAgIG5hbWVzcGFjZTogc3RvcmVOYW1lICsgJzonICsgdHlwZVxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuc2F2ZSh0eXBlLCBpZCwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmFkZCA9IGZ1bmN0aW9uIGFkZChwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmFkZCh0eXBlLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuZmluZCA9IGZ1bmN0aW9uIGZpbmQoaWQpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuZmluZCh0eXBlLCBpZCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmZpbmRPckFkZCA9IGZ1bmN0aW9uIGZpbmRPckFkZChpZCwgcHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5maW5kT3JBZGQodHlwZSwgaWQsIHByb3BlcnRpZXMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5maW5kQWxsID0gZnVuY3Rpb24gZmluZEFsbChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmZpbmRBbGwodHlwZSwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnVwZGF0ZSh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkudXBkYXRlQWxsID0gZnVuY3Rpb24gdXBkYXRlQWxsKG9iamVjdFVwZGF0ZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS51cGRhdGVBbGwodHlwZSwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKGlkLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnJlbW92ZSh0eXBlLCBpZCwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnJlbW92ZUFsbCA9IGZ1bmN0aW9uIHJlbW92ZUFsbChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnJlbW92ZUFsbCh0eXBlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gIH1cblxuICAvLyBzY29wZWQgYnkgYm90aDogdHlwZSAmIGlkXG4gIGlmIChpZCkge1xuXG4gICAgLy8gYWRkIGV2ZW50c1xuICAgIGV2ZW50cyh7XG4gICAgICBjb250ZXh0OiBhcGksXG4gICAgICBuYW1lc3BhY2U6IHN0b3JlTmFtZSArICc6JyArIHR5cGUgKyAnOicgKyBpZFxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUocHJvcGVydGllcywgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5zYXZlKHR5cGUsIGlkLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuZmluZCA9IGZ1bmN0aW9uIGZpbmQoKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmZpbmQodHlwZSwgaWQpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUob2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnVwZGF0ZSh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUucmVtb3ZlKHR5cGUsIGlkLCBvcHRpb25zKTtcbiAgICB9O1xuICB9XG5cbiAgLy9cbiAgYXBpLmRlY29yYXRlUHJvbWlzZXMgPSBob29kaWUuc3RvcmUuZGVjb3JhdGVQcm9taXNlcztcbiAgYXBpLnZhbGlkYXRlID0gaG9vZGllLnN0b3JlLnZhbGlkYXRlO1xuXG4gIHJldHVybiBhcGk7XG5cbn07XG4iLCIvLyBzY29wZWQgU3RvcmVcbi8vID09PT09PT09PT09PVxuXG4vLyBzYW1lIGFzIHN0b3JlLCBidXQgd2l0aCB0eXBlIHByZXNldCB0byBhbiBpbml0aWFsbHlcbi8vIHBhc3NlZCB2YWx1ZS5cblxudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSwgdGFza0FwaSwgb3B0aW9ucykge1xuXG4gIHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuICB2YXIgaWQgPSBvcHRpb25zLmlkO1xuXG4gIHZhciBhcGkgPSB7fTtcblxuICAvLyBzY29wZWQgYnkgdHlwZSBvbmx5XG4gIGlmICghaWQpIHtcblxuICAgIC8vIGFkZCBldmVudHNcbiAgICBldmVudHMoe1xuICAgICAgY29udGV4dDogYXBpLFxuICAgICAgbmFtZXNwYWNlOiAndGFzazonICsgdHlwZVxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuc3RhcnQgPSBmdW5jdGlvbiBzdGFydChwcm9wZXJ0aWVzKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5zdGFydCh0eXBlLCBwcm9wZXJ0aWVzKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuY2FuY2VsID0gZnVuY3Rpb24gY2FuY2VsKGlkKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5jYW5jZWwodHlwZSwgaWQpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5yZXN0YXJ0ID0gZnVuY3Rpb24gcmVzdGFydChpZCwgdXBkYXRlKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5yZXN0YXJ0KHR5cGUsIGlkLCB1cGRhdGUpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5jYW5jZWxBbGwgPSBmdW5jdGlvbiBjYW5jZWxBbGwoKSB7XG4gICAgICByZXR1cm4gdGFza0FwaS5jYW5jZWxBbGwodHlwZSk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnJlc3RhcnRBbGwgPSBmdW5jdGlvbiByZXN0YXJ0QWxsKHVwZGF0ZSkge1xuICAgICAgcmV0dXJuIHRhc2tBcGkucmVzdGFydEFsbCh0eXBlLCB1cGRhdGUpO1xuICAgIH07XG4gIH1cblxuICAvLyBzY29wZWQgYnkgYm90aDogdHlwZSAmIGlkXG4gIGlmIChpZCkge1xuXG4gICAgLy8gYWRkIGV2ZW50c1xuICAgIGV2ZW50cyh7XG4gICAgICBjb250ZXh0OiBhcGksXG4gICAgICBuYW1lc3BhY2U6ICd0YXNrOicgKyB0eXBlICsgJzonICsgaWRcbiAgICB9KTtcblxuICAgIC8vXG4gICAgYXBpLmNhbmNlbCA9IGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgIHJldHVybiB0YXNrQXBpLmNhbmNlbCh0eXBlLCBpZCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnJlc3RhcnQgPSBmdW5jdGlvbiByZXN0YXJ0KHVwZGF0ZSkge1xuICAgICAgcmV0dXJuIHRhc2tBcGkucmVzdGFydCh0eXBlLCBpZCwgdXBkYXRlKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGFwaTtcbn07XG4iLCIvLyBTdG9yZVxuLy8gPT09PT09PT09PT09XG5cbi8vIFRoaXMgY2xhc3MgZGVmaW5lcyB0aGUgQVBJIHRoYXQgaG9vZGllLnN0b3JlIChsb2NhbCBzdG9yZSkgYW5kIGhvb2RpZS5vcGVuXG4vLyAocmVtb3RlIHN0b3JlKSBpbXBsZW1lbnQgdG8gYXNzdXJlIGEgY29oZXJlbnQgQVBJLiBJdCBhbHNvIGltcGxlbWVudHMgc29tZVxuLy8gYmFzaWMgdmFsaWRhdGlvbnMuXG4vL1xuLy8gVGhlIHJldHVybmVkIEFQSSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIG1ldGhvZHM6XG4vL1xuLy8gKiB2YWxpZGF0ZVxuLy8gKiBzYXZlXG4vLyAqIGFkZFxuLy8gKiBmaW5kXG4vLyAqIGZpbmRPckFkZFxuLy8gKiBmaW5kQWxsXG4vLyAqIHVwZGF0ZVxuLy8gKiB1cGRhdGVBbGxcbi8vICogcmVtb3ZlXG4vLyAqIHJlbW92ZUFsbFxuLy8gKiBkZWNvcmF0ZVByb21pc2VzXG4vLyAqIHRyaWdnZXJcbi8vICogb25cbi8vICogdW5iaW5kXG4vL1xuLy8gQXQgdGhlIHNhbWUgdGltZSwgdGhlIHJldHVybmVkIEFQSSBjYW4gYmUgY2FsbGVkIGFzIGZ1bmN0aW9uIHJldHVybmluZyBhXG4vLyBzdG9yZSBzY29wZWQgYnkgdGhlIHBhc3NlZCB0eXBlLCBmb3IgZXhhbXBsZVxuLy9cbi8vICAgICB2YXIgdGFza1N0b3JlID0gaG9vZGllLnN0b3JlKCd0YXNrJyk7XG4vLyAgICAgdGFza1N0b3JlLmZpbmRBbGwoKS50aGVuKCBzaG93QWxsVGFza3MgKTtcbi8vICAgICB0YXNrU3RvcmUudXBkYXRlKCdpZDEyMycsIHtkb25lOiB0cnVlfSk7XG4vL1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgc2NvcGVkU3RvcmUgPSByZXF1aXJlKCcuL3Njb3BlZF9zdG9yZScpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSwgb3B0aW9ucykge1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIHBlcnNpc3RhbmNlIGxvZ2ljXG4gIHZhciBiYWNrZW5kID0ge307XG5cbiAgLy8gZXh0ZW5kIHRoaXMgcHJvcGVydHkgd2l0aCBleHRyYSBmdW5jdGlvbnMgdGhhdCB3aWxsIGJlIGF2YWlsYWJsZVxuICAvLyBvbiBhbGwgcHJvbWlzZXMgcmV0dXJuZWQgYnkgaG9vZGllLnN0b3JlIEFQSS4gSXQgaGFzIGEgcmVmZXJlbmNlXG4gIC8vIHRvIGN1cnJlbnQgaG9vZGllIGluc3RhbmNlIGJ5IGRlZmF1bHRcbiAgdmFyIHByb21pc2VBcGkgPSB7XG4gICAgaG9vZGllOiBob29kaWVcbiAgfTtcblxuICB2YXIgc3RvcmVOYW1lO1xuXG4gIGlmICghdGhpcy5vcHRpb25zLm5hbWUpIHtcbiAgICBzdG9yZU5hbWUgPSAnc3RvcmUnO1xuICB9IGVsc2Uge1xuICAgIHN0b3JlTmFtZSA9IHRoaXMub3B0aW9ucy5uYW1lO1xuICB9XG5cbiAgdmFyIGFwaSA9IHt9O1xuXG4gIHZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG4gIHV0aWwuaW5oZXJpdHMoYXBpLCBmdW5jdGlvbiBhcGkodHlwZSwgaWQpIHtcblxuICAgIHZhciBzY29wZWRPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlkOiBpZFxuICAgIH0sIHNlbGYub3B0aW9ucyk7XG5cbiAgICByZXR1cm4gc2NvcGVkU3RvcmUuY2FsbCh0aGlzLCBob29kaWUsIGFwaSwgc2NvcGVkT3B0aW9ucyk7XG4gIH0pO1xuXG4gIC8vIGFkZCBldmVudCBBUElcbiAgZXZlbnRzKHtcbiAgICBjb250ZXh0OiBhcGksXG4gICAgbmFtZXNwYWNlOiBzdG9yZU5hbWVcbiAgfSk7XG5cblxuICAvLyBWYWxpZGF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGJ5IGRlZmF1bHQsIHdlIG9ubHkgY2hlY2sgZm9yIGEgdmFsaWQgdHlwZSAmIGlkLlxuICAvLyB0aGUgdmFsaWRhdGUgbWV0aG9kIGNhbiBiZSBvdmVyd3JpdGVuIGJ5IHBhc3NpbmdcbiAgLy8gb3B0aW9ucy52YWxpZGF0ZVxuICAvL1xuICAvLyBpZiBgdmFsaWRhdGVgIHJldHVybnMgbm90aGluZywgdGhlIHBhc3NlZCBvYmplY3QgaXNcbiAgLy8gdmFsaWQuIE90aGVyd2lzZSBpdCByZXR1cm5zIGFuIGVycm9yXG4gIC8vXG4gIGFwaS52YWxpZGF0ZSA9IGZ1bmN0aW9uKG9iamVjdCAvKiwgb3B0aW9ucyAqLykge1xuXG4gICAgaWYgKCFvYmplY3QuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW9iamVjdCkge1xuICAgICAgcmV0dXJuIGVycm9ycy5JTlZBTElEX0FSR1VNRU5UUygnbm8gb2JqZWN0IHBhc3NlZCcpO1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFR5cGUob2JqZWN0LnR5cGUpKSB7XG4gICAgICByZXR1cm4gZXJyb3JzLklOVkFMSURfS0VZKHtcbiAgICAgICAgdHlwZTogb2JqZWN0LnR5cGVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZElkKG9iamVjdC5pZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcnMuSU5WQUxJRF9LRVkoe1xuICAgICAgICBpZDogb2JqZWN0LmlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBTYXZlXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gY3JlYXRlcyBvciByZXBsYWNlcyBhbiBhbiBldmVudHVhbGx5IGV4aXN0aW5nIG9iamVjdCBpbiB0aGUgc3RvcmVcbiAgLy8gd2l0aCBzYW1lIHR5cGUgJiBpZC5cbiAgLy9cbiAgLy8gV2hlbiBpZCBpcyB1bmRlZmluZWQsIGl0IGdldHMgZ2VuZXJhdGVkIGFuZCBhIG5ldyBvYmplY3QgZ2V0cyBzYXZlZFxuICAvL1xuICAvLyBleGFtcGxlIHVzYWdlOlxuICAvL1xuICAvLyAgICAgc3RvcmUuc2F2ZSgnY2FyJywgdW5kZWZpbmVkLCB7Y29sb3I6ICdyZWQnfSlcbiAgLy8gICAgIHN0b3JlLnNhdmUoJ2NhcicsICdhYmM0NTY3Jywge2NvbG9yOiAncmVkJ30pXG4gIC8vXG4gIGFwaS5zYXZlID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIC8vIGRvbid0IG1lc3Mgd2l0aCBwYXNzZWQgb2JqZWN0XG4gICAgdmFyIG9iamVjdCA9ICQuZXh0ZW5kKHRydWUsIHt9LCBwcm9wZXJ0aWVzLCB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaWQ6IGlkXG4gICAgfSk7XG5cbiAgICAvLyB2YWxpZGF0aW9uc1xuICAgIHZhciBlcnJvciA9IGFwaS52YWxpZGF0ZShvYmplY3QsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gcmVqZWN0V2l0aChlcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLnNhdmUob2JqZWN0LCBvcHRpb25zIHx8IHt9KSk7XG4gIH07XG5cblxuICAvLyBBZGRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGAuYWRkYCBpcyBhbiBhbGlhcyBmb3IgYC5zYXZlYCwgd2l0aCB0aGUgZGlmZmVyZW5jZSB0aGF0IHRoZXJlIGlzIG5vIGlkIGFyZ3VtZW50LlxuICAvLyBJbnRlcm5hbGx5IGl0IHNpbXBseSBjYWxscyBgLnNhdmUodHlwZSwgdW5kZWZpbmVkLCBvYmplY3QpLlxuICAvL1xuICBhcGkuYWRkID0gZnVuY3Rpb24gKHR5cGUsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcblxuICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGFwaS5zYXZlKHR5cGUsIHByb3BlcnRpZXMuaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICB9O1xuXG5cbiAgLy8gZmluZFxuICAvLyAtLS0tLS1cblxuICAvL1xuICBhcGkuZmluZCA9IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5maW5kKHR5cGUsIGlkKSk7XG4gIH07XG5cblxuICAvLyBmaW5kIG9yIGFkZFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gMS4gVHJ5IHRvIGZpbmQgYSBzaGFyZSBieSBnaXZlbiBpZFxuICAvLyAyLiBJZiBzaGFyZSBjb3VsZCBiZSBmb3VuZCwgcmV0dXJuIGl0XG4gIC8vIDMuIElmIG5vdCwgYWRkIG9uZSBhbmQgcmV0dXJuIGl0LlxuICAvL1xuICBhcGkuZmluZE9yQWRkID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBwcm9wZXJ0aWVzKSB7XG5cbiAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZU5vdEZvdW5kKCkge1xuICAgICAgdmFyIG5ld1Byb3BlcnRpZXMgPSAkLmV4dGVuZCh0cnVlLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSwgcHJvcGVydGllcyk7XG5cbiAgICAgIHJldHVybiBhcGkuYWRkKHR5cGUsIG5ld1Byb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIHByb21pc2UgZGVjb3JhdGlvbnMgZ2V0IGxvc3Qgd2hlbiBwaXBlZCB0aHJvdWdoIGB0aGVuYCxcbiAgICAvLyB0aGF0J3Mgd2h5IHdlIG5lZWQgdG8gZGVjb3JhdGUgdGhlIGZpbmQncyBwcm9taXNlIGFnYWluLlxuICAgIHZhciBwcm9taXNlID0gYXBpLmZpbmQodHlwZSwgaWQpLnRoZW4obnVsbCwgaGFuZGxlTm90Rm91bmQpO1xuXG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShwcm9taXNlKTtcbiAgfTtcblxuXG4gIC8vIGZpbmRBbGxcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmV0dXJucyBhbGwgb2JqZWN0cyBmcm9tIHN0b3JlLlxuICAvLyBDYW4gYmUgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHR5cGUgb3IgYSBmdW5jdGlvblxuICAvL1xuICBhcGkuZmluZEFsbCA9IGZ1bmN0aW9uICh0eXBlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLmZpbmRBbGwodHlwZSwgb3B0aW9ucykpO1xuICB9O1xuXG5cbiAgLy8gVXBkYXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJbiBjb250cmFzdCB0byBgLnNhdmVgLCB0aGUgYC51cGRhdGVgIG1ldGhvZCBkb2VzIG5vdCByZXBsYWNlIHRoZSBzdG9yZWQgb2JqZWN0LFxuICAvLyBidXQgb25seSBjaGFuZ2VzIHRoZSBwYXNzZWQgYXR0cmlidXRlcyBvZiBhbiBleHN0aW5nIG9iamVjdCwgaWYgaXQgZXhpc3RzXG4gIC8vXG4gIC8vIGJvdGggYSBoYXNoIG9mIGtleS92YWx1ZXMgb3IgYSBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgdGhlIHVwZGF0ZSB0byB0aGUgcGFzc2VkXG4gIC8vIG9iamVjdCBjYW4gYmUgcGFzc2VkLlxuICAvL1xuICAvLyBleGFtcGxlIHVzYWdlXG4gIC8vXG4gIC8vIGhvb2RpZS5zdG9yZS51cGRhdGUoJ2NhcicsICdhYmM0NTY3Jywge3NvbGQ6IHRydWV9KVxuICAvLyBob29kaWUuc3RvcmUudXBkYXRlKCdjYXInLCAnYWJjNDU2NycsIGZ1bmN0aW9uKG9iaikgeyBvYmouc29sZCA9IHRydWUgfSlcbiAgLy9cbiAgYXBpLnVwZGF0ZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVGb3VuZChjdXJyZW50T2JqZWN0KSB7XG4gICAgICB2YXIgY2hhbmdlZFByb3BlcnRpZXMsIG5ld09iaiwgdmFsdWU7XG5cbiAgICAgIC8vIG5vcm1hbGl6ZSBpbnB1dFxuICAgICAgbmV3T2JqID0gJC5leHRlbmQodHJ1ZSwge30sIGN1cnJlbnRPYmplY3QpO1xuXG4gICAgICBpZiAodHlwZW9mIG9iamVjdFVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvYmplY3RVcGRhdGUgPSBvYmplY3RVcGRhdGUobmV3T2JqKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFvYmplY3RVcGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVXaXRoKGN1cnJlbnRPYmplY3QpO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBpZiBzb21ldGhpbmcgY2hhbmdlZFxuICAgICAgY2hhbmdlZFByb3BlcnRpZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3RVcGRhdGUpIHtcbiAgICAgICAgICBpZiAob2JqZWN0VXBkYXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gb2JqZWN0VXBkYXRlW2tleV07XG4gICAgICAgICAgICBpZiAoKGN1cnJlbnRPYmplY3Rba2V5XSAhPT0gdmFsdWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHdvcmthcm91bmQgZm9yIHVuZGVmaW5lZCB2YWx1ZXMsIGFzICQuZXh0ZW5kIGlnbm9yZXMgdGhlc2VcbiAgICAgICAgICAgIG5ld09ialtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG5cbiAgICAgIGlmICghKGNoYW5nZWRQcm9wZXJ0aWVzLmxlbmd0aCB8fCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZVdpdGgobmV3T2JqKTtcbiAgICAgIH1cblxuICAgICAgLy9hcHBseSB1cGRhdGVcbiAgICAgIHJldHVybiBhcGkuc2F2ZSh0eXBlLCBpZCwgbmV3T2JqLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBwcm9taXNlIGRlY29yYXRpb25zIGdldCBsb3N0IHdoZW4gcGlwZWQgdGhyb3VnaCBgdGhlbmAsXG4gICAgLy8gdGhhdCdzIHdoeSB3ZSBuZWVkIHRvIGRlY29yYXRlIHRoZSBmaW5kJ3MgcHJvbWlzZSBhZ2Fpbi5cbiAgICB2YXIgcHJvbWlzZSA9IGFwaS5maW5kKHR5cGUsIGlkKS50aGVuKGhhbmRsZUZvdW5kKTtcbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9O1xuXG5cbiAgLy8gdXBkYXRlT3JBZGRcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHNhbWUgYXMgYC51cGRhdGUoKWAsIGJ1dCBpbiBjYXNlIHRoZSBvYmplY3QgY2Fubm90IGJlIGZvdW5kLFxuICAvLyBpdCBnZXRzIGNyZWF0ZWRcbiAgLy9cbiAgYXBpLnVwZGF0ZU9yQWRkID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBoYW5kbGVOb3RGb3VuZCgpIHtcbiAgICAgIHZhciBwcm9wZXJ0aWVzID0gJC5leHRlbmQodHJ1ZSwge30sIG9iamVjdFVwZGF0ZSwge2lkOiBpZH0pO1xuICAgICAgcmV0dXJuIGFwaS5hZGQodHlwZSwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBhcGkudXBkYXRlKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpLnRoZW4obnVsbCwgaGFuZGxlTm90Rm91bmQpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH07XG5cblxuICAvLyB1cGRhdGVBbGxcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyB1cGRhdGUgYWxsIG9iamVjdHMgaW4gdGhlIHN0b3JlLCBjYW4gYmUgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIGZ1bmN0aW9uXG4gIC8vIEFzIGFuIGFsdGVybmF0aXZlLCBhbiBhcnJheSBvZiBvYmplY3RzIGNhbiBiZSBwYXNzZWRcbiAgLy9cbiAgLy8gZXhhbXBsZSB1c2FnZVxuICAvL1xuICAvLyBob29kaWUuc3RvcmUudXBkYXRlQWxsKClcbiAgLy9cbiAgYXBpLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIChmaWx0ZXJPck9iamVjdHMsIG9iamVjdFVwZGF0ZSwgb3B0aW9ucykge1xuICAgIHZhciBwcm9taXNlO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBub3JtYWxpemUgdGhlIGlucHV0OiBtYWtlIHN1cmUgd2UgaGF2ZSBhbGwgb2JqZWN0c1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2UgdHlwZW9mIGZpbHRlck9yT2JqZWN0cyA9PT0gJ3N0cmluZyc6XG4gICAgICBwcm9taXNlID0gYXBpLmZpbmRBbGwoZmlsdGVyT3JPYmplY3RzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgaG9vZGllLmlzUHJvbWlzZShmaWx0ZXJPck9iamVjdHMpOlxuICAgICAgcHJvbWlzZSA9IGZpbHRlck9yT2JqZWN0cztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJC5pc0FycmF5KGZpbHRlck9yT2JqZWN0cyk6XG4gICAgICBwcm9taXNlID0gaG9vZGllLmRlZmVyKCkucmVzb2x2ZShmaWx0ZXJPck9iamVjdHMpLnByb21pc2UoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIGUuZy4gbnVsbCwgdXBkYXRlIGFsbFxuICAgICAgcHJvbWlzZSA9IGFwaS5maW5kQWxsKCk7XG4gICAgfVxuXG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihvYmplY3RzKSB7XG4gICAgICAvLyBub3cgd2UgdXBkYXRlIGFsbCBvYmplY3RzIG9uZSBieSBvbmUgYW5kIHJldHVybiBhIHByb21pc2VcbiAgICAgIC8vIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIGFsbCB1cGRhdGVzIGhhdmUgYmVlbiBmaW5pc2hlZFxuICAgICAgdmFyIG9iamVjdCwgX3VwZGF0ZVByb21pc2VzO1xuXG4gICAgICBpZiAoISQuaXNBcnJheShvYmplY3RzKSkge1xuICAgICAgICBvYmplY3RzID0gW29iamVjdHNdO1xuICAgICAgfVxuXG4gICAgICBfdXBkYXRlUHJvbWlzZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIG9iamVjdCA9IG9iamVjdHNbX2ldO1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goYXBpLnVwZGF0ZShvYmplY3QudHlwZSwgb2JqZWN0LmlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KSgpO1xuXG4gICAgICByZXR1cm4gJC53aGVuLmFwcGx5KG51bGwsIF91cGRhdGVQcm9taXNlcyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9O1xuXG5cbiAgLy8gUmVtb3ZlXG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIFJlbW92ZXMgb25lIG9iamVjdCBzcGVjaWZpZWQgYnkgYHR5cGVgIGFuZCBgaWRgLlxuICAvL1xuICAvLyB3aGVuIG9iamVjdCBoYXMgYmVlbiBzeW5jZWQgYmVmb3JlLCBtYXJrIGl0IGFzIGRlbGV0ZWQuXG4gIC8vIE90aGVyd2lzZSByZW1vdmUgaXQgZnJvbSBTdG9yZS5cbiAgLy9cbiAgYXBpLnJlbW92ZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCwgb3B0aW9ucykge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5yZW1vdmUodHlwZSwgaWQsIG9wdGlvbnMgfHwge30pKTtcbiAgfTtcblxuXG4gIC8vIHJlbW92ZUFsbFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vIERlc3Ryb3llIGFsbCBvYmplY3RzLiBDYW4gYmUgZmlsdGVyZWQgYnkgYSB0eXBlXG4gIC8vXG4gIGFwaS5yZW1vdmVBbGwgPSBmdW5jdGlvbiAodHlwZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5yZW1vdmVBbGwodHlwZSwgb3B0aW9ucyB8fCB7fSkpO1xuICB9O1xuXG5cbiAgLy8gZGVjb3JhdGUgcHJvbWlzZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGV4dGVuZCBwcm9taXNlcyByZXR1cm5lZCBieSBzdG9yZS5hcGlcbiAgYXBpLmRlY29yYXRlUHJvbWlzZXMgPSBmdW5jdGlvbiAobWV0aG9kcykge1xuICAgIHJldHVybiB1dGlscy5pbmhlcml0cyhwcm9taXNlQXBpLCBtZXRob2RzKTtcbiAgfTtcblxuICAvLyByZXF1aXJlZCBiYWNrZW5kIG1ldGhvZHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpZiAoIW9wdGlvbnMuYmFja2VuZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucy5iYWNrZW5kIG11c3QgYmUgcGFzc2VkJyk7XG4gIH1cblxuICB2YXIgcmVxdWlyZWQgPSAnc2F2ZSBmaW5kIGZpbmRBbGwgcmVtb3ZlIHJlbW92ZUFsbCcuc3BsaXQoJyAnKTtcblxuICByZXF1aXJlZC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcblxuICAgIGlmICghb3B0aW9ucy5iYWNrZW5kW21ldGhvZE5hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMuYmFja2VuZC4nICsgbWV0aG9kTmFtZSArICcgbXVzdCBiZSBwYXNzZWQuJyk7XG4gICAgfVxuXG4gICAgYmFja2VuZFttZXRob2ROYW1lXSA9IG9wdGlvbnMuYmFja2VuZFttZXRob2ROYW1lXTtcbiAgfSk7XG5cblxuICAvLyBQcml2YXRlXG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIC8gbm90IGFsbG93ZWQgZm9yIGlkXG4gIGZ1bmN0aW9uIGlzVmFsaWRJZChrZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgvXlteXFwvXSskLykudGVzdChrZXkgfHwgJycpO1xuICB9XG5cbiAgLy8gLyBub3QgYWxsb3dlZCBmb3IgdHlwZVxuICBmdW5jdGlvbiBpc1ZhbGlkVHlwZShrZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgvXlteXFwvXSskLykudGVzdChrZXkgfHwgJycpO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpIHtcbiAgICByZXR1cm4gdXRpbHMuaW5oZXJpdHMocHJvbWlzZSwgcHJvbWlzZUFwaSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlV2l0aCgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IGhvb2RpZS5yZXNvbHZlV2l0aC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3RXaXRoKCkge1xuICAgIHZhciBwcm9taXNlID0gaG9vZGllLnJlamVjdFdpdGguYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9XG5cbiAgcmV0dXJuIGFwaTtcblxufTtcblxuIiwiLy8gVGFza3Ncbi8vID09PT09PT09PT09PVxuXG4vLyBUaGlzIGNsYXNzIGRlZmluZXMgdGhlIGhvb2RpZS50YXNrIEFQSS5cbi8vXG4vLyBUaGUgcmV0dXJuZWQgQVBJIHByb3ZpZGVzIHRoZSBmb2xsb3dpbmcgbWV0aG9kczpcbi8vXG4vLyAqIHN0YXJ0XG4vLyAqIGNhbmNlbFxuLy8gKiByZXN0YXJ0XG4vLyAqIHJlbW92ZVxuLy8gKiBvblxuLy8gKiBvbmVcbi8vICogdW5iaW5kXG4vL1xuLy8gQXQgdGhlIHNhbWUgdGltZSwgdGhlIHJldHVybmVkIEFQSSBjYW4gYmUgY2FsbGVkIGFzIGZ1bmN0aW9uIHJldHVybmluZyBhXG4vLyBzdG9yZSBzY29wZWQgYnkgdGhlIHBhc3NlZCB0eXBlLCBmb3IgZXhhbXBsZVxuLy9cbi8vICAgICB2YXIgZW1haWxUYXNrcyA9IGhvb2RpZS50YXNrKCdlbWFpbCcpO1xuLy8gICAgIGVtYWlsVGFza3Muc3RhcnQoIHByb3BlcnRpZXMgKTtcbi8vICAgICBlbWFpbFRhc2tzLmNhbmNlbCgnaWQxMjMnKTtcbi8vXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcbnZhciBzY29wZWRUYXNrID0gcmVxdWlyZSgnLi9zY29wZWRfdGFzaycpO1xudmFyIGFjY291bnQgPSByZXF1aXJlKCcuL2FjY291bnQnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gcHVibGljIEFQSVxuICB2YXIgYXBpID0gZnVuY3Rpb24gYXBpKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIHNjb3BlZFRhc2soYXBpLCB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaWQ6IGlkXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gYWRkIGV2ZW50cyBBUElcbiAgZXZlbnRzKHtcbiAgICBjb250ZXh0OiBhcGksXG4gICAgbmFtZXNwYWNlOiAndGFzaydcbiAgfSk7XG5cblxuICAvLyBzdGFydFxuICAvLyAtLS0tLS0tXG5cbiAgLy8gc3RhcnQgYSBuZXcgdGFzay4gSWYgdGhlIHVzZXIgaGFzIG5vIGFjY291bnQgeWV0LCBob29kaWUgdHJpZXMgdG8gc2lnbiB1cFxuICAvLyBmb3IgYW4gYW5vbnltb3VzIGFjY291bnQgaW4gdGhlIGJhY2tncm91bmQuIElmIHRoYXQgZmFpbHMsIHRoZSByZXR1cm5lZFxuICAvLyBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQuXG4gIC8vXG4gIGFwaS5zdGFydCA9IGZ1bmN0aW9uKHR5cGUsIHByb3BlcnRpZXMpIHtcbiAgICBpZiAoYWNjb3VudC5oYXNBY2NvdW50KCkpIHtcbiAgICAgIHJldHVybiBzdG9yZS5hZGQoJyQnICsgdHlwZSwgcHJvcGVydGllcykudGhlbihoYW5kbGVOZXdUYXNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjb3VudC5hbm9ueW1vdXNTaWduVXAoKS50aGVuKCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhcGkuc3RhcnQodHlwZSwgcHJvcGVydGllcyk7XG4gICAgfSk7XG4gIH07XG5cblxuICAvLyBjYW5jZWxcbiAgLy8gLS0tLS0tLVxuXG4gIC8vIGNhbmNlbCBhIHJ1bm5pbmcgdGFza1xuICAvL1xuICBhcGkuY2FuY2VsID0gZnVuY3Rpb24odHlwZSwgaWQpIHtcbiAgICByZXR1cm4gc3RvcmUudXBkYXRlKCckJyArIHR5cGUsIGlkLCB7XG4gICAgICBjYW5jZWxsZWRBdDogbm93KClcbiAgICB9KS50aGVuKGhhbmRsZUNhbmNlbGxlZFRhc2spO1xuICB9O1xuXG5cbiAgLy8gcmVzdGFydFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyBmaXJzdCwgd2UgdHJ5IHRvIGNhbmNlbCBhIHJ1bm5pbmcgdGFzay4gSWYgdGhhdCBzdWNjZWVkcywgd2Ugc3RhcnRcbiAgLy8gYSBuZXcgb25lIHdpdGggdGhlIHNhbWUgcHJvcGVydGllcyBhcyB0aGUgb3JpZ2luYWxcbiAgLy9cbiAgYXBpLnJlc3RhcnQgPSBmdW5jdGlvbih0eXBlLCBpZCwgdXBkYXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAkLmV4dGVuZChvYmplY3QsIHVwZGF0ZSk7XG4gICAgICBkZWxldGUgb2JqZWN0LiRlcnJvcjtcbiAgICAgIGRlbGV0ZSBvYmplY3QuJHByb2Nlc3NlZEF0O1xuICAgICAgZGVsZXRlIG9iamVjdC5jYW5jZWxsZWRBdDtcbiAgICAgIHJldHVybiBhcGkuc3RhcnQob2JqZWN0LnR5cGUsIG9iamVjdCk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcGkuY2FuY2VsKHR5cGUsIGlkKS50aGVuKHN0YXJ0KTtcbiAgfTtcblxuICAvLyBjYW5jZWxBbGxcbiAgLy8gLS0tLS0tLS0tLS1cblxuICAvL1xuICBhcGkuY2FuY2VsQWxsID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiBmaW5kQWxsKHR5cGUpLnRoZW4oIGNhbmNlbFRhc2tPYmplY3RzICk7XG4gIH07XG5cbiAgLy8gcmVzdGFydEFsbFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGFwaS5yZXN0YXJ0QWxsID0gZnVuY3Rpb24odHlwZSwgdXBkYXRlKSB7XG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgdXBkYXRlID0gdHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbmRBbGwodHlwZSkudGhlbiggZnVuY3Rpb24odGFza09iamVjdHMpIHtcbiAgICAgIHJlc3RhcnRUYXNrT2JqZWN0cyh0YXNrT2JqZWN0cywgdXBkYXRlKTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIC8vXG4gIC8vIHN1YnNjcmliZSB0byBzdG9yZSBldmVudHNcbiAgLy8gd2Ugc3Vic2NyaWJlIHRvIGFsbCBzdG9yZSBjaGFuZ2VzLCBwaXBlIHRocm91Z2ggdGhlIHRhc2sgb25lcyxcbiAgLy8gbWFraW5nIGEgZmV3IGNoYW5nZXMgYWxvbmcgdGhlIHdheS5cbiAgLy9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlVG9TdG9yZUV2ZW50cygpIHtcblxuICAgIC8vIGFjY291bnQgZXZlbnRzXG4gICAgZXZlbnRzLm9uKCdzdG9yZTpjaGFuZ2UnLCBoYW5kbGVTdG9yZUNoYW5nZSk7XG4gIH1cblxuICAvLyBhbGxvdyB0byBydW4gdGhpcyBvbmx5IG9uY2UgZnJvbSBvdXRzaWRlIChkdXJpbmcgSG9vZGllIGluaXRpYWxpemF0aW9uKVxuICBhcGkuc3Vic2NyaWJlVG9TdG9yZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHN1YnNjcmliZVRvU3RvcmVFdmVudHMoKTtcbiAgICBkZWxldGUgYXBpLnN1YnNjcmliZVRvU3RvcmVFdmVudHM7XG4gIH07XG5cblxuICAvLyBQcml2YXRlXG4gIC8vIC0tLS0tLS1cblxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVOZXdUYXNrKG9iamVjdCkge1xuICAgIHZhciBkZWZlciA9IHByb21pc2VzLmRlZmVyKCk7XG4gICAgdmFyIHRhc2tTdG9yZSA9IHN0b3JlKG9iamVjdC50eXBlLCBvYmplY3QuaWQpO1xuXG4gICAgdGFza1N0b3JlLm9uKCdyZW1vdmUnLCBmdW5jdGlvbihvYmplY3QpIHtcblxuICAgICAgLy8gcmVtb3ZlIFwiJFwiIGZyb20gdHlwZVxuICAgICAgb2JqZWN0LnR5cGUgPSBvYmplY3QudHlwZS5zdWJzdHIoMSk7XG5cbiAgICAgIC8vIHRhc2sgZmluaXNoZWQgYnkgd29ya2VyLlxuICAgICAgaWYgKG9iamVjdC5maW5pc2hlZEF0KSB7XG4gICAgICAgIHJldHVybiBkZWZlci5yZXNvbHZlKG9iamVjdCk7XG4gICAgICB9XG5cbiAgICAgIC8vIG1hbnVhbGx5IHJlbW92ZWQgLyBjYW5jZWxsZWQuXG4gICAgICBkZWZlci5yZWplY3Qob2JqZWN0KTtcbiAgICB9KTtcblxuICAgIHRhc2tTdG9yZS5vbignZXJyb3InLCBmdW5jdGlvbihlcnJvciwgb2JqZWN0KSB7XG5cbiAgICAgIC8vIHJlbW92ZSBcIiRcIiBmcm9tIHR5cGVcbiAgICAgIG9iamVjdC50eXBlID0gb2JqZWN0LnR5cGUuc3Vic3RyKDEpO1xuXG4gICAgICBkZWZlci5yZWplY3QoZXJyb3IsIG9iamVjdCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gaGFuZGxlQ2FuY2VsbGVkVGFzayAodGFzaykge1xuICAgIHZhciBkZWZlcjtcbiAgICB2YXIgdHlwZSA9ICckJyt0YXNrLnR5cGU7XG4gICAgdmFyIGlkID0gdGFzay5pZDtcbiAgICB2YXIgcmVtb3ZlUHJvbWlzZSA9IHN0b3JlLnJlbW92ZSh0eXBlLCBpZCk7XG5cbiAgICBpZiAoIXRhc2suX3Jldikge1xuICAgICAgLy8gdGFzayBoYXMgbm90IHlldCBiZWVuIHN5bmNlZC5cbiAgICAgIHJldHVybiByZW1vdmVQcm9taXNlO1xuICAgIH1cblxuICAgIGRlZmVyID0gcHJvbWlzZXMuZGVmZXIoKTtcbiAgICBldmVudHMub25lKCdzdG9yZTpzeW5jOicgKyB0eXBlICsgJzonICsgaWQsIGRlZmVyLnJlc29sdmUpO1xuICAgIHJlbW92ZVByb21pc2UuZmFpbChkZWZlci5yZWplY3QpO1xuXG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgfVxuXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVN0b3JlQ2hhbmdlKGV2ZW50TmFtZSwgb2JqZWN0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9iamVjdC50eXBlWzBdICE9PSAnJCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvYmplY3QudHlwZSA9IG9iamVjdC50eXBlLnN1YnN0cigxKTtcbiAgICB0cmlnZ2VyRXZlbnRzKGV2ZW50TmFtZSwgb2JqZWN0LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vXG4gIGZ1bmN0aW9uIGZpbmRBbGwgKHR5cGUpIHtcbiAgICB2YXIgc3RhcnRzV2l0aCA9ICckJztcbiAgICB2YXIgZmlsdGVyO1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBzdGFydHNXaXRoICs9IHR5cGU7XG4gICAgfVxuXG4gICAgZmlsdGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICByZXR1cm4gb2JqZWN0LnR5cGUuaW5kZXhPZihzdGFydHNXaXRoKSA9PT0gMDtcbiAgICB9O1xuICAgIHJldHVybiBzdG9yZS5maW5kQWxsKGZpbHRlcik7XG4gIH1cblxuICAvL1xuICBmdW5jdGlvbiBjYW5jZWxUYXNrT2JqZWN0cyAodGFza09iamVjdHMpIHtcbiAgICByZXR1cm4gdGFza09iamVjdHMubWFwKCBmdW5jdGlvbih0YXNrT2JqZWN0KSB7XG4gICAgICByZXR1cm4gYXBpLmNhbmNlbCh0YXNrT2JqZWN0LnR5cGUuc3Vic3RyKDEpLCB0YXNrT2JqZWN0LmlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vXG4gIGZ1bmN0aW9uIHJlc3RhcnRUYXNrT2JqZWN0cyAodGFza09iamVjdHMsIHVwZGF0ZSkge1xuICAgIHJldHVybiB0YXNrT2JqZWN0cy5tYXAoIGZ1bmN0aW9uKHRhc2tPYmplY3QpIHtcbiAgICAgIHJldHVybiBhcGkucmVzdGFydCh0YXNrT2JqZWN0LnR5cGUuc3Vic3RyKDEpLCB0YXNrT2JqZWN0LmlkLCB1cGRhdGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gdGhpcyBpcyB3aGVyZSBhbGwgdGhlIHRhc2sgZXZlbnRzIGdldCB0cmlnZ2VyZWQsXG4gIC8vIGxpa2UgYWRkOm1lc3NhZ2UsIGNoYW5nZTptZXNzYWdlOmFiYzQ1NjcsIHJlbW92ZSwgZXRjLlxuICBmdW5jdGlvbiB0cmlnZ2VyRXZlbnRzKGV2ZW50TmFtZSwgdGFzaywgb3B0aW9ucykge1xuICAgIHZhciBlcnJvcjtcblxuICAgIC8vIFwibmV3XCIgdGFza3MgYXJlIHRyaWdnZXIgYXMgXCJzdGFydFwiIGV2ZW50c1xuICAgIGlmIChldmVudE5hbWUgPT09ICduZXcnKSB7XG4gICAgICBldmVudE5hbWUgPSAnc3RhcnQnO1xuICAgIH1cblxuICAgIGlmIChldmVudE5hbWUgPT09ICdyZW1vdmUnICYmIHRhc2suY2FuY2VsbGVkQXQpIHtcbiAgICAgIGV2ZW50TmFtZSA9ICdjYW5jZWwnO1xuICAgIH1cblxuICAgIGlmIChldmVudE5hbWUgPT09ICdyZW1vdmUnICYmIHRhc2suJHByb2Nlc3NlZEF0KSB7XG4gICAgICBldmVudE5hbWUgPSAnc3VjY2Vzcyc7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3VwZGF0ZScgJiYgdGFzay4kZXJyb3IpIHtcbiAgICAgIGV2ZW50TmFtZSA9ICdlcnJvcic7XG4gICAgICBlcnJvciA9IHRhc2suJGVycm9yO1xuICAgICAgZGVsZXRlIHRhc2suJGVycm9yO1xuXG4gICAgICBhcGkudHJpZ2dlcignZXJyb3InLCBlcnJvciwgdGFzaywgb3B0aW9ucyk7XG4gICAgICBhcGkudHJpZ2dlcignZXJyb3I6JyArIHRhc2sudHlwZSwgZXJyb3IsIHRhc2ssIG9wdGlvbnMpO1xuICAgICAgYXBpLnRyaWdnZXIoJ2Vycm9yOicgKyB0YXNrLnR5cGUgKyAnOicgKyB0YXNrLmlkLCBlcnJvciwgdGFzaywgb3B0aW9ucyk7XG5cbiAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgb3B0aW9ucywge2Vycm9yOiBlcnJvcn0pO1xuICAgICAgYXBpLnRyaWdnZXIoJ2NoYW5nZScsICdlcnJvcicsIHRhc2ssIG9wdGlvbnMpO1xuICAgICAgYXBpLnRyaWdnZXIoJ2NoYW5nZTonICsgdGFzay50eXBlLCAnZXJyb3InLCB0YXNrLCBvcHRpb25zKTtcbiAgICAgIGFwaS50cmlnZ2VyKCdjaGFuZ2U6JyArIHRhc2sudHlwZSArICc6JyArIHRhc2suaWQsICdlcnJvcicsIHRhc2ssIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSBhbGwgdGhlIG90aGVyIGV2ZW50c1xuICAgIGlmIChldmVudE5hbWUgIT09ICdzdGFydCcgJiYgZXZlbnROYW1lICE9PSAnY2FuY2VsJyAmJiBldmVudE5hbWUgIT09ICdzdWNjZXNzJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFwaS50cmlnZ2VyKGV2ZW50TmFtZSwgdGFzaywgb3B0aW9ucyk7XG4gICAgYXBpLnRyaWdnZXIoZXZlbnROYW1lICsgJzonICsgdGFzay50eXBlLCB0YXNrLCBvcHRpb25zKTtcblxuICAgIGlmIChldmVudE5hbWUgIT09ICdzdGFydCcpIHtcbiAgICAgIGFwaS50cmlnZ2VyKGV2ZW50TmFtZSArICc6JyArIHRhc2sudHlwZSArICc6JyArIHRhc2suaWQsIHRhc2ssIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGFwaS50cmlnZ2VyKCdjaGFuZ2UnLCBldmVudE5hbWUsIHRhc2ssIG9wdGlvbnMpO1xuICAgIGFwaS50cmlnZ2VyKCdjaGFuZ2U6JyArIHRhc2sudHlwZSwgZXZlbnROYW1lLCB0YXNrLCBvcHRpb25zKTtcblxuICAgIGlmIChldmVudE5hbWUgIT09ICdzdGFydCcpIHtcbiAgICAgIGFwaS50cmlnZ2VyKCdjaGFuZ2U6JyArIHRhc2sudHlwZSArICc6JyArIHRhc2suaWQsIGV2ZW50TmFtZSwgdGFzaywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9bJ1wiXS9nLCAnJyk7XG4gIH1cblxuICByZXR1cm4gYXBpO1xuXG59O1xuXG4iLCIvKiBleHBvcnRlZCBob29kaWVEaXNwb3NlICovXG5cbi8vIGhvb2RpZS5kaXNwb3NlXG4vLyA9PT09PT09PT09PT09PT09XG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi4vZXZlbnRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIGlmIGEgaG9vZGllIGluc3RhbmNlIGlzIG5vdCBuZWVkZWQgYW55bW9yZSwgaXQgY2FuXG4gIC8vIGJlIGRpc3Bvc2VkIHVzaW5nIHRoaXMgbWV0aG9kLiBBIGBkaXNwb3NlYCBldmVudFxuICAvLyBnZXRzIHRyaWdnZXJlZCB0aGF0IHRoZSBtb2R1bGVzIHJlYWN0IG9uLlxuICBldmVudHMudHJpZ2dlcignZGlzcG9zZScpO1xuICBldmVudHMudW5iaW5kKCk7XG5cbiAgcmV0dXJuO1xufTtcbiIsIi8qIGV4cG9ydGVkIGhvb2RpZVVVSUQgKi9cblxuLy8gaG9vZGllLnV1aWRcbi8vID09PT09PT09PT09PT1cblxuLy8gdXVpZHMgY29uc2lzdCBvZiBudW1iZXJzIGFuZCBsb3dlcmNhc2UgbGV0dGVycyBvbmx5LlxuLy8gV2Ugc3RpY2sgdG8gbG93ZXJjYXNlIGxldHRlcnMgdG8gcHJldmVudCBjb25mdXNpb25cbi8vIGFuZCB0byBwcmV2ZW50IGlzc3VlcyB3aXRoIENvdWNoREIsIGUuZy4gZGF0YWJhc2Vcbi8vIG5hbWVzIGRvIHdvbmx5IGFsbG93IGZvciBsb3dlcmNhc2UgbGV0dGVycy5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonLnNwbGl0KCcnKTtcbiAgdmFyIHJhZGl4ID0gY2hhcnMubGVuZ3RoO1xuICB2YXIgaTtcbiAgdmFyIGlkID0gJyc7XG5cbiAgLy8gZGVmYXVsdCB1dWlkIGxlbmd0aCB0byA3XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDc7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcmFuZCA9IE1hdGgucmFuZG9tKCkgKiByYWRpeDtcbiAgICB2YXIgY2hhciA9IGNoYXJzW01hdGguZmxvb3IocmFuZCldO1xuICAgIGlkICs9IFN0cmluZyhjaGFyKS5jaGFyQXQoMCk7XG4gIH1cblxuICByZXR1cm4gaWQ7XG5cbn07XG4iXX0=
(3)
});
;