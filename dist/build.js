(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    }
    else if(typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else {
        root.Hoodie = factory(root.jquery);
    }
}(this, function(jquery) {
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global open:true */
/* exported Hoodie */

// Hoodie Core
// -------------
//
// the door to world domination (apps)
//
//
var events = require('./hoodie/events');
//var promises = require('./hoodie/promises');
//var request = require('./hoodie/request');
//var connection = require('./hoodie/connection');
//var UUID = require('./hoodie/uuid');
//var dispose = require('./hoodie/dispose');
//var open = require('./hoodie/open');
//var store = require('./hoodie/store');
//var task = require('./hoodie/task');
//var config = require('./hoodie/config');
//var account = require('./hoodie/account');
//var remote = require('./hoodie/remote_store');
//var account = require('./hoodie/account');

// Constructor
// -------------

// When initializing a hoodie instance, an optional URL
// can be passed. That's the URL of the hoodie backend.
// If no URL passed it defaults to the current domain.
//
//     // init a new hoodie instance
//     hoodie = new Hoodie
//

var Hoodie = function (baseUrl) {
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
  //this.defer = promises.defer;
  //this.isPromise = promises.isPromise;
  //this.resolve = promises.resolve;
  //this.reject = promises.reject;
  //this.resolveWith = promises.resolveWith;


  //// * hoodie.request
  //this.request = request;

  //// * hoodie.isOnline
  //// * hoodie.checkConnection
  //this.isOnline = connection.isOnline;
  //this.checkConnection = connection.checkConnection;

  //// * hoodie.uuid
  //this.UUID = UUID;

  //// * hoodie.dispose
  //this.dispose = dispose;

  //// * hoodie.open
  //this.open = open;

  //// * hoodie.store
  //this.store = store;

  //// * hoodie.task
  //this.task = task;

  //// * hoodie.config
  //this.config = config;

  //// * hoodie.account
  //this.account = account;

  //// * hoodie.remote
  //this.remote = remote;


  ////
  //// Initializations
  ////

  //// set username from config (local store)
  //this.account.username = config.get('_account.username');

  //// check for pending password reset
  //this.account.checkPasswordReset();

  //// clear config on sign out
  //events.on('account:signout', config.clear);

  //// hoodie.store
  //this.store.patchIfNotPersistant();
  //this.store.subscribeToOutsideEvents();
  //this.store.bootstrapDirtyObjects();

  //// hoodie.remote
  //this.remote.subscribeToEvents();

  //// hoodie.task
  //this.task.subscribeToStoreEvents();

  //// authenticate
  //// we use a closure to not pass the username to connect, as it
  //// would set the name of the remote store, which is not the username.
  //this.account.authenticate().then(function( [> username <] ) {
    //remote.connect();
  //});

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

},{"./hoodie/events":2}],2:[function(require,module,exports){
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
var hoodie = require('../hoodie');

module.exports = function (options) {
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


},{"../hoodie":1}]},{},[1])
;
    return global.Hoodie;
}));
