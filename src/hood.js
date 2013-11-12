// Hoodie Core
// -------------
//
// the door to world domination (apps)
//

//var task = require('./hoodie/task');
//var config = require('./hoodie/config');
//var account = require('./hoodie/account');
//var remote = require('./hoodie/remote_store');
//var account = require('./hoodie/account');


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
  var request = require('./hoodie/request');
  var connection = require('./hoodie/connection');
  var UUID = require('./hoodie/uuid');
  var dispose = require('./hoodie/dispose');
  //var open = require('./hoodie/open')();
  var store = require('./hoodie/store')(self);

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
  self.request = request;


  // * hoodie.isOnline
  // * hoodie.checkConnection
  self.isOnline = connection.isOnline;
  self.checkConnection = connection.checkConnection;


  // * hoodie.uuid
  self.UUID = UUID;


  // * hoodie.dispose
  self.dispose = dispose;


  // * hoodie.open
  //self.open = open;


  // * hoodie.store
  //self.store = store;
};

