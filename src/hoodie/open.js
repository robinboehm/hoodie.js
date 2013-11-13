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

