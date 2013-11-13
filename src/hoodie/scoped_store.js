
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
