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
