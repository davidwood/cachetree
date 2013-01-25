/**
 * Module imports
 */
var util        = require('util'),
    MemoryStore = require('./memorystore');

/**
 * Array.prototype.slice reference
 */
var slice = Array.prototype.slice;

/**
 * Export a factory
 *
 * @param   {Object}  store     Store instance
 * @param   {Object}  options   Options hash
 */
module.exports = function(store, options) {
  return new Cachetree(store, options);
};

/**
 * Check if an object conforms to the store interface
 *
 * @param   {Object}  store     Object to validate
 * @return  {Boolean} true if the object is a store
 */
var isStore = module.exports.isStore = function(store) {
  if (store) {
    return ['get', 'set', 'keys', 'exists', 'del', 'flush'].every(function(name) {
      return typeof store[name] === 'function';
    });
  }
  return false;
};

/**
 * Constructor
 *
 * @constructor
 * @param   {Object}  store     Store instance
 * @param   {Object}  options   Options hash
 */
function Cachetree() {
  var args = slice.call(arguments),
      options = { prefix: 'cache', delimiter: ':', useProperties: false },
      store = null,
      opts;
  if (args.length > 0 && isStore(args[0])) store = args.shift();
  // Initialize the store
  if (!store) store = new MemoryStore();
  Object.defineProperty(this, 'store', {
    get: function() { return store; }
  });
  // Initialize the options
  opts = args.shift();
  if (opts === Object(opts)) {
    Object.keys(opts).forEach(function(key) {
      if (key in options && typeof opts[key] === typeof options[key]) {
        options[key] = opts[key];
      }
    });
  }
  Object.keys(options).forEach(function(key) {
    Object.defineProperty(this, key, {
      value: options[key],
      writable: false
    });
  }, this);
}

