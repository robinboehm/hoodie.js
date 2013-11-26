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
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};// Hoodie Core
// -------------
//
// the door to world domination (apps)
//


module.exports = function (baseUrl) {

  var self = this;

  // enforce initialization with `new`
  if (!(this instanceof Hoodie)) {
    throw new Error('usage: new Hoodie(url);');
  }

  if (baseUrl) {
    // remove trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  var events = require('./hoodie/events')(self);
  var promises = require('./hoodie/promises');
  var connection = require('./hoodie/connection');

  //
  // Extending hoodie core
  //

  // * hoodie.bind
  // * hoodie.on
  // * hoodie.one
  // * hoodie.trigger
  // * hoodie.unbind
  // * hoodie.off
  self.bind = events.bind;
  self.on = events.on;
  self.one = events.one;
  self.trigger = events.trigger;
  self.unbind = events.unbind;
  self.off = events.off;


  // * hoodie.defer
  // * hoodie.isPromise
  // * hoodie.resolve
  // * hoodie.reject
  // * hoodie.resolveWith
  // * hoodie.rejectWith
  self.defer = promises.defer;
  self.isPromise = promises.isPromise;
  self.resolve = promises.resolve;
  self.reject = promises.reject;
  self.resolveWith = promises.resolveWith;


  // * hoodie.request
  self.request = require('./hoodie/request');


  // * hoodie.isOnline
  // * hoodie.checkConnection
  self.isOnline = connection.isOnline;
  self.checkConnection = connection.checkConnection;


  // * hoodie.uuid
  self.UUID = require('./hoodie/uuid');


  // * hoodie.dispose
  self.dispose = require('./hoodie/dispose');


  // * hoodie.open
  self.open = require('./hoodie/open')(self);


  // * hoodie.store
  //self.store = require('./hoodie/store')(self);


  // * hoodie.task
  //self.task = require('./hoodie/task');


  // * hoodie.config
  //self.config = require('./hoodie/config');


  // * hoodie.account
  //self.account = require('./hoodie/account');


  // * hoodie.remote
  //self.remote = require('./hoodie/remote_store');


  //
  // Initializations
  //

  //// set username from config (local store)
  //self.account.username = self.config.get('_account.username');

  //// check for pending password reset
  //self.account.checkPasswordReset();

  //// clear config on sign out
  //events.on('account:signout', self.config.clear);

  //// hoodie.store
  //self.store.patchIfNotPersistant();
  //self.store.subscribeToOutsideEvents();
  //self.store.bootstrapDirtyObjects();

  //// hoodie.remote
  //self.remote.subscribeToEvents();

  //// hoodie.task
  //self.task.subscribeToStoreEvents();

  //// authenticate
  //// we use a closure to not pass the username to connect, as it
  //// would set the name of the remote store, which is not the username.
  //self.account.authenticate().then(function( [> username <] ) {
    //self.remote.connect();
  //});

  // check connection when browser goes online / offline
  global.addEventListener('online', self.checkConnection, false);
  global.addEventListener('offline', self.checkConnection, false);


  // start checking connection
  self.checkConnection();

};


},{"./hoodie/connection":4,"./hoodie/dispose":5,"./hoodie/events":7,"./hoodie/open":8,"./hoodie/promises":9,"./hoodie/request":11,"./hoodie/uuid":14}],4:[function(require,module,exports){
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


},{"./events":7,"./promises":9,"./request":11}],5:[function(require,module,exports){
/* exported hoodieDispose */

// hoodie.dispose
// ================
var events = require('./events');

module.exports = function () {

  // if a hoodie instance is not needed anymore, it can
  // be disposed using this method. A `dispose` event
  // gets triggered that the modules react on.
  events.trigger('dispose');
  events.unbind();

  return;
};

},{"./events":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
  if (!hoodie.eventsCallbacks) {
    hoodie.eventsCallbacks = {};
  }

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


},{}],8:[function(require,module,exports){
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


},{"./remote_store":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
var uuid = require('./uuid');
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

},{"./connection":4,"./promises":9,"./request":11,"./store":13,"./uuid":14}],11:[function(require,module,exports){
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

},{"./promises":9}],12:[function(require,module,exports){

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

},{"./events":7}],13:[function(require,module,exports){
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


},{"./errors":6,"./events":7,"./scoped_store":12,"util":2}],14:[function(require,module,exports){
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9fc2hpbXMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi91dGlsLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvY29ubmVjdGlvbi5qcyIsIi9Vc2Vycy9zdmVubGl0by9TaXRlcy9wcml2YXRlL2hvb2RpZS5qcy9zcmMvaG9vZGllL2Rpc3Bvc2UuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9lcnJvcnMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9ldmVudHMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9vcGVuLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvcHJvbWlzZXMuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9yZW1vdGVfc3RvcmUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS9yZXF1ZXN0LmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvc2NvcGVkX3N0b3JlLmpzIiwiL1VzZXJzL3N2ZW5saXRvL1NpdGVzL3ByaXZhdGUvaG9vZGllLmpzL3NyYy9ob29kaWUvc3RvcmUuanMiLCIvVXNlcnMvc3ZlbmxpdG8vU2l0ZXMvcHJpdmF0ZS9ob29kaWUuanMvc3JjL2hvb2RpZS91dWlkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vL1xuLy8gVGhlIHNoaW1zIGluIHRoaXMgZmlsZSBhcmUgbm90IGZ1bGx5IGltcGxlbWVudGVkIHNoaW1zIGZvciB0aGUgRVM1XG4vLyBmZWF0dXJlcywgYnV0IGRvIHdvcmsgZm9yIHRoZSBwYXJ0aWN1bGFyIHVzZWNhc2VzIHRoZXJlIGlzIGluXG4vLyB0aGUgb3RoZXIgbW9kdWxlcy5cbi8vXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBBcnJheS5pc0FycmF5IGlzIHN1cHBvcnRlZCBpbiBJRTlcbmZ1bmN0aW9uIGlzQXJyYXkoeHMpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogaXNBcnJheTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5maWx0ZXIgPSBmdW5jdGlvbiBmaWx0ZXIoeHMsIGZuKSB7XG4gIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZm4pO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZm4oeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKHhzLCBmbiwgc2VsZikge1xuICBpZiAoeHMuZm9yRWFjaCkgcmV0dXJuIHhzLmZvckVhY2goZm4sIHNlbGYpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm4uY2FsbChzZWxmLCB4c1tpXSwgaSwgeHMpO1xuICB9XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUubWFwIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMubWFwID0gZnVuY3Rpb24gbWFwKHhzLCBmbikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGZuKTtcbiAgdmFyIG91dCA9IG5ldyBBcnJheSh4cy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZm4oeHNbaV0sIGksIHhzKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLnJlZHVjZSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLnJlZHVjZSA9IGZ1bmN0aW9uIHJlZHVjZShhcnJheSwgY2FsbGJhY2ssIG9wdF9pbml0aWFsVmFsdWUpIHtcbiAgaWYgKGFycmF5LnJlZHVjZSkgcmV0dXJuIGFycmF5LnJlZHVjZShjYWxsYmFjaywgb3B0X2luaXRpYWxWYWx1ZSk7XG4gIHZhciB2YWx1ZSwgaXNWYWx1ZVNldCA9IGZhbHNlO1xuXG4gIGlmICgyIDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHZhbHVlID0gb3B0X2luaXRpYWxWYWx1ZTtcbiAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgbCA+IGk7ICsraSkge1xuICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgaWYgKGlzVmFsdWVTZXQpIHtcbiAgICAgICAgdmFsdWUgPSBjYWxsYmFjayh2YWx1ZSwgYXJyYXlbaV0sIGksIGFycmF5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFycmF5W2ldO1xuICAgICAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG5pZiAoJ2FiJy5zdWJzdHIoLTEpICE9PSAnYicpIHtcbiAgZXhwb3J0cy5zdWJzdHIgPSBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgLy8gZGlkIHdlIGdldCBhIG5lZ2F0aXZlIHN0YXJ0LCBjYWxjdWxhdGUgaG93IG11Y2ggaXQgaXMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmdcbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcblxuICAgIC8vIGNhbGwgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbmd0aCk7XG4gIH07XG59IGVsc2Uge1xuICBleHBvcnRzLnN1YnN0ciA9IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuZ3RoKTtcbiAgfTtcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS50cmltIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMudHJpbSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59O1xuXG4vLyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGZuID0gYXJncy5zaGlmdCgpO1xuICBpZiAoZm4uYmluZCkgcmV0dXJuIGZuLmJpbmQuYXBwbHkoZm4sIGFyZ3MpO1xuICB2YXIgc2VsZiA9IGFyZ3Muc2hpZnQoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBmbi5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChbQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKV0pKTtcbiAgfTtcbn07XG5cbi8vIE9iamVjdC5jcmVhdGUgaXMgc3VwcG9ydGVkIGluIElFOVxuZnVuY3Rpb24gY3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICB2YXIgb2JqZWN0O1xuICBpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG4gICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgfVxuICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuZXhwb3J0cy5jcmVhdGUgPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5jcmVhdGUgOiBjcmVhdGU7XG5cbi8vIE9iamVjdC5rZXlzIGFuZCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBzdXBwb3J0ZWQgaW4gSUU5IGhvd2V2ZXJcbi8vIHRoZXkgZG8gc2hvdyBhIGRlc2NyaXB0aW9uIGFuZCBudW1iZXIgcHJvcGVydHkgb24gRXJyb3Igb2JqZWN0c1xuZnVuY3Rpb24gbm90T2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKCh0eXBlb2Ygb2JqZWN0ICE9IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iamVjdCAhPSBcImZ1bmN0aW9uXCIpIHx8IG9iamVjdCA9PT0gbnVsbCk7XG59XG5cbmZ1bmN0aW9uIGtleXNTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmtleXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIG5hbWUpKSB7XG4gICAgICByZXN1bHQucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBhbG1vc3QgdGhlIHNhbWUgYXMgT2JqZWN0LmtleXMgb25lIGtleSBmZWF0dXJlXG4vLyAgaXMgdGhhdCBpdCByZXR1cm5zIGhpZGRlbiBwcm9wZXJ0aWVzLCBzaW5jZSB0aGF0IGNhbid0IGJlIGltcGxlbWVudGVkLFxuLy8gIHRoaXMgZmVhdHVyZSBnZXRzIHJlZHVjZWQgc28gaXQganVzdCBzaG93cyB0aGUgbGVuZ3RoIHByb3BlcnR5IG9uIGFycmF5c1xuZnVuY3Rpb24gcHJvcGVydHlTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBrZXlzU2hpbShvYmplY3QpO1xuICBpZiAoZXhwb3J0cy5pc0FycmF5KG9iamVjdCkgJiYgZXhwb3J0cy5pbmRleE9mKG9iamVjdCwgJ2xlbmd0aCcpID09PSAtMSkge1xuICAgIHJlc3VsdC5wdXNoKCdsZW5ndGgnKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIga2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5rZXlzIDoga2V5c1NoaW07XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyA/XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIDogcHJvcGVydHlTaGltO1xuXG5pZiAobmV3IEVycm9yKCkuaGFzT3duUHJvcGVydHkoJ2Rlc2NyaXB0aW9uJykpIHtcbiAgdmFyIEVSUk9SX1BST1BFUlRZX0ZJTFRFUiA9IGZ1bmN0aW9uIChvYmosIGFycmF5KSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRXJyb3JdJykge1xuICAgICAgYXJyYXkgPSBleHBvcnRzLmZpbHRlcihhcnJheSwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUgIT09ICdkZXNjcmlwdGlvbicgJiYgbmFtZSAhPT0gJ251bWJlcicgJiYgbmFtZSAhPT0gJ21lc3NhZ2UnO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEVSUk9SX1BST1BFUlRZX0ZJTFRFUihvYmplY3QsIGtleXMob2JqZWN0KSk7XG4gIH07XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gRVJST1JfUFJPUEVSVFlfRklMVEVSKG9iamVjdCwgZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIGV4cG9ydHMua2V5cyA9IGtleXM7XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGdldE93blByb3BlcnR5TmFtZXM7XG59XG5cbi8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgLSBzdXBwb3J0ZWQgaW4gSUU4IGJ1dCBvbmx5IG9uIGRvbSBlbGVtZW50c1xuZnVuY3Rpb24gdmFsdWVPYmplY3QodmFsdWUsIGtleSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWVba2V5XSB9O1xufVxuXG5pZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgdHJ5IHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHsnYSc6IDF9LCAnYScpO1xuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElFOCBkb20gZWxlbWVudCBpc3N1ZSAtIHVzZSBhIHRyeSBjYXRjaCBhbmQgZGVmYXVsdCB0byB2YWx1ZU9iamVjdFxuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdmFsdWVPYmplY3QodmFsdWUsIGtleSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSBlbHNlIHtcbiAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSB2YWx1ZU9iamVjdDtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgc2hpbXMgPSByZXF1aXJlKCdfc2hpbXMnKTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBzaGltcy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzKTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBzaGltcy5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuXG4gIHNoaW1zLmZvckVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gc2hpbXMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKHNoaW1zLmluZGV4T2YoY3R4LnNlZW4sIGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBzaGltcy5yZWR1Y2Uob3V0cHV0LCBmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gc2hpbXMuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmc7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiYgb2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuYmluYXJ5U2xpY2UgPT09ICdmdW5jdGlvbidcbiAgO1xufVxuZXhwb3J0cy5pc0J1ZmZlciA9IGlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gIGN0b3IucHJvdG90eXBlID0gc2hpbXMuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBzaGltcy5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCJ2YXIgZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsvLyBIb29kaWUgQ29yZVxuLy8gLS0tLS0tLS0tLS0tLVxuLy9cbi8vIHRoZSBkb29yIHRvIHdvcmxkIGRvbWluYXRpb24gKGFwcHMpXG4vL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJhc2VVcmwpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gZW5mb3JjZSBpbml0aWFsaXphdGlvbiB3aXRoIGBuZXdgXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBIb29kaWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2FnZTogbmV3IEhvb2RpZSh1cmwpOycpO1xuICB9XG5cbiAgaWYgKGJhc2VVcmwpIHtcbiAgICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2hlc1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG4gIH1cblxuICB2YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ob29kaWUvZXZlbnRzJykoc2VsZik7XG4gIHZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vaG9vZGllL3Byb21pc2VzJyk7XG4gIHZhciBjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9ob29kaWUvY29ubmVjdGlvbicpO1xuXG4gIC8vXG4gIC8vIEV4dGVuZGluZyBob29kaWUgY29yZVxuICAvL1xuXG4gIC8vICogaG9vZGllLmJpbmRcbiAgLy8gKiBob29kaWUub25cbiAgLy8gKiBob29kaWUub25lXG4gIC8vICogaG9vZGllLnRyaWdnZXJcbiAgLy8gKiBob29kaWUudW5iaW5kXG4gIC8vICogaG9vZGllLm9mZlxuICBzZWxmLmJpbmQgPSBldmVudHMuYmluZDtcbiAgc2VsZi5vbiA9IGV2ZW50cy5vbjtcbiAgc2VsZi5vbmUgPSBldmVudHMub25lO1xuICBzZWxmLnRyaWdnZXIgPSBldmVudHMudHJpZ2dlcjtcbiAgc2VsZi51bmJpbmQgPSBldmVudHMudW5iaW5kO1xuICBzZWxmLm9mZiA9IGV2ZW50cy5vZmY7XG5cblxuICAvLyAqIGhvb2RpZS5kZWZlclxuICAvLyAqIGhvb2RpZS5pc1Byb21pc2VcbiAgLy8gKiBob29kaWUucmVzb2x2ZVxuICAvLyAqIGhvb2RpZS5yZWplY3RcbiAgLy8gKiBob29kaWUucmVzb2x2ZVdpdGhcbiAgLy8gKiBob29kaWUucmVqZWN0V2l0aFxuICBzZWxmLmRlZmVyID0gcHJvbWlzZXMuZGVmZXI7XG4gIHNlbGYuaXNQcm9taXNlID0gcHJvbWlzZXMuaXNQcm9taXNlO1xuICBzZWxmLnJlc29sdmUgPSBwcm9taXNlcy5yZXNvbHZlO1xuICBzZWxmLnJlamVjdCA9IHByb21pc2VzLnJlamVjdDtcbiAgc2VsZi5yZXNvbHZlV2l0aCA9IHByb21pc2VzLnJlc29sdmVXaXRoO1xuXG5cbiAgLy8gKiBob29kaWUucmVxdWVzdFxuICBzZWxmLnJlcXVlc3QgPSByZXF1aXJlKCcuL2hvb2RpZS9yZXF1ZXN0Jyk7XG5cblxuICAvLyAqIGhvb2RpZS5pc09ubGluZVxuICAvLyAqIGhvb2RpZS5jaGVja0Nvbm5lY3Rpb25cbiAgc2VsZi5pc09ubGluZSA9IGNvbm5lY3Rpb24uaXNPbmxpbmU7XG4gIHNlbGYuY2hlY2tDb25uZWN0aW9uID0gY29ubmVjdGlvbi5jaGVja0Nvbm5lY3Rpb247XG5cblxuICAvLyAqIGhvb2RpZS51dWlkXG4gIHNlbGYuVVVJRCA9IHJlcXVpcmUoJy4vaG9vZGllL3V1aWQnKTtcblxuXG4gIC8vICogaG9vZGllLmRpc3Bvc2VcbiAgc2VsZi5kaXNwb3NlID0gcmVxdWlyZSgnLi9ob29kaWUvZGlzcG9zZScpO1xuXG5cbiAgLy8gKiBob29kaWUub3BlblxuICBzZWxmLm9wZW4gPSByZXF1aXJlKCcuL2hvb2RpZS9vcGVuJykoc2VsZik7XG5cblxuICAvLyAqIGhvb2RpZS5zdG9yZVxuICAvL3NlbGYuc3RvcmUgPSByZXF1aXJlKCcuL2hvb2RpZS9zdG9yZScpKHNlbGYpO1xuXG5cbiAgLy8gKiBob29kaWUudGFza1xuICAvL3NlbGYudGFzayA9IHJlcXVpcmUoJy4vaG9vZGllL3Rhc2snKTtcblxuXG4gIC8vICogaG9vZGllLmNvbmZpZ1xuICAvL3NlbGYuY29uZmlnID0gcmVxdWlyZSgnLi9ob29kaWUvY29uZmlnJyk7XG5cblxuICAvLyAqIGhvb2RpZS5hY2NvdW50XG4gIC8vc2VsZi5hY2NvdW50ID0gcmVxdWlyZSgnLi9ob29kaWUvYWNjb3VudCcpO1xuXG5cbiAgLy8gKiBob29kaWUucmVtb3RlXG4gIC8vc2VsZi5yZW1vdGUgPSByZXF1aXJlKCcuL2hvb2RpZS9yZW1vdGVfc3RvcmUnKTtcblxuXG4gIC8vXG4gIC8vIEluaXRpYWxpemF0aW9uc1xuICAvL1xuXG4gIC8vLy8gc2V0IHVzZXJuYW1lIGZyb20gY29uZmlnIChsb2NhbCBzdG9yZSlcbiAgLy9zZWxmLmFjY291bnQudXNlcm5hbWUgPSBzZWxmLmNvbmZpZy5nZXQoJ19hY2NvdW50LnVzZXJuYW1lJyk7XG5cbiAgLy8vLyBjaGVjayBmb3IgcGVuZGluZyBwYXNzd29yZCByZXNldFxuICAvL3NlbGYuYWNjb3VudC5jaGVja1Bhc3N3b3JkUmVzZXQoKTtcblxuICAvLy8vIGNsZWFyIGNvbmZpZyBvbiBzaWduIG91dFxuICAvL2V2ZW50cy5vbignYWNjb3VudDpzaWdub3V0Jywgc2VsZi5jb25maWcuY2xlYXIpO1xuXG4gIC8vLy8gaG9vZGllLnN0b3JlXG4gIC8vc2VsZi5zdG9yZS5wYXRjaElmTm90UGVyc2lzdGFudCgpO1xuICAvL3NlbGYuc3RvcmUuc3Vic2NyaWJlVG9PdXRzaWRlRXZlbnRzKCk7XG4gIC8vc2VsZi5zdG9yZS5ib290c3RyYXBEaXJ0eU9iamVjdHMoKTtcblxuICAvLy8vIGhvb2RpZS5yZW1vdGVcbiAgLy9zZWxmLnJlbW90ZS5zdWJzY3JpYmVUb0V2ZW50cygpO1xuXG4gIC8vLy8gaG9vZGllLnRhc2tcbiAgLy9zZWxmLnRhc2suc3Vic2NyaWJlVG9TdG9yZUV2ZW50cygpO1xuXG4gIC8vLy8gYXV0aGVudGljYXRlXG4gIC8vLy8gd2UgdXNlIGEgY2xvc3VyZSB0byBub3QgcGFzcyB0aGUgdXNlcm5hbWUgdG8gY29ubmVjdCwgYXMgaXRcbiAgLy8vLyB3b3VsZCBzZXQgdGhlIG5hbWUgb2YgdGhlIHJlbW90ZSBzdG9yZSwgd2hpY2ggaXMgbm90IHRoZSB1c2VybmFtZS5cbiAgLy9zZWxmLmFjY291bnQuYXV0aGVudGljYXRlKCkudGhlbihmdW5jdGlvbiggWz4gdXNlcm5hbWUgPF0gKSB7XG4gICAgLy9zZWxmLnJlbW90ZS5jb25uZWN0KCk7XG4gIC8vfSk7XG5cbiAgLy8gY2hlY2sgY29ubmVjdGlvbiB3aGVuIGJyb3dzZXIgZ29lcyBvbmxpbmUgLyBvZmZsaW5lXG4gIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCBzZWxmLmNoZWNrQ29ubmVjdGlvbiwgZmFsc2UpO1xuICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHNlbGYuY2hlY2tDb25uZWN0aW9uLCBmYWxzZSk7XG5cblxuICAvLyBzdGFydCBjaGVja2luZyBjb25uZWN0aW9uXG4gIHNlbGYuY2hlY2tDb25uZWN0aW9uKCk7XG5cbn07XG5cbiIsInZhciBnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qIGV4cG9ydGVkIGhvb2RpZUNvbm5lY3Rpb24gKi9cblxuLy9cbi8vIGhvb2RpZS5jaGVja0Nvbm5lY3Rpb24oKSAmIGhvb2RpZS5pc0Nvbm5lY3RlZCgpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnZhciBwcm9taXNlcyA9IHJlcXVpcmUoJy4vcHJvbWlzZXMnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKTtcblxuLy8gc3RhdGVcbnZhciBvbmxpbmUgPSB0cnVlO1xudmFyIGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDA7XG52YXIgY2hlY2tDb25uZWN0aW9uUmVxdWVzdCA9IG51bGw7XG52YXIgY2hlY2tDb25uZWN0aW9uVGltZW91dCA9IG51bGw7XG5cbi8vIENoZWNrIENvbm5lY3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyB0aGUgYGNoZWNrQ29ubmVjdGlvbmAgbWV0aG9kIGlzIHVzZWQsIHdlbGwsIHRvIGNoZWNrIGlmXG4vLyB0aGUgaG9vZGllIGJhY2tlbmQgaXMgcmVhY2hhYmxlIGF0IGBiYXNlVXJsYCBvciBub3QuXG4vLyBDaGVjayBDb25uZWN0aW9uIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIG9uIHN0YXJ0dXBcbi8vIGFuZCB0aGVuIGVhY2ggMzAgc2Vjb25kcy4gSWYgaXQgZmFpbHMsIGl0XG4vL1xuLy8gLSBzZXRzIGBvbmxpbmUgPSBmYWxzZWBcbi8vIC0gdHJpZ2dlcnMgYG9mZmxpbmVgIGV2ZW50XG4vLyAtIHNldHMgYGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMGBcbi8vXG4vLyB3aGVuIGNvbm5lY3Rpb24gY2FuIGJlIHJlZXN0YWJsaXNoZWQsIGl0XG4vL1xuLy8gLSBzZXRzIGBvbmxpbmUgPSB0cnVlYFxuLy8gLSB0cmlnZ2VycyBgb25saW5lYCBldmVudFxuLy8gLSBzZXRzIGBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbCA9IDMwMDAwYFxuLy9cbnZhciBjaGVja0Nvbm5lY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByZXEgPSBjaGVja0Nvbm5lY3Rpb25SZXF1ZXN0O1xuXG4gIGlmIChyZXEgJiYgcmVxLnN0YXRlKCkgPT09ICdwZW5kaW5nJykge1xuICAgIHJldHVybiByZXE7XG4gIH1cblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0KGNoZWNrQ29ubmVjdGlvblRpbWVvdXQpO1xuXG4gIGNoZWNrQ29ubmVjdGlvblJlcXVlc3QgPSByZXF1ZXN0KCdHRVQnLCAnLycpLnRoZW4oXG4gICAgaGFuZGxlQ2hlY2tDb25uZWN0aW9uU3VjY2VzcyxcbiAgICBoYW5kbGVDaGVja0Nvbm5lY3Rpb25FcnJvclxuICApO1xuXG4gIHJldHVybiBjaGVja0Nvbm5lY3Rpb25SZXF1ZXN0O1xufTtcblxuXG4vLyBpc0Nvbm5lY3RlZFxuLy8gLS0tLS0tLS0tLS0tLVxuXG4vL1xudmFyIGlzQ29ubmVjdGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gb25saW5lO1xufTtcblxuXG4vL1xuLy9cbi8vXG5mdW5jdGlvbiBoYW5kbGVDaGVja0Nvbm5lY3Rpb25TdWNjZXNzKCkge1xuICBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbCA9IDMwMDAwO1xuXG4gIGNoZWNrQ29ubmVjdGlvblRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcbiAgICBleHBvcnRzLmNoZWNrQ29ubmVjdGlvbixcbiAgICBjaGVja0Nvbm5lY3Rpb25JbnRlcnZhbFxuICApO1xuXG4gIGlmICghZXhwb3J0cy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgZXZlbnRzLnRyaWdnZXIoJ3JlY29ubmVjdGVkJyk7XG4gICAgb25saW5lID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlcy5yZXNvbHZlKCk7XG59XG5cblxuLy9cbi8vXG4vL1xuZnVuY3Rpb24gaGFuZGxlQ2hlY2tDb25uZWN0aW9uRXJyb3IoKSB7XG4gIGNoZWNrQ29ubmVjdGlvbkludGVydmFsID0gMzAwMDtcblxuICBjaGVja0Nvbm5lY3Rpb25UaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXG4gICAgZXhwb3J0cy5jaGVja0Nvbm5lY3Rpb24sXG4gICAgY2hlY2tDb25uZWN0aW9uSW50ZXJ2YWxcbiAgKTtcblxuICBpZiAoZXhwb3J0cy5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgZXZlbnRzLnRyaWdnZXIoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgIG9ubGluZSA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2VzLnJlamVjdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2hlY2tDb25uZWN0aW9uOiBjaGVja0Nvbm5lY3Rpb24sXG4gIGlzQ29ubmVjdGVkOiBpc0Nvbm5lY3RlZFxufTtcblxuIiwiLyogZXhwb3J0ZWQgaG9vZGllRGlzcG9zZSAqL1xuXG4vLyBob29kaWUuZGlzcG9zZVxuLy8gPT09PT09PT09PT09PT09PVxudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIGlmIGEgaG9vZGllIGluc3RhbmNlIGlzIG5vdCBuZWVkZWQgYW55bW9yZSwgaXQgY2FuXG4gIC8vIGJlIGRpc3Bvc2VkIHVzaW5nIHRoaXMgbWV0aG9kLiBBIGBkaXNwb3NlYCBldmVudFxuICAvLyBnZXRzIHRyaWdnZXJlZCB0aGF0IHRoZSBtb2R1bGVzIHJlYWN0IG9uLlxuICBldmVudHMudHJpZ2dlcignZGlzcG9zZScpO1xuICBldmVudHMudW5iaW5kKCk7XG5cbiAgcmV0dXJuO1xufTtcbiIsIi8vXG4vLyBvbmUgcGxhY2UgdG8gcnVsZSB0aGVtIGFsbCFcbi8vXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIElOVkFMSURfS0VZXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gdGhyb3duIHdoZW4gaW52YWxpZCBrZXlzIGFyZSB1c2VkIHRvIHN0b3JlIGFuIG9iamVjdFxuICAvL1xuICBJTlZBTElEX0tFWTogZnVuY3Rpb24gKGlkT3JUeXBlKSB7XG4gICAgdmFyIGtleSA9IGlkT3JUeXBlLmlkID8gJ2lkJyA6ICd0eXBlJztcblxuICAgIHJldHVybiBuZXcgRXJyb3IoJ2ludmFsaWQgJyArIGtleSArICdcXCcnICsgaWRPclR5cGVba2V5XSArICdcXCc6IG51bWJlcnMgYW5kIGxvd2VyY2FzZSBsZXR0ZXJzIGFsbG93ZWQgb25seScpO1xuICB9LFxuXG4gIC8vIElOVkFMSURfQVJHVU1FTlRTXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1xuICBJTlZBTElEX0FSR1VNRU5UUzogZnVuY3Rpb24gKG1zZykge1xuICAgIHJldHVybiBuZXcgRXJyb3IobXNnKTtcbiAgfSxcblxuICAvLyBOT1RfRk9VTkRcbiAgLy8gLS0tLS0tLS0tLS1cblxuICAvL1xuICBOT1RfRk9VTkQ6IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoJycgKyB0eXBlICsgJyB3aXRoICcgKyBpZCArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH1cblxufTtcbiIsIi8qIGV4cG9ydGVkIGhvb2RpZUV2ZW50cyAqL1xuXG4vL1xuLy8gRXZlbnRzXG4vLyA9PT09PT09PVxuLy9cbi8vIGV4dGVuZCBhbnkgQ2xhc3Mgd2l0aCBzdXBwb3J0IGZvclxuLy9cbi8vICogYG9iamVjdC5iaW5kKCdldmVudCcsIGNiKWBcbi8vICogYG9iamVjdC51bmJpbmQoJ2V2ZW50JywgY2IpYFxuLy8gKiBgb2JqZWN0LnRyaWdnZXIoJ2V2ZW50JywgYXJncy4uLilgXG4vLyAqIGBvYmplY3Qub25lKCdldicsIGNiKWBcbi8vXG4vLyBiYXNlZCBvbiBbRXZlbnRzIGltcGxlbWVudGF0aW9ucyBmcm9tIFNwaW5lXShodHRwczovL2dpdGh1Yi5jb20vbWFjY21hbi9zcGluZS9ibG9iL21hc3Rlci9zcmMvc3BpbmUuY29mZmVlI0wxKVxuLy9cblxuLy8gY2FsbGJhY2tzIGFyZSBnbG9iYWwsIHdoaWxlIHRoZSBldmVudHMgQVBJIGlzIHVzZWQgYXQgc2V2ZXJhbCBwbGFjZXMsXG4vLyBsaWtlIGhvb2RpZS5vbiAvIGhvb2RpZS5zdG9yZS5vbiAvIGhvb2RpZS50YXNrLm9uIGV0Yy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSwgb3B0aW9ucykge1xuICB2YXIgY29udGV4dCA9IGhvb2RpZTtcbiAgdmFyIG5hbWVzcGFjZSA9ICcnO1xuXG4gIC8vIG5vcm1hbGl6ZSBvcHRpb25zIGhhc2hcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gbWFrZSBzdXJlIGNhbGxiYWNrcyBoYXNoIGV4aXN0c1xuICBpZiAoIWhvb2RpZS5ldmVudHNDYWxsYmFja3MpIHtcbiAgICBob29kaWUuZXZlbnRzQ2FsbGJhY2tzID0ge307XG4gIH1cblxuICBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dDtcbiAgICBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZSArICc6JztcbiAgfVxuXG4gIC8vIEJpbmRcbiAgLy8gLS0tLS0tXG4gIC8vXG4gIC8vIGJpbmQgYSBjYWxsYmFjayB0byBhbiBldmVudCB0cmlnZ2VyZCBieSB0aGUgb2JqZWN0XG4gIC8vXG4gIC8vICAgICBvYmplY3QuYmluZCAnY2hlYXQnLCBibGFtZVxuICAvL1xuICBmdW5jdGlvbiBiaW5kKGV2LCBjYWxsYmFjaykge1xuICAgIHZhciBldnMsIG5hbWUsIF9pLCBfbGVuO1xuXG4gICAgZXZzID0gZXYuc3BsaXQoJyAnKTtcblxuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gZXZzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBuYW1lID0gbmFtZXNwYWNlICsgZXZzW19pXTtcbiAgICAgIGhvb2RpZS5ldmVudHNDYWxsYmFja3NbbmFtZV0gPSBob29kaWUuZXZlbnRzQ2FsbGJhY2tzW25hbWVdIHx8IFtdO1xuICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICAvLyBvbmVcbiAgLy8gLS0tLS1cbiAgLy9cbiAgLy8gc2FtZSBhcyBgYmluZGAsIGJ1dCBkb2VzIGdldCBleGVjdXRlZCBvbmx5IG9uY2VcbiAgLy9cbiAgLy8gICAgIG9iamVjdC5vbmUgJ2dyb3VuZFRvdWNoJywgZ2FtZU92ZXJcbiAgLy9cbiAgZnVuY3Rpb24gb25lKGV2LCBjYWxsYmFjaykge1xuICAgIGV2ID0gbmFtZXNwYWNlICsgZXY7XG4gICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGV4cG9ydHMudW5iaW5kKGV2LCB3cmFwcGVyKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBleHBvcnRzLmJpbmQoZXYsIHdyYXBwZXIpO1xuICB9XG5cbiAgLy8gdHJpZ2dlclxuICAvLyAtLS0tLS0tLS1cbiAgLy9cbiAgLy8gdHJpZ2dlciBhbiBldmVudCBhbmQgcGFzcyBvcHRpb25hbCBwYXJhbWV0ZXJzIGZvciBiaW5kaW5nLlxuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIgJ3dpbicsIHNjb3JlOiAxMjMwXG4gIC8vXG4gIGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgdmFyIGFyZ3MsIGNhbGxiYWNrLCBldiwgbGlzdCwgX2ksIF9sZW47XG5cbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIGV2ID0gYXJncy5zaGlmdCgpO1xuICAgIGV2ID0gbmFtZXNwYWNlICsgZXY7XG4gICAgbGlzdCA9IGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBsaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBjYWxsYmFjayA9IGxpc3RbX2ldO1xuICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyB1bmJpbmRcbiAgLy8gLS0tLS0tLS1cbiAgLy9cbiAgLy8gdW5iaW5kIHRvIGZyb20gYWxsIGJpbmRpbmdzLCBmcm9tIGFsbCBiaW5kaW5ncyBvZiBhIHNwZWNpZmljIGV2ZW50XG4gIC8vIG9yIGZyb20gYSBzcGVjaWZpYyBiaW5kaW5nLlxuICAvL1xuICAvLyAgICAgb2JqZWN0LnVuYmluZCgpXG4gIC8vICAgICBvYmplY3QudW5iaW5kICdtb3ZlJ1xuICAvLyAgICAgb2JqZWN0LnVuYmluZCAnbW92ZScsIGZvbGxvd1xuICAvL1xuICBmdW5jdGlvbiB1bmJpbmQoZXYsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNiLCBpLCBsaXN0LCBfaSwgX2xlbiwgZXZOYW1lcztcblxuICAgIGlmICghZXYpIHtcbiAgICAgIGlmICghbmFtZXNwYWNlKSB7XG4gICAgICAgIGhvb2RpZS5ldmVudHNDYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cblxuICAgICAgZXZOYW1lcyA9IE9iamVjdC5rZXlzKGhvb2RpZS5ldmVudHNDYWxsYmFja3MpO1xuICAgICAgZXZOYW1lcyA9IGV2TmFtZXMuZmlsdGVyKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMDtcbiAgICAgIH0pO1xuICAgICAgZXZOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBkZWxldGUgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1trZXldO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldiA9IG5hbWVzcGFjZSArIGV2O1xuXG4gICAgbGlzdCA9IGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgZGVsZXRlIGhvb2RpZS5ldmVudHNDYWxsYmFja3NbZXZdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IGxpc3QubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgICBjYiA9IGxpc3RbaV07XG5cblxuICAgICAgaWYgKGNiICE9PSBjYWxsYmFjaykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGlzdCA9IGxpc3Quc2xpY2UoKTtcbiAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgaG9vZGllLmV2ZW50c0NhbGxiYWNrc1tldl0gPSBsaXN0O1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiaW5kOiBiaW5kLFxuICAgIG9uOiBiaW5kLFxuICAgIG9uZTogb25lLFxuICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgdW5iaW5kOiB1bmJpbmQsXG4gICAgb2ZmOiB1bmJpbmRcbiAgfTtcblxufTtcblxuIiwiLyogZ2xvYmFsICQ6dHJ1ZSAqL1xuXG4vLyBPcGVuIHN0b3Jlc1xuLy8gLS0tLS0tLS0tLS0tLVxuXG52YXIgcmVtb3RlU3RvcmUgPSByZXF1aXJlKCcuL3JlbW90ZV9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUpIHtcbiAgdmFyICRleHRlbmQgPSAkLmV4dGVuZDtcblxuICAvLyBnZW5lcmljIG1ldGhvZCB0byBvcGVuIGEgc3RvcmUuIFVzZWQgYnlcbiAgLy9cbiAgLy8gKiBob29kaWUucmVtb3RlXG4gIC8vICogaG9vZGllLnVzZXIoXCJqb2VcIilcbiAgLy8gKiBob29kaWUuZ2xvYmFsXG4gIC8vICogLi4uIGFuZCBtb3JlXG4gIC8vXG4gIC8vICAgICBob29kaWUub3BlbihcInNvbWVfc3RvcmVfbmFtZVwiKS5maW5kQWxsKClcbiAgLy9cbiAgZnVuY3Rpb24gb3BlbihzdG9yZU5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICRleHRlbmQob3B0aW9ucywge1xuICAgICAgbmFtZTogc3RvcmVOYW1lXG4gICAgfSk7XG5cblxuICAgIHJldHVybiByZW1vdGVTdG9yZS5jYWxsKHRoaXMsIGhvb2RpZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvL1xuICAvLyBQdWJsaWMgQVBJXG4gIC8vXG4gIHJldHVybiBvcGVuO1xufTtcblxuIiwiLy8gSG9vZGllIERlZmVycyAvIFByb21pc2VzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gcmV0dXJucyBhIGRlZmVyIG9iamVjdCBmb3IgY3VzdG9tIHByb21pc2UgaGFuZGxpbmdzLlxuLy8gUHJvbWlzZXMgYXJlIGhlYXZlbHkgdXNlZCB0aHJvdWdob3V0IHRoZSBjb2RlIG9mIGhvb2RpZS5cbi8vIFdlIGN1cnJlbnRseSBib3Jyb3cgalF1ZXJ5J3MgaW1wbGVtZW50YXRpb246XG4vLyBodHRwOi8vYXBpLmpxdWVyeS5jb20vY2F0ZWdvcnkvZGVmZXJyZWQtb2JqZWN0L1xuLy9cbi8vICAgICBkZWZlciA9IGhvb2RpZS5kZWZlcigpXG4vLyAgICAgaWYgKGdvb2QpIHtcbi8vICAgICAgIGRlZmVyLnJlc29sdmUoJ2dvb2QuJylcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgZGVmZXIucmVqZWN0KCdub3QgZ29vZC4nKVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpXG4vL1xudmFyIGRmZCA9ICQuRGVmZXJyZWQoKTtcblxuLy8gcmV0dXJucyB0cnVlIGlmIHBhc3NlZCBvYmplY3QgaXMgYSBwcm9taXNlIChidXQgbm90IGEgZGVmZXJyZWQpLFxuLy8gb3RoZXJ3aXNlIGZhbHNlLlxuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICB2YXIgaGFzRG9uZSA9IHR5cGVvZiBvYmplY3QuZG9uZSA9PT0gJ2Z1bmN0aW9uJztcbiAgdmFyIGhhc1Jlc29sdmVkID0gdHlwZW9mIG9iamVjdC5yZXNvbHZlICE9PSAnZnVuY3Rpb24nO1xuXG4gIHJldHVybiAhIShvYmplY3QgJiYgaGFzRG9uZSAmJiBoYXNSZXNvbHZlZCk7XG59XG5cbi8vXG5mdW5jdGlvbiByZXNvbHZlKCkge1xuICByZXR1cm4gZGZkLnJlc29sdmUoKS5wcm9taXNlKCk7XG59XG5cblxuLy9cbmZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgcmV0dXJuIGRmZC5yZWplY3QoKS5wcm9taXNlKCk7XG59XG5cblxuLy9cbmZ1bmN0aW9uIHJlc29sdmVXaXRoKCkge1xuICByZXR1cm4gZGZkLnJlc29sdmUuYXBwbHkoZGZkLCBhcmd1bWVudHMpLnByb21pc2UoKTtcbn1cblxuLy9cbmZ1bmN0aW9uIHJlamVjdFdpdGgoKSB7XG4gIHJldHVybiBkZmQucmVqZWN0LmFwcGx5KGRmZCwgYXJndW1lbnRzKS5wcm9taXNlKCk7XG59XG5cbi8vXG4vLyBQdWJsaWMgQVBJXG4vL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlZmVyOiBkZmQsXG4gIGlzUHJvbWlzZTogaXNQcm9taXNlLFxuICByZXNvbHZlOiByZXNvbHZlLFxuICByZWplY3Q6IHJlamVjdCxcbiAgcmVzb2x2ZVdpdGg6IHJlc29sdmVXaXRoLFxuICByZWplY3RXaXRoOiByZWplY3RXaXRoXG59O1xuIiwiLy8gUmVtb3RlXG4vLyA9PT09PT09PVxuXG4vLyBDb25uZWN0aW9uIHRvIGEgcmVtb3RlIENvdWNoIERhdGFiYXNlLlxuLy9cbi8vIHN0b3JlIEFQSVxuLy8gLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIG9iamVjdCBsb2FkaW5nIC8gdXBkYXRpbmcgLyBkZWxldGluZ1xuLy9cbi8vICogZmluZCh0eXBlLCBpZClcbi8vICogZmluZEFsbCh0eXBlIClcbi8vICogYWRkKHR5cGUsIG9iamVjdClcbi8vICogc2F2ZSh0eXBlLCBpZCwgb2JqZWN0KVxuLy8gKiB1cGRhdGUodHlwZSwgaWQsIG5ld19wcm9wZXJ0aWVzIClcbi8vICogdXBkYXRlQWxsKCB0eXBlLCBuZXdfcHJvcGVydGllcylcbi8vICogcmVtb3ZlKHR5cGUsIGlkKVxuLy8gKiByZW1vdmVBbGwodHlwZSlcbi8vXG4vLyBjdXN0b20gcmVxdWVzdHNcbi8vXG4vLyAqIHJlcXVlc3QodmlldywgcGFyYW1zKVxuLy8gKiBnZXQodmlldywgcGFyYW1zKVxuLy8gKiBwb3N0KHZpZXcsIHBhcmFtcylcbi8vXG4vLyBzeW5jaHJvbml6YXRpb25cbi8vXG4vLyAqIGNvbm5lY3QoKVxuLy8gKiBkaXNjb25uZWN0KClcbi8vICogcHVsbCgpXG4vLyAqIHB1c2goKVxuLy8gKiBzeW5jKClcbi8vXG4vLyBldmVudCBiaW5kaW5nXG4vL1xuLy8gKiBvbihldmVudCwgY2FsbGJhY2spXG4vL1xuXG4vL1xudmFyIHV1aWQgPSByZXF1aXJlKCcuL3V1aWQnKTtcbnZhciBjb25uZWN0aW9uID0gcmVxdWlyZSgnLi9jb25uZWN0aW9uJyk7XG52YXIgcHJvbWlzZXMgPSByZXF1aXJlKCcuL3Byb21pc2VzJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xudmFyIHN0b3JlQXBpID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChob29kaWUsIG9wdGlvbnMpIHtcblxuICB2YXIgcmVtb3RlU3RvcmUgPSB7fTtcblxuXG4gIC8vIFJlbW90ZSBTdG9yZSBQZXJzaXN0YW5jZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBmaW5kXG4gIC8vIC0tLS0tLVxuXG4gIC8vIGZpbmQgb25lIG9iamVjdFxuICAvL1xuICByZW1vdGVTdG9yZS5maW5kID0gZnVuY3Rpb24gZmluZCh0eXBlLCBpZCkge1xuICAgIHZhciBwYXRoO1xuXG4gICAgcGF0aCA9IHR5cGUgKyAnLycgKyBpZDtcblxuICAgIGlmIChyZW1vdGUucHJlZml4KSB7XG4gICAgICBwYXRoID0gcmVtb3RlLnByZWZpeCArIHBhdGg7XG4gICAgfVxuXG4gICAgcGF0aCA9ICcvJyArIGVuY29kZVVSSUNvbXBvbmVudChwYXRoKTtcblxuICAgIHJldHVybiByZXF1ZXN0KCdHRVQnLCBwYXRoKS50aGVuKHBhcnNlRnJvbVJlbW90ZSk7XG4gIH07XG5cblxuICAvLyBmaW5kQWxsXG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIGZpbmQgYWxsIG9iamVjdHMsIGNhbiBiZSBmaWxldGVyZWQgYnkgYSB0eXBlXG4gIC8vXG4gIHJlbW90ZVN0b3JlLmZpbmRBbGwgPSBmdW5jdGlvbiBmaW5kQWxsKHR5cGUpIHtcbiAgICB2YXIgZW5ka2V5LCBwYXRoLCBzdGFydGtleTtcblxuICAgIHBhdGggPSAnL19hbGxfZG9jcz9pbmNsdWRlX2RvY3M9dHJ1ZSc7XG5cbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlICh0eXBlICE9PSB1bmRlZmluZWQpICYmIHJlbW90ZS5wcmVmaXggIT09ICcnOlxuICAgICAgc3RhcnRrZXkgPSByZW1vdGUucHJlZml4ICsgdHlwZSArICcvJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdHlwZSAhPT0gdW5kZWZpbmVkOlxuICAgICAgc3RhcnRrZXkgPSB0eXBlICsgJy8nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSByZW1vdGUucHJlZml4ICE9PSAnJzpcbiAgICAgIHN0YXJ0a2V5ID0gcmVtb3RlLnByZWZpeDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBzdGFydGtleSA9ICcnO1xuICAgIH1cblxuICAgIGlmIChzdGFydGtleSkge1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhhdCBvbmx5IG9iamVjdHMgc3RhcnRpbmcgd2l0aFxuICAgICAgLy8gYHN0YXJ0a2V5YCB3aWxsIGJlIHJldHVybmVkXG4gICAgICBlbmRrZXkgPSBzdGFydGtleS5yZXBsYWNlKC8uJC8sIGZ1bmN0aW9uKGNoYXJzKSB7XG4gICAgICAgIHZhciBjaGFyQ29kZTtcbiAgICAgICAgY2hhckNvZGUgPSBjaGFycy5jaGFyQ29kZUF0KDApO1xuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSArIDEpO1xuICAgICAgfSk7XG4gICAgICBwYXRoID0gJycgKyBwYXRoICsgJyZzdGFydGtleT1cIicgKyAoZW5jb2RlVVJJQ29tcG9uZW50KHN0YXJ0a2V5KSkgKyAnXCImZW5ka2V5PVwiJyArIChlbmNvZGVVUklDb21wb25lbnQoZW5ka2V5KSkgKyAnXCInO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1ZXN0KCdHRVQnLCBwYXRoKS50aGVuKG1hcERvY3NGcm9tRmluZEFsbCkudGhlbihwYXJzZUFsbEZyb21SZW1vdGUpO1xuICB9O1xuXG5cbiAgLy8gc2F2ZVxuICAvLyAtLS0tLS1cblxuICAvLyBzYXZlIGEgbmV3IG9iamVjdC4gSWYgaXQgZXhpc3RlZCBiZWZvcmUsIGFsbCBwcm9wZXJ0aWVzXG4gIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgLy9cbiAgcmVtb3RlU3RvcmUuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUob2JqZWN0KSB7XG4gICAgdmFyIHBhdGg7XG5cbiAgICBpZiAoIW9iamVjdC5pZCkge1xuICAgICAgb2JqZWN0LmlkID0gdXVpZCgpO1xuICAgIH1cblxuICAgIG9iamVjdCA9IHBhcnNlRm9yUmVtb3RlKG9iamVjdCk7XG4gICAgcGF0aCA9ICcvJyArIGVuY29kZVVSSUNvbXBvbmVudChvYmplY3QuX2lkKTtcbiAgICByZXR1cm4gcmVxdWVzdCgnUFVUJywgcGF0aCwge1xuICAgICAgZGF0YTogb2JqZWN0XG4gICAgfSk7XG4gIH07XG5cblxuICAvLyByZW1vdmVcbiAgLy8gLS0tLS0tLS0tXG5cbiAgLy8gcmVtb3ZlIG9uZSBvYmplY3RcbiAgLy9cbiAgcmVtb3RlU3RvcmUucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKHR5cGUsIGlkKSB7XG4gICAgcmV0dXJuIHJlbW90ZS51cGRhdGUodHlwZSwgaWQsIHtcbiAgICAgIF9kZWxldGVkOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cblxuICAvLyByZW1vdmVBbGxcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmVtb3ZlIGFsbCBvYmplY3RzLCBjYW4gYmUgZmlsdGVyZWQgYnkgdHlwZVxuICAvL1xuICByZW1vdGVTdG9yZS5yZW1vdmVBbGwgPSBmdW5jdGlvbiByZW1vdmVBbGwodHlwZSkge1xuICAgIHJldHVybiByZW1vdGUudXBkYXRlQWxsKHR5cGUsIHtcbiAgICAgIF9kZWxldGVkOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlbW90ZSA9IHN0b3JlQXBpKGhvb2RpZSwge1xuXG4gICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuXG4gICAgYmFja2VuZDoge1xuICAgICAgc2F2ZTogcmVtb3RlU3RvcmUuc2F2ZSxcbiAgICAgIGZpbmQ6IHJlbW90ZVN0b3JlLmZpbmQsXG4gICAgICBmaW5kQWxsOiByZW1vdGVTdG9yZS5maW5kQWxsLFxuICAgICAgcmVtb3ZlOiByZW1vdGVTdG9yZS5yZW1vdmUsXG4gICAgICByZW1vdmVBbGw6IHJlbW90ZVN0b3JlLnJlbW92ZUFsbFxuICAgIH1cblxuICB9KTtcblxuICAvLyBwcm9wZXJ0aWVzXG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIG5hbWVcblxuICAvLyB0aGUgbmFtZSBvZiB0aGUgUmVtb3RlIGlzIHRoZSBuYW1lIG9mIHRoZVxuICAvLyBDb3VjaERCIGRhdGFiYXNlIGFuZCBpcyBhbHNvIHVzZWQgdG8gcHJlZml4XG4gIC8vIHRyaWdnZXJlZCBldmVudHNcbiAgLy9cbiAgdmFyIHJlbW90ZU5hbWUgPSBudWxsO1xuXG5cbiAgLy8gc3luY1xuXG4gIC8vIGlmIHNldCB0byB0cnVlLCB1cGRhdGVzIHdpbGwgYmUgY29udGludW91c2x5IHB1bGxlZFxuICAvLyBhbmQgcHVzaGVkLiBBbHRlcm5hdGl2ZWx5LCBgc3luY2AgY2FuIGJlIHNldCB0b1xuICAvLyBgcHVsbDogdHJ1ZWAgb3IgYHB1c2g6IHRydWVgLlxuICAvL1xuICByZW1vdGUuY29ubmVjdGVkID0gZmFsc2U7XG5cblxuICAvLyBwcmVmaXhcblxuICAvL3ByZWZpeCBmb3IgZG9jcyBpbiBhIENvdWNoREIgZGF0YWJhc2UsIGUuZy4gYWxsIGRvY3NcbiAgLy8gaW4gcHVibGljIHVzZXIgc3RvcmVzIGFyZSBwcmVmaXhlZCBieSAnJHB1YmxpYy8nXG4gIC8vXG4gIHJlbW90ZS5wcmVmaXggPSAnJztcblxuXG5cbiAgLy8gZGVmYXVsdHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vXG4gIGlmIChvcHRpb25zLm5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlbW90ZU5hbWUgPSBvcHRpb25zLm5hbWU7XG4gIH1cblxuICBpZiAob3B0aW9ucy5wcmVmaXggIT09IHVuZGVmaW5lZCkge1xuICAgIHJlbW90ZS5wcmVmaXggPSBvcHRpb25zLnByZWZpeDtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmJhc2VVcmwgIT09IG51bGwpIHtcbiAgICByZW1vdGUuYmFzZVVybCA9IG9wdGlvbnMuYmFzZVVybDtcbiAgfVxuXG5cbiAgLy8gcmVxdWVzdFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyB3cmFwcGVyIGZvciBob29kaWUucmVxdWVzdCwgd2l0aCBzb21lIHN0b3JlIHNwZWNpZmljIGRlZmF1bHRzXG4gIC8vIGFuZCBhIHByZWZpeGVkIHBhdGhcbiAgLy9cbiAgcmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QodHlwZSwgcGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKHJlbW90ZU5hbWUpIHtcbiAgICAgIHBhdGggPSAnLycgKyAoZW5jb2RlVVJJQ29tcG9uZW50KHJlbW90ZU5hbWUpKSArIHBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHJlbW90ZS5iYXNlVXJsKSB7XG4gICAgICBwYXRoID0gJycgKyByZW1vdGUuYmFzZVVybCArIHBhdGg7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5jb250ZW50VHlwZSA9IG9wdGlvbnMuY29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG4gICAgaWYgKHR5cGUgPT09ICdQT1NUJyB8fCB0eXBlID09PSAnUFVUJykge1xuICAgICAgb3B0aW9ucy5kYXRhVHlwZSA9IG9wdGlvbnMuZGF0YVR5cGUgfHwgJ2pzb24nO1xuICAgICAgb3B0aW9ucy5wcm9jZXNzRGF0YSA9IG9wdGlvbnMucHJvY2Vzc0RhdGEgfHwgZmFsc2U7XG4gICAgICBvcHRpb25zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdCh0eXBlLCBwYXRoLCBvcHRpb25zKTtcbiAgfTtcblxuXG4gIC8vIGlzS25vd25PYmplY3RcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gZGV0ZXJtaW5lIGJldHdlZW4gYSBrbm93biBhbmQgYSBuZXcgb2JqZWN0XG4gIC8vXG4gIHJlbW90ZS5pc0tub3duT2JqZWN0ID0gZnVuY3Rpb24gaXNLbm93bk9iamVjdChvYmplY3QpIHtcbiAgICB2YXIga2V5ID0gJycgKyBvYmplY3QudHlwZSArICcvJyArIG9iamVjdC5pZDtcblxuICAgIGlmIChrbm93bk9iamVjdHNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ga25vd25PYmplY3RzW2tleV07XG4gICAgfVxuICB9O1xuXG5cbiAgLy8gbWFya0FzS25vd25PYmplY3RcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGRldGVybWluZSBiZXR3ZWVuIGEga25vd24gYW5kIGEgbmV3IG9iamVjdFxuICAvL1xuICByZW1vdGUubWFya0FzS25vd25PYmplY3QgPSBmdW5jdGlvbiBtYXJrQXNLbm93bk9iamVjdChvYmplY3QpIHtcbiAgICB2YXIga2V5ID0gJycgKyBvYmplY3QudHlwZSArICcvJyArIG9iamVjdC5pZDtcbiAgICBrbm93bk9iamVjdHNba2V5XSA9IDE7XG4gICAgcmV0dXJuIGtub3duT2JqZWN0c1trZXldO1xuICB9O1xuXG5cbiAgLy8gc3luY2hyb25pemF0aW9uXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQ29ubmVjdFxuICAvLyAtLS0tLS0tLS1cblxuICAvLyBzdGFydCBzeW5jaW5nLiBgcmVtb3RlLmJvb3RzdHJhcCgpYCB3aWxsIGF1dG9tYXRpY2FsbHkgc3RhcnRcbiAgLy8gcHVsbGluZyB3aGVuIGByZW1vdGUuY29ubmVjdGVkYCByZW1haW5zIHRydWUuXG4gIC8vXG4gIHJlbW90ZS5jb25uZWN0ID0gZnVuY3Rpb24gY29ubmVjdChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJlbW90ZU5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICByZW1vdGUuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICByZW1vdGUudHJpZ2dlcignY29ubmVjdCcpOyAvLyBUT0RPOiBzcGVjIHRoYXRcbiAgICByZXR1cm4gcmVtb3RlLmJvb3RzdHJhcCgpO1xuICB9O1xuXG5cbiAgLy8gRGlzY29ubmVjdFxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyBzdG9wIHN5bmNpbmcgY2hhbmdlcyBmcm9tIHJlbW90ZSBzdG9yZVxuICAvL1xuICByZW1vdGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgcmVtb3RlLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHJlbW90ZS50cmlnZ2VyKCdkaXNjb25uZWN0Jyk7IC8vIFRPRE86IHNwZWMgdGhhdFxuXG4gICAgaWYgKHB1bGxSZXF1ZXN0KSB7XG4gICAgICBwdWxsUmVxdWVzdC5hYm9ydCgpO1xuICAgIH1cblxuICAgIGlmIChwdXNoUmVxdWVzdCkge1xuICAgICAgcHVzaFJlcXVlc3QuYWJvcnQoKTtcbiAgICB9XG5cbiAgfTtcblxuXG4gIC8vIGlzQ29ubmVjdGVkXG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvL1xuICByZW1vdGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gcmVtb3RlLmNvbm5lY3RlZDtcbiAgfTtcblxuXG4gIC8vIGdldFNpbmNlTnJcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmV0dXJucyB0aGUgc2VxdWVuY2UgbnVtYmVyIGZyb20gd2ljaCB0byBzdGFydCB0byBmaW5kIGNoYW5nZXMgaW4gcHVsbFxuICAvL1xuICB2YXIgc2luY2UgPSBvcHRpb25zLnNpbmNlIHx8IDA7IC8vIFRPRE86IHNwZWMgdGhhdCFcbiAgcmVtb3RlLmdldFNpbmNlTnIgPSBmdW5jdGlvbiBnZXRTaW5jZU5yKCkge1xuICAgIGlmICh0eXBlb2Ygc2luY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBzaW5jZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBzaW5jZTtcbiAgfTtcblxuXG4gIC8vIGJvb3RzdHJhcFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vIGluaXRhbCBwdWxsIG9mIGRhdGEgb2YgdGhlIHJlbW90ZSBzdG9yZS4gQnkgZGVmYXVsdCwgd2UgcHVsbCBhbGxcbiAgLy8gY2hhbmdlcyBzaW5jZSB0aGUgYmVnaW5uaW5nLCBidXQgdGhpcyBiZWhhdmlvciBtaWdodCBiZSBhZGp1c3RlZCxcbiAgLy8gZS5nIGZvciBhIGZpbHRlcmVkIGJvb3RzdHJhcC5cbiAgLy9cbiAgdmFyIGlzQm9vdHN0cmFwcGluZyA9IGZhbHNlO1xuICByZW1vdGUuYm9vdHN0cmFwID0gZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICAgIGlzQm9vdHN0cmFwcGluZyA9IHRydWU7XG4gICAgcmVtb3RlLnRyaWdnZXIoJ2Jvb3RzdHJhcDpzdGFydCcpO1xuICAgIHJldHVybiByZW1vdGUucHVsbCgpLmRvbmUoIGhhbmRsZUJvb3RzdHJhcFN1Y2Nlc3MgKTtcbiAgfTtcblxuXG4gIC8vIHB1bGwgY2hhbmdlc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGEuay5hLiBtYWtlIGEgR0VUIHJlcXVlc3QgdG8gQ291Y2hEQidzIGBfY2hhbmdlc2AgZmVlZC5cbiAgLy8gV2UgY3VycmVudGx5IG1ha2UgbG9uZyBwb2xsIHJlcXVlc3RzLCB0aGF0IHdlIG1hbnVhbGx5IGFib3J0XG4gIC8vIGFuZCByZXN0YXJ0IGVhY2ggMjUgc2Vjb25kcy5cbiAgLy9cbiAgdmFyIHB1bGxSZXF1ZXN0LCBwdWxsUmVxdWVzdFRpbWVvdXQ7XG4gIHJlbW90ZS5wdWxsID0gZnVuY3Rpb24gcHVsbCgpIHtcbiAgICBwdWxsUmVxdWVzdCA9IHJlcXVlc3QoJ0dFVCcsIHB1bGxVcmwoKSk7XG5cbiAgICBpZiAocmVtb3RlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQocHVsbFJlcXVlc3RUaW1lb3V0KTtcbiAgICAgIHB1bGxSZXF1ZXN0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KHJlc3RhcnRQdWxsUmVxdWVzdCwgMjUwMDApO1xuICAgIH1cblxuICAgIHJldHVybiBwdWxsUmVxdWVzdC5kb25lKGhhbmRsZVB1bGxTdWNjZXNzKS5mYWlsKGhhbmRsZVB1bGxFcnJvcik7XG4gIH07XG5cblxuICAvLyBwdXNoIGNoYW5nZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBQdXNoIG9iamVjdHMgdG8gcmVtb3RlIHN0b3JlIHVzaW5nIHRoZSBgX2J1bGtfZG9jc2AgQVBJLlxuICAvL1xuICB2YXIgcHVzaFJlcXVlc3Q7XG4gIHJlbW90ZS5wdXNoID0gZnVuY3Rpb24gcHVzaChvYmplY3RzKSB7XG4gICAgdmFyIG9iamVjdCwgb2JqZWN0c0ZvclJlbW90ZSwgX2ksIF9sZW47XG5cbiAgICBpZiAoISQuaXNBcnJheShvYmplY3RzKSkge1xuICAgICAgb2JqZWN0cyA9IGRlZmF1bHRPYmplY3RzVG9QdXNoKCk7XG4gICAgfVxuXG4gICAgaWYgKG9iamVjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZXMucmVzb2x2ZVdpdGgoW10pO1xuICAgIH1cblxuICAgIG9iamVjdHNGb3JSZW1vdGUgPSBbXTtcblxuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuXG4gICAgICAvLyBkb24ndCBtZXNzIHdpdGggb3JpZ2luYWwgb2JqZWN0c1xuICAgICAgb2JqZWN0ID0gJC5leHRlbmQodHJ1ZSwge30sIG9iamVjdHNbX2ldKTtcbiAgICAgIGFkZFJldmlzaW9uVG8ob2JqZWN0KTtcbiAgICAgIG9iamVjdCA9IHBhcnNlRm9yUmVtb3RlKG9iamVjdCk7XG4gICAgICBvYmplY3RzRm9yUmVtb3RlLnB1c2gob2JqZWN0KTtcbiAgICB9XG4gICAgcHVzaFJlcXVlc3QgPSByZXF1ZXN0KCdQT1NUJywgJy9fYnVsa19kb2NzJywge1xuICAgICAgZGF0YToge1xuICAgICAgICBkb2NzOiBvYmplY3RzRm9yUmVtb3RlLFxuICAgICAgICBuZXdfZWRpdHM6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwdXNoUmVxdWVzdC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlbW90ZS50cmlnZ2VyKCdwdXNoJywgb2JqZWN0c1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHB1c2hSZXF1ZXN0O1xuICB9O1xuXG4gIC8vIHN5bmMgY2hhbmdlc1xuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHB1c2ggb2JqZWN0cywgdGhlbiBwdWxsIHVwZGF0ZXMuXG4gIC8vXG4gIHJlbW90ZS5zeW5jID0gZnVuY3Rpb24gc3luYyhvYmplY3RzKSB7XG4gICAgcmV0dXJuIHJlbW90ZS5wdXNoKG9iamVjdHMpLnRoZW4ocmVtb3RlLnB1bGwpO1xuICB9O1xuXG4gIC8vXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tXG4gIC8vXG5cbiAgLy8gaW4gb3JkZXIgdG8gZGlmZmVyZW50aWF0ZSB3aGV0aGVyIGFuIG9iamVjdCBmcm9tIHJlbW90ZSBzaG91bGQgdHJpZ2dlciBhICduZXcnXG4gIC8vIG9yIGFuICd1cGRhdGUnIGV2ZW50LCB3ZSBzdG9yZSBhIGhhc2ggb2Yga25vd24gb2JqZWN0c1xuICB2YXIga25vd25PYmplY3RzID0ge307XG5cblxuICAvLyB2YWxpZCBDb3VjaERCIGRvYyBhdHRyaWJ1dGVzIHN0YXJ0aW5nIHdpdGggYW4gdW5kZXJzY29yZVxuICAvL1xuICB2YXIgdmFsaWRTcGVjaWFsQXR0cmlidXRlcyA9IFsnX2lkJywgJ19yZXYnLCAnX2RlbGV0ZWQnLCAnX3JldmlzaW9ucycsICdfYXR0YWNobWVudHMnXTtcblxuXG4gIC8vIGRlZmF1bHQgb2JqZWN0cyB0byBwdXNoXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gd2hlbiBwdXNoZWQgd2l0aG91dCBwYXNzaW5nIGFueSBvYmplY3RzLCB0aGUgb2JqZWN0cyByZXR1cm5lZCBmcm9tXG4gIC8vIHRoaXMgbWV0aG9kIHdpbGwgYmUgcGFzc2VkLiBJdCBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgcGFzc2luZyBhblxuICAvLyBhcnJheSBvZiBvYmplY3RzIG9yIGEgZnVuY3Rpb24gYXMgYG9wdGlvbnMub2JqZWN0c2BcbiAgLy9cbiAgdmFyIGRlZmF1bHRPYmplY3RzVG9QdXNoID0gZnVuY3Rpb24gZGVmYXVsdE9iamVjdHNUb1B1c2goKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9O1xuICBpZiAob3B0aW9ucy5kZWZhdWx0T2JqZWN0c1RvUHVzaCkge1xuICAgIGlmICgkLmlzQXJyYXkob3B0aW9ucy5kZWZhdWx0T2JqZWN0c1RvUHVzaCkpIHtcbiAgICAgIGRlZmF1bHRPYmplY3RzVG9QdXNoID0gZnVuY3Rpb24gZGVmYXVsdE9iamVjdHNUb1B1c2goKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmYXVsdE9iamVjdHNUb1B1c2ggPSBvcHRpb25zLmRlZmF1bHRPYmplY3RzVG9QdXNoO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gc2V0U2luY2VOclxuICAvLyAtLS0tLS0tLS0tLS1cblxuICAvLyBzZXRzIHRoZSBzZXF1ZW5jZSBudW1iZXIgZnJvbSB3aWNoIHRvIHN0YXJ0IHRvIGZpbmQgY2hhbmdlcyBpbiBwdWxsLlxuICAvLyBJZiByZW1vdGUgc3RvcmUgd2FzIGluaXRpYWxpemVkIHdpdGggc2luY2UgOiBmdW5jdGlvbihucikgeyAuLi4gfSxcbiAgLy8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgc2VxIHBhc3NlZC4gT3RoZXJ3aXNlIHNpbXBseSBzZXQgdGhlIHNlcVxuICAvLyBudW1iZXIgYW5kIHJldHVybiBpdC5cbiAgLy9cbiAgZnVuY3Rpb24gc2V0U2luY2VOcihzZXEpIHtcbiAgICBpZiAodHlwZW9mIHNpbmNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gc2luY2Uoc2VxKTtcbiAgICB9XG5cbiAgICBzaW5jZSA9IHNlcTtcbiAgICByZXR1cm4gc2luY2U7XG4gIH1cblxuXG4gIC8vIFBhcnNlIGZvciByZW1vdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gcGFyc2Ugb2JqZWN0IGZvciByZW1vdGUgc3RvcmFnZS4gQWxsIHByb3BlcnRpZXMgc3RhcnRpbmcgd2l0aCBhblxuICAvLyBgdW5kZXJzY29yZWAgZG8gbm90IGdldCBzeW5jaHJvbml6ZWQgZGVzcGl0ZSB0aGUgc3BlY2lhbCBwcm9wZXJ0aWVzXG4gIC8vIGBfaWRgLCBgX3JldmAgYW5kIGBfZGVsZXRlZGAgKHNlZSBhYm92ZSlcbiAgLy9cbiAgLy8gQWxzbyBgaWRgIGdldHMgcmVwbGFjZWQgd2l0aCBgX2lkYCB3aGljaCBjb25zaXN0cyBvZiB0eXBlICYgaWRcbiAgLy9cbiAgZnVuY3Rpb24gcGFyc2VGb3JSZW1vdGUob2JqZWN0KSB7XG4gICAgdmFyIGF0dHIsIHByb3BlcnRpZXM7XG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCBvYmplY3QpO1xuXG4gICAgZm9yIChhdHRyIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgIGlmICh2YWxpZFNwZWNpYWxBdHRyaWJ1dGVzLmluZGV4T2YoYXR0cikgIT09IC0xKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEvXl8vLnRlc3QoYXR0cikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgcHJvcGVydGllc1thdHRyXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwcmVwYXJlIENvdWNoREIgaWRcbiAgICBwcm9wZXJ0aWVzLl9pZCA9ICcnICsgcHJvcGVydGllcy50eXBlICsgJy8nICsgcHJvcGVydGllcy5pZDtcbiAgICBpZiAocmVtb3RlLnByZWZpeCkge1xuICAgICAgcHJvcGVydGllcy5faWQgPSAnJyArIHJlbW90ZS5wcmVmaXggKyBwcm9wZXJ0aWVzLl9pZDtcbiAgICB9XG4gICAgZGVsZXRlIHByb3BlcnRpZXMuaWQ7XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuXG4gIC8vICMjIyBfcGFyc2VGcm9tUmVtb3RlXG5cbiAgLy8gbm9ybWFsaXplIG9iamVjdHMgY29taW5nIGZyb20gcmVtb3RlXG4gIC8vXG4gIC8vIHJlbmFtZXMgYF9pZGAgYXR0cmlidXRlIHRvIGBpZGAgYW5kIHJlbW92ZXMgdGhlIHR5cGUgZnJvbSB0aGUgaWQsXG4gIC8vIGUuZy4gYHR5cGUvMTIzYCAtPiBgMTIzYFxuICAvL1xuICBmdW5jdGlvbiBwYXJzZUZyb21SZW1vdGUob2JqZWN0KSB7XG4gICAgdmFyIGlkLCBpZ25vcmUsIF9yZWY7XG5cbiAgICAvLyBoYW5kbGUgaWQgYW5kIHR5cGVcbiAgICBpZCA9IG9iamVjdC5faWQgfHwgb2JqZWN0LmlkO1xuICAgIGRlbGV0ZSBvYmplY3QuX2lkO1xuXG4gICAgaWYgKHJlbW90ZS5wcmVmaXgpIHtcbiAgICAgIGlkID0gaWQucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIHJlbW90ZS5wcmVmaXgpLCAnJyk7XG4gICAgfVxuXG4gICAgLy8gdHVybiBkb2MvMTIzIGludG8gdHlwZSA9IGRvYyAmIGlkID0gMTIzXG4gICAgLy8gTk9URTogd2UgZG9uJ3QgdXNlIGEgc2ltcGxlIGlkLnNwbGl0KC9cXC8vKSBoZXJlLFxuICAgIC8vIGFzIGluIHNvbWUgY2FzZXMgSURzIG1pZ2h0IGNvbnRhaW4gJy8nLCB0b29cbiAgICAvL1xuICAgIF9yZWYgPSBpZC5tYXRjaCgvKFteXFwvXSspXFwvKC4qKS8pLFxuICAgIGlnbm9yZSA9IF9yZWZbMF0sXG4gICAgb2JqZWN0LnR5cGUgPSBfcmVmWzFdLFxuICAgIG9iamVjdC5pZCA9IF9yZWZbMl07XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VBbGxGcm9tUmVtb3RlKG9iamVjdHMpIHtcbiAgICB2YXIgb2JqZWN0LCBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IG9iamVjdHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG9iamVjdCA9IG9iamVjdHNbX2ldO1xuICAgICAgX3Jlc3VsdHMucHVzaChwYXJzZUZyb21SZW1vdGUob2JqZWN0KSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfVxuXG5cbiAgLy8gIyMjIF9hZGRSZXZpc2lvblRvXG5cbiAgLy8gZXh0ZW5kcyBwYXNzZWQgb2JqZWN0IHdpdGggYSBfcmV2IHByb3BlcnR5XG4gIC8vXG4gIGZ1bmN0aW9uIGFkZFJldmlzaW9uVG8oYXR0cmlidXRlcykge1xuICAgIHZhciBjdXJyZW50UmV2SWQsIGN1cnJlbnRSZXZOciwgbmV3UmV2aXNpb25JZCwgX3JlZjtcbiAgICB0cnkge1xuICAgICAgX3JlZiA9IGF0dHJpYnV0ZXMuX3Jldi5zcGxpdCgvLS8pLFxuICAgICAgY3VycmVudFJldk5yID0gX3JlZlswXSxcbiAgICAgIGN1cnJlbnRSZXZJZCA9IF9yZWZbMV07XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgIGN1cnJlbnRSZXZOciA9IHBhcnNlSW50KGN1cnJlbnRSZXZOciwgMTApIHx8IDA7XG4gICAgbmV3UmV2aXNpb25JZCA9IGdlbmVyYXRlTmV3UmV2aXNpb25JZCgpO1xuXG4gICAgLy8gbG9jYWwgY2hhbmdlcyBhcmUgbm90IG1lYW50IHRvIGJlIHJlcGxpY2F0ZWQgb3V0c2lkZSBvZiB0aGVcbiAgICAvLyB1c2VycyBkYXRhYmFzZSwgdGhlcmVmb3JlIHRoZSBgLWxvY2FsYCBzdWZmaXguXG4gICAgaWYgKGF0dHJpYnV0ZXMuXyRsb2NhbCkge1xuICAgICAgbmV3UmV2aXNpb25JZCArPSAnLWxvY2FsJztcbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVzLl9yZXYgPSAnJyArIChjdXJyZW50UmV2TnIgKyAxKSArICctJyArIG5ld1JldmlzaW9uSWQ7XG4gICAgYXR0cmlidXRlcy5fcmV2aXNpb25zID0ge1xuICAgICAgc3RhcnQ6IDEsXG4gICAgICBpZHM6IFtuZXdSZXZpc2lvbklkXVxuICAgIH07XG5cbiAgICBpZiAoY3VycmVudFJldklkKSB7XG4gICAgICBhdHRyaWJ1dGVzLl9yZXZpc2lvbnMuc3RhcnQgKz0gY3VycmVudFJldk5yO1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXMuX3JldmlzaW9ucy5pZHMucHVzaChjdXJyZW50UmV2SWQpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIGdlbmVyYXRlIG5ldyByZXZpc2lvbiBpZFxuXG4gIC8vXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTmV3UmV2aXNpb25JZCgpIHtcbiAgICByZXR1cm4gdXVpZCg5KTtcbiAgfVxuXG5cbiAgLy8gIyMjIG1hcCBkb2NzIGZyb20gZmluZEFsbFxuXG4gIC8vXG4gIGZ1bmN0aW9uIG1hcERvY3NGcm9tRmluZEFsbChyZXNwb25zZSkge1xuICAgIHJldHVybiByZXNwb25zZS5yb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiByb3cuZG9jO1xuICAgIH0pO1xuICB9XG5cblxuICAvLyAjIyMgcHVsbCB1cmxcblxuICAvLyBEZXBlbmRpbmcgb24gd2hldGhlciByZW1vdGUgaXMgY29ubmVjdGVkICg9IHB1bGxpbmcgY2hhbmdlcyBjb250aW51b3VzbHkpXG4gIC8vIHJldHVybiBhIGxvbmdwb2xsIFVSTCBvciBub3QuIElmIGl0IGlzIGEgYmVnaW5uaW5nIGJvb3RzdHJhcCByZXF1ZXN0LCBkb1xuICAvLyBub3QgcmV0dXJuIGEgbG9uZ3BvbGwgVVJMLCBhcyB3ZSB3YW50IGl0IHRvIGZpbmlzaCByaWdodCBhd2F5LCBldmVuIGlmIHRoZXJlXG4gIC8vIGFyZSBubyBjaGFuZ2VzIG9uIHJlbW90ZS5cbiAgLy9cbiAgZnVuY3Rpb24gcHVsbFVybCgpIHtcbiAgICB2YXIgc2luY2U7XG4gICAgc2luY2UgPSByZW1vdGUuZ2V0U2luY2VOcigpO1xuICAgIGlmIChyZW1vdGUuaXNDb25uZWN0ZWQoKSAmJiAhaXNCb290c3RyYXBwaW5nKSB7XG4gICAgICByZXR1cm4gJy9fY2hhbmdlcz9pbmNsdWRlX2RvY3M9dHJ1ZSZzaW5jZT0nICsgc2luY2UgKyAnJmhlYXJ0YmVhdD0xMDAwMCZmZWVkPWxvbmdwb2xsJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcvX2NoYW5nZXM/aW5jbHVkZV9kb2NzPXRydWUmc2luY2U9JyArIHNpbmNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIHJlc3RhcnQgcHVsbCByZXF1ZXN0XG5cbiAgLy8gcmVxdWVzdCBnZXRzIHJlc3RhcnRlZCBhdXRvbWF0aWNjYWxseVxuICAvLyB3aGVuIGFib3J0ZWQgKHNlZSBAX2hhbmRsZVB1bGxFcnJvcilcbiAgZnVuY3Rpb24gcmVzdGFydFB1bGxSZXF1ZXN0KCkge1xuICAgIGlmIChwdWxsUmVxdWVzdCkge1xuICAgICAgcHVsbFJlcXVlc3QuYWJvcnQoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vICMjIyBwdWxsIHN1Y2Nlc3MgaGFuZGxlclxuXG4gIC8vIHJlcXVlc3QgZ2V0cyByZXN0YXJ0ZWQgYXV0b21hdGljY2FsbHlcbiAgLy8gd2hlbiBhYm9ydGVkIChzZWUgQF9oYW5kbGVQdWxsRXJyb3IpXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZVB1bGxTdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgc2V0U2luY2VOcihyZXNwb25zZS5sYXN0X3NlcSk7XG4gICAgaGFuZGxlUHVsbFJlc3VsdHMocmVzcG9uc2UucmVzdWx0cyk7XG4gICAgaWYgKHJlbW90ZS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICByZXR1cm4gcmVtb3RlLnB1bGwoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vICMjIyBwdWxsIGVycm9yIGhhbmRsZXJcblxuICAvLyB3aGVuIHRoZXJlIGlzIGEgY2hhbmdlLCB0cmlnZ2VyIGV2ZW50LFxuICAvLyB0aGVuIGNoZWNrIGZvciBhbm90aGVyIGNoYW5nZVxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQdWxsRXJyb3IoeGhyLCBlcnJvcikge1xuICAgIGlmICghcmVtb3RlLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHhoci5zdGF0dXMpIHtcbiAgICAgIC8vIFNlc3Npb24gaXMgaW52YWxpZC4gVXNlciBpcyBzdGlsbCBsb2dpbiwgYnV0IG5lZWRzIHRvIHJlYXV0aGVudGljYXRlXG4gICAgICAvLyBiZWZvcmUgc3luYyBjYW4gYmUgY29udGludWVkXG4gICAgY2FzZSA0MDE6XG4gICAgICByZW1vdGUudHJpZ2dlcignZXJyb3I6dW5hdXRoZW50aWNhdGVkJywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHJlbW90ZS5kaXNjb25uZWN0KCk7XG5cbiAgICAgLy8gdGhlIDQwNCBjb21lcywgd2hlbiB0aGUgcmVxdWVzdGVkIERCIGhhcyBiZWVuIHJlbW92ZWRcbiAgICAgLy8gb3IgZG9lcyBub3QgZXhpc3QgeWV0LlxuICAgICAvL1xuICAgICAvLyBCVVQ6IGl0IG1pZ2h0IGFsc28gaGFwcGVuIHRoYXQgdGhlIGJhY2tncm91bmQgd29ya2VycyBkaWRcbiAgICAgLy8gICAgICBub3QgY3JlYXRlIGEgcGVuZGluZyBkYXRhYmFzZSB5ZXQuIFRoZXJlZm9yZSxcbiAgICAgLy8gICAgICB3ZSB0cnkgaXQgYWdhaW4gaW4gMyBzZWNvbmRzXG4gICAgIC8vXG4gICAgIC8vIFRPRE86IHJldmlldyAvIHJldGhpbmsgdGhhdC5cbiAgICAgLy9cblxuICAgIGNhc2UgNDA0OlxuICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHJlbW90ZS5wdWxsLCAzMDAwKTtcblxuICAgIGNhc2UgNTAwOlxuICAgICAgLy9cbiAgICAgIC8vIFBsZWFzZSBzZXJ2ZXIsIGRvbid0IGdpdmUgdXMgdGhlc2UuIEF0IGxlYXN0IG5vdCBwZXJzaXN0ZW50bHlcbiAgICAgIC8vXG4gICAgICByZW1vdGUudHJpZ2dlcignZXJyb3I6c2VydmVyJywgZXJyb3IpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQocmVtb3RlLnB1bGwsIDMwMDApO1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb24uY2hlY2tDb25uZWN0aW9uKCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIHVzdWFsbHkgYSAwLCB3aGljaCBzdGFuZHMgZm9yIHRpbWVvdXQgb3Igc2VydmVyIG5vdCByZWFjaGFibGUuXG4gICAgICBpZiAoeGhyLnN0YXR1c1RleHQgPT09ICdhYm9ydCcpIHtcbiAgICAgICAgLy8gbWFudWFsIGFib3J0IGFmdGVyIDI1c2VjLiByZXN0YXJ0IHB1bGxpbmcgY2hhbmdlcyBkaXJlY3RseSB3aGVuIGNvbm5lY3RlZFxuICAgICAgICByZXR1cm4gcmVtb3RlLnB1bGwoKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gb29wcy4gVGhpcyBtaWdodCBiZSBjYXVzZWQgYnkgYW4gdW5yZWFjaGFibGUgc2VydmVyLlxuICAgICAgICAvLyBPciB0aGUgc2VydmVyIGNhbmNlbGxlZCBpdCBmb3Igd2hhdCBldmVyIHJlYXNvbiwgZS5nLlxuICAgICAgICAvLyBoZXJva3Uga2lsbHMgdGhlIHJlcXVlc3QgYWZ0ZXIgfjMwcy5cbiAgICAgICAgLy8gd2UnbGwgdHJ5IGFnYWluIGFmdGVyIGEgM3MgdGltZW91dFxuICAgICAgICAvL1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChyZW1vdGUucHVsbCwgMzAwMCk7XG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uLmNoZWNrQ29ubmVjdGlvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gIyMjIGhhbmRsZSBjaGFuZ2VzIGZyb20gcmVtb3RlXG4gIC8vXG4gIGZ1bmN0aW9uIGhhbmRsZUJvb3RzdHJhcFN1Y2Nlc3MoKSB7XG4gICAgaXNCb290c3RyYXBwaW5nID0gZmFsc2U7XG4gICAgcmVtb3RlLnRyaWdnZXIoJ2Jvb3RzdHJhcDplbmQnKTtcbiAgfVxuXG4gIC8vICMjIyBoYW5kbGUgY2hhbmdlcyBmcm9tIHJlbW90ZVxuICAvL1xuICBmdW5jdGlvbiBoYW5kbGVQdWxsUmVzdWx0cyhjaGFuZ2VzKSB7XG4gICAgdmFyIGRvYywgZXZlbnQsIG9iamVjdCwgX2ksIF9sZW47XG5cbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGNoYW5nZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGRvYyA9IGNoYW5nZXNbX2ldLmRvYztcblxuICAgICAgaWYgKHJlbW90ZS5wcmVmaXggJiYgZG9jLl9pZC5pbmRleE9mKHJlbW90ZS5wcmVmaXgpICE9PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBvYmplY3QgPSBwYXJzZUZyb21SZW1vdGUoZG9jKTtcblxuICAgICAgaWYgKG9iamVjdC5fZGVsZXRlZCkge1xuICAgICAgICBpZiAoIXJlbW90ZS5pc0tub3duT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBldmVudCA9ICdyZW1vdmUnO1xuICAgICAgICByZW1vdGUuaXNLbm93bk9iamVjdChvYmplY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlbW90ZS5pc0tub3duT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgICBldmVudCA9ICd1cGRhdGUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50ID0gJ2FkZCc7XG4gICAgICAgICAgcmVtb3RlLm1hcmtBc0tub3duT2JqZWN0KG9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVtb3RlLnRyaWdnZXIoZXZlbnQsIG9iamVjdCk7XG4gICAgICByZW1vdGUudHJpZ2dlcihldmVudCArICc6JyArIG9iamVjdC50eXBlLCBvYmplY3QpO1xuICAgICAgcmVtb3RlLnRyaWdnZXIoZXZlbnQgKyAnOicgKyBvYmplY3QudHlwZSArICc6JyArIG9iamVjdC5pZCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2UnLCBldmVudCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2U6JyArIG9iamVjdC50eXBlLCBldmVudCwgb2JqZWN0KTtcbiAgICAgIHJlbW90ZS50cmlnZ2VyKCdjaGFuZ2U6JyArIG9iamVjdC50eXBlICsgJzonICsgb2JqZWN0LmlkLCBldmVudCwgb2JqZWN0KTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGJvb3RzdHJhcCBrbm93biBvYmplY3RzXG4gIC8vXG4gIGlmIChvcHRpb25zLmtub3duT2JqZWN0cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5rbm93bk9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlbW90ZS5tYXJrQXNLbm93bk9iamVjdCh7XG4gICAgICAgIHR5cGU6IG9wdGlvbnMua25vd25PYmplY3RzW2ldLnR5cGUsXG4gICAgICAgIGlkOiBvcHRpb25zLmtub3duT2JqZWN0c1tpXS5pZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBleHBvc2UgcHVibGljIEFQSVxuICByZXR1cm4gcmVtb3RlO1xufTtcbiIsIi8qIGV4cG9ydGVkIGhvb2RpZVJlcXVlc3QgKi9cblxuLy9cbi8vIGhvb2RpZS5yZXF1ZXN0XG4vLyA9PT09PT09PT09PT09PT09XG5cbi8vXG52YXIgcHJvbWlzZXMgPSByZXF1aXJlKCcuL3Byb21pc2VzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuICB2YXIgJGV4dGVuZCA9ICQuZXh0ZW5kO1xuICB2YXIgJGFqYXggPSAkLmFqYXg7XG5cbiAgLy8gSG9vZGllIGJhY2tlbmQgbGlzdGVudHMgdG8gcmVxdWVzdHMgcHJlZml4ZWQgYnkgL19hcGksXG4gIC8vIHNvIHdlIHByZWZpeCBhbGwgcmVxdWVzdHMgd2l0aCByZWxhdGl2ZSBVUkxzXG4gIHZhciBBUElfUEFUSCA9ICcvX2FwaSc7XG5cbiAgLy8gUmVxdWVzdHNcbiAgLy8gLS0tLS0tLS0tLVxuXG4gIC8vIHNlbmRzIHJlcXVlc3RzIHRvIHRoZSBob29kaWUgYmFja2VuZC5cbiAgLy9cbiAgLy8gICAgIHByb21pc2UgPSBob29kaWUucmVxdWVzdCgnR0VUJywgJy91c2VyX2RhdGFiYXNlL2RvY19pZCcpXG4gIC8vXG4gIGZ1bmN0aW9uIHJlcXVlc3QodHlwZSwgdXJsLCBvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzLCByZXF1ZXN0UHJvbWlzZSwgcGlwZWRQcm9taXNlO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgfTtcblxuICAgIC8vIGlmIGFic29sdXRlIHBhdGggcGFzc2VkLCBzZXQgQ09SUyBoZWFkZXJzXG5cbiAgICAvLyBpZiByZWxhdGl2ZSBwYXRoIHBhc3NlZCwgcHJlZml4IHdpdGggYmFzZVVybFxuICAgIGlmICghL15odHRwLy50ZXN0KHVybCkpIHtcbiAgICAgIHVybCA9ICh0aGlzLmJhc2VVcmwgfHwgJycpICsgQVBJX1BBVEggKyB1cmw7XG4gICAgfVxuXG4gICAgLy8gaWYgdXJsIGlzIGNyb3NzIGRvbWFpbiwgc2V0IENPUlMgaGVhZGVyc1xuICAgIGlmICgvXmh0dHAvLnRlc3QodXJsKSkge1xuICAgICAgZGVmYXVsdHMueGhyRmllbGRzID0ge1xuICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWVcbiAgICAgIH07XG4gICAgICBkZWZhdWx0cy5jcm9zc0RvbWFpbiA9IHRydWU7XG4gICAgfVxuXG4gICAgZGVmYXVsdHMudXJsID0gdXJsO1xuXG5cbiAgICAvLyB3ZSBhcmUgcGlwaW5nIHRoZSByZXN1bHQgb2YgdGhlIHJlcXVlc3QgdG8gcmV0dXJuIGEgbmljZXJcbiAgICAvLyBlcnJvciBpZiB0aGUgcmVxdWVzdCBjYW5ub3QgcmVhY2ggdGhlIHNlcnZlciBhdCBhbGwuXG4gICAgLy8gV2UgY2FuJ3QgcmV0dXJuIHRoZSBwcm9taXNlIG9mIGFqYXggZGlyZWN0bHkgYmVjYXVzZSBvZlxuICAgIC8vIHRoZSBwaXBpbmcsIGFzIGZvciB3aGF0ZXZlciByZWFzb24gdGhlIHJldHVybmVkIHByb21pc2VcbiAgICAvLyBkb2VzIG5vdCBoYXZlIHRoZSBgYWJvcnRgIG1ldGhvZCBhbnkgbW9yZSwgbWF5YmUgb3RoZXJzXG4gICAgLy8gYXMgd2VsbC4gU2VlIGFsc28gaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQxMDRcbiAgICByZXF1ZXN0UHJvbWlzZSA9ICRhamF4KCRleHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgICBwaXBlZFByb21pc2UgPSByZXF1ZXN0UHJvbWlzZS50aGVuKCBudWxsLCBwaXBlUmVxdWVzdEVycm9yKTtcbiAgICBwaXBlZFByb21pc2UuYWJvcnQgPSByZXF1ZXN0UHJvbWlzZS5hYm9ydDtcblxuICAgIHJldHVybiBwaXBlZFByb21pc2U7XG4gIH1cblxuICAvL1xuICAvL1xuICAvL1xuICBmdW5jdGlvbiBwaXBlUmVxdWVzdEVycm9yKHhocikge1xuICAgIHZhciBlcnJvcjtcblxuICAgIHRyeSB7XG4gICAgICBlcnJvciA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlcnJvciA9IHtcbiAgICAgICAgZXJyb3I6IHhoci5yZXNwb25zZVRleHQgfHwgKCdDYW5ub3QgY29ubmVjdCB0byBIb29kaWUgc2VydmVyIGF0ICcgKyAodGhpcy5iYXNlVXJsIHx8ICcvJykpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlcy5yZWplY3RXaXRoKGVycm9yKS5wcm9taXNlKCk7XG4gIH1cblxuXG4gIC8vXG4gIC8vIHB1YmxpYyBBUElcbiAgLy9cbiAgcmV0dXJuIHJlcXVlc3Q7XG59KCkpO1xuIiwiXG4vLyBzY29wZWQgU3RvcmVcbi8vID09PT09PT09PT09PVxuXG4vLyBzYW1lIGFzIHN0b3JlLCBidXQgd2l0aCB0eXBlIHByZXNldCB0byBhbiBpbml0aWFsbHlcbi8vIHBhc3NlZCB2YWx1ZS5cbi8vXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnLi9ldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaG9vZGllLCBvcHRpb25zKSB7XG5cbiAgLy8gbmFtZVxuICB2YXIgc3RvcmVOYW1lO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgaWYgKCF0aGlzLm9wdGlvbnMubmFtZSkge1xuICAgIHN0b3JlTmFtZSA9ICdzdG9yZSc7XG4gIH0gZWxzZSB7XG4gICAgc3RvcmVOYW1lID0gdGhpcy5vcHRpb25zLm5hbWU7XG4gIH1cblxuICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgdmFyIGlkID0gb3B0aW9ucy5pZDtcblxuICB2YXIgYXBpID0ge307XG5cbiAgLy8gc2NvcGVkIGJ5IHR5cGUgb25seVxuICBpZiAoIWlkKSB7XG5cbiAgICAvLyBhZGQgZXZlbnRzXG4gICAgZXZlbnRzKHtcbiAgICAgIGNvbnRleHQ6IGFwaSxcbiAgICAgIG5hbWVzcGFjZTogc3RvcmVOYW1lICsgJzonICsgdHlwZVxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuc2F2ZSh0eXBlLCBpZCwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmFkZCA9IGZ1bmN0aW9uIGFkZChwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmFkZCh0eXBlLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuZmluZCA9IGZ1bmN0aW9uIGZpbmQoaWQpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUuZmluZCh0eXBlLCBpZCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLmZpbmRPckFkZCA9IGZ1bmN0aW9uIGZpbmRPckFkZChpZCwgcHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5maW5kT3JBZGQodHlwZSwgaWQsIHByb3BlcnRpZXMpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS5maW5kQWxsID0gZnVuY3Rpb24gZmluZEFsbChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmZpbmRBbGwodHlwZSwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnVwZGF0ZSh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkudXBkYXRlQWxsID0gZnVuY3Rpb24gdXBkYXRlQWxsKG9iamVjdFVwZGF0ZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS51cGRhdGVBbGwodHlwZSwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKGlkLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnJlbW92ZSh0eXBlLCBpZCwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgYXBpLnJlbW92ZUFsbCA9IGZ1bmN0aW9uIHJlbW92ZUFsbChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnJlbW92ZUFsbCh0eXBlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gIH1cblxuICAvLyBzY29wZWQgYnkgYm90aDogdHlwZSAmIGlkXG4gIGlmIChpZCkge1xuXG4gICAgLy8gYWRkIGV2ZW50c1xuICAgIGV2ZW50cyh7XG4gICAgICBjb250ZXh0OiBhcGksXG4gICAgICBuYW1lc3BhY2U6IHN0b3JlTmFtZSArICc6JyArIHR5cGUgKyAnOicgKyBpZFxuICAgIH0pO1xuXG4gICAgLy9cbiAgICBhcGkuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUocHJvcGVydGllcywgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGhvb2RpZS5zdG9yZS5zYXZlKHR5cGUsIGlkLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkuZmluZCA9IGZ1bmN0aW9uIGZpbmQoKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLmZpbmQodHlwZSwgaWQpO1xuICAgIH07XG5cbiAgICAvL1xuICAgIGFwaS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUob2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gaG9vZGllLnN0b3JlLnVwZGF0ZSh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBhcGkucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBob29kaWUuc3RvcmUucmVtb3ZlKHR5cGUsIGlkLCBvcHRpb25zKTtcbiAgICB9O1xuICB9XG5cbiAgLy9cbiAgYXBpLmRlY29yYXRlUHJvbWlzZXMgPSBob29kaWUuc3RvcmUuZGVjb3JhdGVQcm9taXNlcztcbiAgYXBpLnZhbGlkYXRlID0gaG9vZGllLnN0b3JlLnZhbGlkYXRlO1xuXG4gIHJldHVybiBhcGk7XG5cbn07XG4iLCIvLyBTdG9yZVxuLy8gPT09PT09PT09PT09XG5cbi8vIFRoaXMgY2xhc3MgZGVmaW5lcyB0aGUgQVBJIHRoYXQgaG9vZGllLnN0b3JlIChsb2NhbCBzdG9yZSkgYW5kIGhvb2RpZS5vcGVuXG4vLyAocmVtb3RlIHN0b3JlKSBpbXBsZW1lbnQgdG8gYXNzdXJlIGEgY29oZXJlbnQgQVBJLiBJdCBhbHNvIGltcGxlbWVudHMgc29tZVxuLy8gYmFzaWMgdmFsaWRhdGlvbnMuXG4vL1xuLy8gVGhlIHJldHVybmVkIEFQSSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIG1ldGhvZHM6XG4vL1xuLy8gKiB2YWxpZGF0ZVxuLy8gKiBzYXZlXG4vLyAqIGFkZFxuLy8gKiBmaW5kXG4vLyAqIGZpbmRPckFkZFxuLy8gKiBmaW5kQWxsXG4vLyAqIHVwZGF0ZVxuLy8gKiB1cGRhdGVBbGxcbi8vICogcmVtb3ZlXG4vLyAqIHJlbW92ZUFsbFxuLy8gKiBkZWNvcmF0ZVByb21pc2VzXG4vLyAqIHRyaWdnZXJcbi8vICogb25cbi8vICogdW5iaW5kXG4vL1xuLy8gQXQgdGhlIHNhbWUgdGltZSwgdGhlIHJldHVybmVkIEFQSSBjYW4gYmUgY2FsbGVkIGFzIGZ1bmN0aW9uIHJldHVybmluZyBhXG4vLyBzdG9yZSBzY29wZWQgYnkgdGhlIHBhc3NlZCB0eXBlLCBmb3IgZXhhbXBsZVxuLy9cbi8vICAgICB2YXIgdGFza1N0b3JlID0gaG9vZGllLnN0b3JlKCd0YXNrJyk7XG4vLyAgICAgdGFza1N0b3JlLmZpbmRBbGwoKS50aGVuKCBzaG93QWxsVGFza3MgKTtcbi8vICAgICB0YXNrU3RvcmUudXBkYXRlKCdpZDEyMycsIHtkb25lOiB0cnVlfSk7XG4vL1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgc2NvcGVkU3RvcmUgPSByZXF1aXJlKCcuL3Njb3BlZF9zdG9yZScpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhvb2RpZSwgb3B0aW9ucykge1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIHBlcnNpc3RhbmNlIGxvZ2ljXG4gIHZhciBiYWNrZW5kID0ge307XG5cbiAgLy8gZXh0ZW5kIHRoaXMgcHJvcGVydHkgd2l0aCBleHRyYSBmdW5jdGlvbnMgdGhhdCB3aWxsIGJlIGF2YWlsYWJsZVxuICAvLyBvbiBhbGwgcHJvbWlzZXMgcmV0dXJuZWQgYnkgaG9vZGllLnN0b3JlIEFQSS4gSXQgaGFzIGEgcmVmZXJlbmNlXG4gIC8vIHRvIGN1cnJlbnQgaG9vZGllIGluc3RhbmNlIGJ5IGRlZmF1bHRcbiAgdmFyIHByb21pc2VBcGkgPSB7XG4gICAgaG9vZGllOiBob29kaWVcbiAgfTtcblxuICB2YXIgc3RvcmVOYW1lO1xuXG4gIGlmICghdGhpcy5vcHRpb25zLm5hbWUpIHtcbiAgICBzdG9yZU5hbWUgPSAnc3RvcmUnO1xuICB9IGVsc2Uge1xuICAgIHN0b3JlTmFtZSA9IHRoaXMub3B0aW9ucy5uYW1lO1xuICB9XG5cbiAgdmFyIGFwaSA9IHt9O1xuXG4gIHZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG4gIHV0aWwuaW5oZXJpdHMoYXBpLCBmdW5jdGlvbiBhcGkodHlwZSwgaWQpIHtcblxuICAgIHZhciBzY29wZWRPcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlkOiBpZFxuICAgIH0sIHNlbGYub3B0aW9ucyk7XG5cbiAgICByZXR1cm4gc2NvcGVkU3RvcmUuY2FsbCh0aGlzLCBob29kaWUsIGFwaSwgc2NvcGVkT3B0aW9ucyk7XG4gIH0pO1xuXG4gIC8vIGFkZCBldmVudCBBUElcbiAgZXZlbnRzKHtcbiAgICBjb250ZXh0OiBhcGksXG4gICAgbmFtZXNwYWNlOiBzdG9yZU5hbWVcbiAgfSk7XG5cblxuICAvLyBWYWxpZGF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGJ5IGRlZmF1bHQsIHdlIG9ubHkgY2hlY2sgZm9yIGEgdmFsaWQgdHlwZSAmIGlkLlxuICAvLyB0aGUgdmFsaWRhdGUgbWV0aG9kIGNhbiBiZSBvdmVyd3JpdGVuIGJ5IHBhc3NpbmdcbiAgLy8gb3B0aW9ucy52YWxpZGF0ZVxuICAvL1xuICAvLyBpZiBgdmFsaWRhdGVgIHJldHVybnMgbm90aGluZywgdGhlIHBhc3NlZCBvYmplY3QgaXNcbiAgLy8gdmFsaWQuIE90aGVyd2lzZSBpdCByZXR1cm5zIGFuIGVycm9yXG4gIC8vXG4gIGFwaS52YWxpZGF0ZSA9IGZ1bmN0aW9uKG9iamVjdCAvKiwgb3B0aW9ucyAqLykge1xuXG4gICAgaWYgKCFvYmplY3QuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW9iamVjdCkge1xuICAgICAgcmV0dXJuIGVycm9ycy5JTlZBTElEX0FSR1VNRU5UUygnbm8gb2JqZWN0IHBhc3NlZCcpO1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFR5cGUob2JqZWN0LnR5cGUpKSB7XG4gICAgICByZXR1cm4gZXJyb3JzLklOVkFMSURfS0VZKHtcbiAgICAgICAgdHlwZTogb2JqZWN0LnR5cGVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZElkKG9iamVjdC5pZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcnMuSU5WQUxJRF9LRVkoe1xuICAgICAgICBpZDogb2JqZWN0LmlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBTYXZlXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gY3JlYXRlcyBvciByZXBsYWNlcyBhbiBhbiBldmVudHVhbGx5IGV4aXN0aW5nIG9iamVjdCBpbiB0aGUgc3RvcmVcbiAgLy8gd2l0aCBzYW1lIHR5cGUgJiBpZC5cbiAgLy9cbiAgLy8gV2hlbiBpZCBpcyB1bmRlZmluZWQsIGl0IGdldHMgZ2VuZXJhdGVkIGFuZCBhIG5ldyBvYmplY3QgZ2V0cyBzYXZlZFxuICAvL1xuICAvLyBleGFtcGxlIHVzYWdlOlxuICAvL1xuICAvLyAgICAgc3RvcmUuc2F2ZSgnY2FyJywgdW5kZWZpbmVkLCB7Y29sb3I6ICdyZWQnfSlcbiAgLy8gICAgIHN0b3JlLnNhdmUoJ2NhcicsICdhYmM0NTY3Jywge2NvbG9yOiAncmVkJ30pXG4gIC8vXG4gIGFwaS5zYXZlID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIC8vIGRvbid0IG1lc3Mgd2l0aCBwYXNzZWQgb2JqZWN0XG4gICAgdmFyIG9iamVjdCA9ICQuZXh0ZW5kKHRydWUsIHt9LCBwcm9wZXJ0aWVzLCB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaWQ6IGlkXG4gICAgfSk7XG5cbiAgICAvLyB2YWxpZGF0aW9uc1xuICAgIHZhciBlcnJvciA9IGFwaS52YWxpZGF0ZShvYmplY3QsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gcmVqZWN0V2l0aChlcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLnNhdmUob2JqZWN0LCBvcHRpb25zIHx8IHt9KSk7XG4gIH07XG5cblxuICAvLyBBZGRcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGAuYWRkYCBpcyBhbiBhbGlhcyBmb3IgYC5zYXZlYCwgd2l0aCB0aGUgZGlmZmVyZW5jZSB0aGF0IHRoZXJlIGlzIG5vIGlkIGFyZ3VtZW50LlxuICAvLyBJbnRlcm5hbGx5IGl0IHNpbXBseSBjYWxscyBgLnNhdmUodHlwZSwgdW5kZWZpbmVkLCBvYmplY3QpLlxuICAvL1xuICBhcGkuYWRkID0gZnVuY3Rpb24gKHR5cGUsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcblxuICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGFwaS5zYXZlKHR5cGUsIHByb3BlcnRpZXMuaWQsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICB9O1xuXG5cbiAgLy8gZmluZFxuICAvLyAtLS0tLS1cblxuICAvL1xuICBhcGkuZmluZCA9IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5maW5kKHR5cGUsIGlkKSk7XG4gIH07XG5cblxuICAvLyBmaW5kIG9yIGFkZFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gMS4gVHJ5IHRvIGZpbmQgYSBzaGFyZSBieSBnaXZlbiBpZFxuICAvLyAyLiBJZiBzaGFyZSBjb3VsZCBiZSBmb3VuZCwgcmV0dXJuIGl0XG4gIC8vIDMuIElmIG5vdCwgYWRkIG9uZSBhbmQgcmV0dXJuIGl0LlxuICAvL1xuICBhcGkuZmluZE9yQWRkID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBwcm9wZXJ0aWVzKSB7XG5cbiAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZU5vdEZvdW5kKCkge1xuICAgICAgdmFyIG5ld1Byb3BlcnRpZXMgPSAkLmV4dGVuZCh0cnVlLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSwgcHJvcGVydGllcyk7XG5cbiAgICAgIHJldHVybiBhcGkuYWRkKHR5cGUsIG5ld1Byb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIHByb21pc2UgZGVjb3JhdGlvbnMgZ2V0IGxvc3Qgd2hlbiBwaXBlZCB0aHJvdWdoIGB0aGVuYCxcbiAgICAvLyB0aGF0J3Mgd2h5IHdlIG5lZWQgdG8gZGVjb3JhdGUgdGhlIGZpbmQncyBwcm9taXNlIGFnYWluLlxuICAgIHZhciBwcm9taXNlID0gYXBpLmZpbmQodHlwZSwgaWQpLnRoZW4obnVsbCwgaGFuZGxlTm90Rm91bmQpO1xuXG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShwcm9taXNlKTtcbiAgfTtcblxuXG4gIC8vIGZpbmRBbGxcbiAgLy8gLS0tLS0tLS0tLS0tXG5cbiAgLy8gcmV0dXJucyBhbGwgb2JqZWN0cyBmcm9tIHN0b3JlLlxuICAvLyBDYW4gYmUgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHR5cGUgb3IgYSBmdW5jdGlvblxuICAvL1xuICBhcGkuZmluZEFsbCA9IGZ1bmN0aW9uICh0eXBlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlY29yYXRlUHJvbWlzZShiYWNrZW5kLmZpbmRBbGwodHlwZSwgb3B0aW9ucykpO1xuICB9O1xuXG5cbiAgLy8gVXBkYXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJbiBjb250cmFzdCB0byBgLnNhdmVgLCB0aGUgYC51cGRhdGVgIG1ldGhvZCBkb2VzIG5vdCByZXBsYWNlIHRoZSBzdG9yZWQgb2JqZWN0LFxuICAvLyBidXQgb25seSBjaGFuZ2VzIHRoZSBwYXNzZWQgYXR0cmlidXRlcyBvZiBhbiBleHN0aW5nIG9iamVjdCwgaWYgaXQgZXhpc3RzXG4gIC8vXG4gIC8vIGJvdGggYSBoYXNoIG9mIGtleS92YWx1ZXMgb3IgYSBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgdGhlIHVwZGF0ZSB0byB0aGUgcGFzc2VkXG4gIC8vIG9iamVjdCBjYW4gYmUgcGFzc2VkLlxuICAvL1xuICAvLyBleGFtcGxlIHVzYWdlXG4gIC8vXG4gIC8vIGhvb2RpZS5zdG9yZS51cGRhdGUoJ2NhcicsICdhYmM0NTY3Jywge3NvbGQ6IHRydWV9KVxuICAvLyBob29kaWUuc3RvcmUudXBkYXRlKCdjYXInLCAnYWJjNDU2NycsIGZ1bmN0aW9uKG9iaikgeyBvYmouc29sZCA9IHRydWUgfSlcbiAgLy9cbiAgYXBpLnVwZGF0ZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCwgb2JqZWN0VXBkYXRlLCBvcHRpb25zKSB7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVGb3VuZChjdXJyZW50T2JqZWN0KSB7XG4gICAgICB2YXIgY2hhbmdlZFByb3BlcnRpZXMsIG5ld09iaiwgdmFsdWU7XG5cbiAgICAgIC8vIG5vcm1hbGl6ZSBpbnB1dFxuICAgICAgbmV3T2JqID0gJC5leHRlbmQodHJ1ZSwge30sIGN1cnJlbnRPYmplY3QpO1xuXG4gICAgICBpZiAodHlwZW9mIG9iamVjdFVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvYmplY3RVcGRhdGUgPSBvYmplY3RVcGRhdGUobmV3T2JqKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFvYmplY3RVcGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVXaXRoKGN1cnJlbnRPYmplY3QpO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBpZiBzb21ldGhpbmcgY2hhbmdlZFxuICAgICAgY2hhbmdlZFByb3BlcnRpZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3RVcGRhdGUpIHtcbiAgICAgICAgICBpZiAob2JqZWN0VXBkYXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gb2JqZWN0VXBkYXRlW2tleV07XG4gICAgICAgICAgICBpZiAoKGN1cnJlbnRPYmplY3Rba2V5XSAhPT0gdmFsdWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHdvcmthcm91bmQgZm9yIHVuZGVmaW5lZCB2YWx1ZXMsIGFzICQuZXh0ZW5kIGlnbm9yZXMgdGhlc2VcbiAgICAgICAgICAgIG5ld09ialtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG5cbiAgICAgIGlmICghKGNoYW5nZWRQcm9wZXJ0aWVzLmxlbmd0aCB8fCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZVdpdGgobmV3T2JqKTtcbiAgICAgIH1cblxuICAgICAgLy9hcHBseSB1cGRhdGVcbiAgICAgIHJldHVybiBhcGkuc2F2ZSh0eXBlLCBpZCwgbmV3T2JqLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBwcm9taXNlIGRlY29yYXRpb25zIGdldCBsb3N0IHdoZW4gcGlwZWQgdGhyb3VnaCBgdGhlbmAsXG4gICAgLy8gdGhhdCdzIHdoeSB3ZSBuZWVkIHRvIGRlY29yYXRlIHRoZSBmaW5kJ3MgcHJvbWlzZSBhZ2Fpbi5cbiAgICB2YXIgcHJvbWlzZSA9IGFwaS5maW5kKHR5cGUsIGlkKS50aGVuKGhhbmRsZUZvdW5kKTtcbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9O1xuXG5cbiAgLy8gdXBkYXRlT3JBZGRcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vIHNhbWUgYXMgYC51cGRhdGUoKWAsIGJ1dCBpbiBjYXNlIHRoZSBvYmplY3QgY2Fubm90IGJlIGZvdW5kLFxuICAvLyBpdCBnZXRzIGNyZWF0ZWRcbiAgLy9cbiAgYXBpLnVwZGF0ZU9yQWRkID0gZnVuY3Rpb24gKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBoYW5kbGVOb3RGb3VuZCgpIHtcbiAgICAgIHZhciBwcm9wZXJ0aWVzID0gJC5leHRlbmQodHJ1ZSwge30sIG9iamVjdFVwZGF0ZSwge2lkOiBpZH0pO1xuICAgICAgcmV0dXJuIGFwaS5hZGQodHlwZSwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBhcGkudXBkYXRlKHR5cGUsIGlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpLnRoZW4obnVsbCwgaGFuZGxlTm90Rm91bmQpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH07XG5cblxuICAvLyB1cGRhdGVBbGxcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyB1cGRhdGUgYWxsIG9iamVjdHMgaW4gdGhlIHN0b3JlLCBjYW4gYmUgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIGZ1bmN0aW9uXG4gIC8vIEFzIGFuIGFsdGVybmF0aXZlLCBhbiBhcnJheSBvZiBvYmplY3RzIGNhbiBiZSBwYXNzZWRcbiAgLy9cbiAgLy8gZXhhbXBsZSB1c2FnZVxuICAvL1xuICAvLyBob29kaWUuc3RvcmUudXBkYXRlQWxsKClcbiAgLy9cbiAgYXBpLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIChmaWx0ZXJPck9iamVjdHMsIG9iamVjdFVwZGF0ZSwgb3B0aW9ucykge1xuICAgIHZhciBwcm9taXNlO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBub3JtYWxpemUgdGhlIGlucHV0OiBtYWtlIHN1cmUgd2UgaGF2ZSBhbGwgb2JqZWN0c1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2UgdHlwZW9mIGZpbHRlck9yT2JqZWN0cyA9PT0gJ3N0cmluZyc6XG4gICAgICBwcm9taXNlID0gYXBpLmZpbmRBbGwoZmlsdGVyT3JPYmplY3RzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgaG9vZGllLmlzUHJvbWlzZShmaWx0ZXJPck9iamVjdHMpOlxuICAgICAgcHJvbWlzZSA9IGZpbHRlck9yT2JqZWN0cztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJC5pc0FycmF5KGZpbHRlck9yT2JqZWN0cyk6XG4gICAgICBwcm9taXNlID0gaG9vZGllLmRlZmVyKCkucmVzb2x2ZShmaWx0ZXJPck9iamVjdHMpLnByb21pc2UoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIGUuZy4gbnVsbCwgdXBkYXRlIGFsbFxuICAgICAgcHJvbWlzZSA9IGFwaS5maW5kQWxsKCk7XG4gICAgfVxuXG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihvYmplY3RzKSB7XG4gICAgICAvLyBub3cgd2UgdXBkYXRlIGFsbCBvYmplY3RzIG9uZSBieSBvbmUgYW5kIHJldHVybiBhIHByb21pc2VcbiAgICAgIC8vIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIGFsbCB1cGRhdGVzIGhhdmUgYmVlbiBmaW5pc2hlZFxuICAgICAgdmFyIG9iamVjdCwgX3VwZGF0ZVByb21pc2VzO1xuXG4gICAgICBpZiAoISQuaXNBcnJheShvYmplY3RzKSkge1xuICAgICAgICBvYmplY3RzID0gW29iamVjdHNdO1xuICAgICAgfVxuXG4gICAgICBfdXBkYXRlUHJvbWlzZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfaSwgX2xlbiwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gb2JqZWN0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIG9iamVjdCA9IG9iamVjdHNbX2ldO1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goYXBpLnVwZGF0ZShvYmplY3QudHlwZSwgb2JqZWN0LmlkLCBvYmplY3RVcGRhdGUsIG9wdGlvbnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KSgpO1xuXG4gICAgICByZXR1cm4gJC53aGVuLmFwcGx5KG51bGwsIF91cGRhdGVQcm9taXNlcyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9O1xuXG5cbiAgLy8gUmVtb3ZlXG4gIC8vIC0tLS0tLS0tLS0tLVxuXG4gIC8vIFJlbW92ZXMgb25lIG9iamVjdCBzcGVjaWZpZWQgYnkgYHR5cGVgIGFuZCBgaWRgLlxuICAvL1xuICAvLyB3aGVuIG9iamVjdCBoYXMgYmVlbiBzeW5jZWQgYmVmb3JlLCBtYXJrIGl0IGFzIGRlbGV0ZWQuXG4gIC8vIE90aGVyd2lzZSByZW1vdmUgaXQgZnJvbSBTdG9yZS5cbiAgLy9cbiAgYXBpLnJlbW92ZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCwgb3B0aW9ucykge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5yZW1vdmUodHlwZSwgaWQsIG9wdGlvbnMgfHwge30pKTtcbiAgfTtcblxuXG4gIC8vIHJlbW92ZUFsbFxuICAvLyAtLS0tLS0tLS0tLVxuXG4gIC8vIERlc3Ryb3llIGFsbCBvYmplY3RzLiBDYW4gYmUgZmlsdGVyZWQgYnkgYSB0eXBlXG4gIC8vXG4gIGFwaS5yZW1vdmVBbGwgPSBmdW5jdGlvbiAodHlwZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UoYmFja2VuZC5yZW1vdmVBbGwodHlwZSwgb3B0aW9ucyB8fCB7fSkpO1xuICB9O1xuXG5cbiAgLy8gZGVjb3JhdGUgcHJvbWlzZXNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIGV4dGVuZCBwcm9taXNlcyByZXR1cm5lZCBieSBzdG9yZS5hcGlcbiAgYXBpLmRlY29yYXRlUHJvbWlzZXMgPSBmdW5jdGlvbiAobWV0aG9kcykge1xuICAgIHJldHVybiB1dGlscy5pbmhlcml0cyhwcm9taXNlQXBpLCBtZXRob2RzKTtcbiAgfTtcblxuICAvLyByZXF1aXJlZCBiYWNrZW5kIG1ldGhvZHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpZiAoIW9wdGlvbnMuYmFja2VuZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucy5iYWNrZW5kIG11c3QgYmUgcGFzc2VkJyk7XG4gIH1cblxuICB2YXIgcmVxdWlyZWQgPSAnc2F2ZSBmaW5kIGZpbmRBbGwgcmVtb3ZlIHJlbW92ZUFsbCcuc3BsaXQoJyAnKTtcblxuICByZXF1aXJlZC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcblxuICAgIGlmICghb3B0aW9ucy5iYWNrZW5kW21ldGhvZE5hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMuYmFja2VuZC4nICsgbWV0aG9kTmFtZSArICcgbXVzdCBiZSBwYXNzZWQuJyk7XG4gICAgfVxuXG4gICAgYmFja2VuZFttZXRob2ROYW1lXSA9IG9wdGlvbnMuYmFja2VuZFttZXRob2ROYW1lXTtcbiAgfSk7XG5cblxuICAvLyBQcml2YXRlXG4gIC8vIC0tLS0tLS0tLVxuXG4gIC8vIC8gbm90IGFsbG93ZWQgZm9yIGlkXG4gIGZ1bmN0aW9uIGlzVmFsaWRJZChrZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgvXlteXFwvXSskLykudGVzdChrZXkgfHwgJycpO1xuICB9XG5cbiAgLy8gLyBub3QgYWxsb3dlZCBmb3IgdHlwZVxuICBmdW5jdGlvbiBpc1ZhbGlkVHlwZShrZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgvXlteXFwvXSskLykudGVzdChrZXkgfHwgJycpO1xuICB9XG5cbiAgLy9cbiAgZnVuY3Rpb24gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpIHtcbiAgICByZXR1cm4gdXRpbHMuaW5oZXJpdHMocHJvbWlzZSwgcHJvbWlzZUFwaSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlV2l0aCgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IGhvb2RpZS5yZXNvbHZlV2l0aC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBkZWNvcmF0ZVByb21pc2UocHJvbWlzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3RXaXRoKCkge1xuICAgIHZhciBwcm9taXNlID0gaG9vZGllLnJlamVjdFdpdGguYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZGVjb3JhdGVQcm9taXNlKHByb21pc2UpO1xuICB9XG5cbiAgcmV0dXJuIGFwaTtcblxufTtcblxuIiwiLyogZXhwb3J0ZWQgaG9vZGllVVVJRCAqL1xuXG4vLyBob29kaWUudXVpZFxuLy8gPT09PT09PT09PT09PVxuXG4vLyB1dWlkcyBjb25zaXN0IG9mIG51bWJlcnMgYW5kIGxvd2VyY2FzZSBsZXR0ZXJzIG9ubHkuXG4vLyBXZSBzdGljayB0byBsb3dlcmNhc2UgbGV0dGVycyB0byBwcmV2ZW50IGNvbmZ1c2lvblxuLy8gYW5kIHRvIHByZXZlbnQgaXNzdWVzIHdpdGggQ291Y2hEQiwgZS5nLiBkYXRhYmFzZVxuLy8gbmFtZXMgZG8gd29ubHkgYWxsb3cgZm9yIGxvd2VyY2FzZSBsZXR0ZXJzLlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICB2YXIgcmFkaXggPSBjaGFycy5sZW5ndGg7XG4gIHZhciBpO1xuICB2YXIgaWQgPSAnJztcblxuICAvLyBkZWZhdWx0IHV1aWQgbGVuZ3RoIHRvIDdcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gNztcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciByYW5kID0gTWF0aC5yYW5kb20oKSAqIHJhZGl4O1xuICAgIHZhciBjaGFyID0gY2hhcnNbTWF0aC5mbG9vcihyYW5kKV07XG4gICAgaWQgKz0gU3RyaW5nKGNoYXIpLmNoYXJBdCgwKTtcbiAgfVxuXG4gIHJldHVybiBpZDtcblxufTtcbiJdfQ==
(3)
});
;