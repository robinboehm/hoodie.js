// Hoodie Core
// -------------
//
// the door to world domination (apps)
//
/* globals Hoodie:true, open:true */

var promises = require('./hoodie/promises');
var connection = require('./hoodie/connection');
var config = require('./hoodie/config');
//var events = require('./hoodie/events')(Hoodie);
var request = require('./hoodie/request');
var account = require('./hoodie/account');
var dispose = require('./hoodie/utils/dispose');
var uuid = require('./hoodie/utils/uuid');
var open = require('./hoodie/open');
var store = require('./hoodie/store');
var task = require('./hoodie/task');
var account = require('./hoodie/account');
var remote = require('./hoodie/remote_store');

var Hoodie = {
  //events: events,
  promises: promises,
  connection: connection,
  account: account,
  store: store,
  task: task,
  remote: remote,
  config: config,
  //bind: events.bind,
  //on: events.on,
  //one: events.one,
  //trigger: events.trigger,
  //unbind: events.unbind,
  //off: events.off,
  defer: promises.defer,
  isPromise : promises.isPromise,
  resolve: promises.resolve,
  reject: promises.reject,
  resolveWith: promises.resolveWith,
  request: request,
  isOnline: connection.isOnline,
  checkConnection: connection.checkConnection,
  checkPasswordReset: account.checkPasswordReset,
  UUID: uuid,
  dispose: dispose,
  open: open,
  __internals: function () {

    // clear config on sign out
    Hoodie.events.on('account:signout', config.clear);

    // authenticate
    // we use a closure to not pass the username to connect, as it
    // would set the name of the remote store, which is not the username.
    Hoodie.account.authenticate().then(function( /*[> username <]*/ ) {
      Hoodie.remote.connect();
    });

    // check connection when browser goes online / offline
    global.addEventListener('online', Hoodie.checkConnection, false);
    global.addEventListener('offline', Hoodie.checkConnection, false);

    Hoodie.checkConnection();

  },

  baseUrl: function (url) {
    console.log(url);
    //this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

};

Hoodie.version = require('../package.json').version;

module.exports = Hoodie;

