/* exported hoodieConnection */

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

