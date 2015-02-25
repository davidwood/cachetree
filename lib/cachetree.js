/**
 * Module imports
 */
var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Hash = require('./hash'),
    MemoryStore = require('./memorystore');

/**
 * Array.prototype.slice reference
 */
var slice = Array.prototype.slice;

/**
 * Constructor
 *
 * @constructor
 * @param   {Object}        store     Store instance
 * @param   {String|Number} key       Root cache key
 * @param   {Object}        options   Options hash
 */
function Cachetree() {
  var self = this,
      args = slice.call(arguments),
      store = null,
      key = 'cache',
      options = { useProperties: false },
      arg,
      type;
  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    type = typeof arg;
    if (isStore(arg)) {
      if (i === 0) {
        store = arg;
      }
    } else if ((type === 'string' && arg) || type === 'number') {
      if (i <= 1) {
        key = arg;
      }
    } else if (arg === Object(arg)) {
      if (i <= 2) {
        Object.keys(arg).forEach(function(val) {
          if (val in options && typeof arg[val] === typeof options[val]) {
            options[val] = arg[val];
          }
        });
        break;
      }
    }
  }
  if (!store) {
    store = new MemoryStore();
  }
  Object.defineProperty(this, 'store', {
    value: store,
    writable: false
  });
  Object.keys(options).forEach(function(val) {
    Object.defineProperty(this, val, {
      value: options[val],
      writable: false
    });
  }, this);
  Hash.call(this, key);
  if (store instanceof EventEmitter) {
    ['ready', 'connect', 'end'].forEach(function(name) {
      store.on(name, function() {
        self.emit(name);
      });
    });
    store.on('error', function(error) {
      self.emit('error', error);
    });
  }
}
util.inherits(Cachetree, Hash);

/**
 * Export a factory
 *
 * @param   {Object}  store     Store instance
 * @param   {Object}  options   Options hash
 */
module.exports = function(key, store, options) {
  return new Cachetree(key, store, options);
};

/**
 * Export the MemoryStore
 */
module.exports.MemoryStore = MemoryStore;

/**
 * Check if an object conforms to the store interface
 *
 * @param   {Object}  store     Object to validate
 * @return  {Boolean} true if the object is a store
 */
var isStore = module.exports.isStore = function(store) {
  if (store) {
    return ['get', 'set', 'keys', 'exists', 'del', 'flush', 'fields'].every(function(name) {
      return typeof store[name] === 'function';
    });
  }
  return false;
};
