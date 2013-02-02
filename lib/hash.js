/**
 * Array.prototype.slice reference
 */
var slice = Array.prototype.slice;

/**
 * Export hash
 */
module.exports = Hash;

/**
 * Constructor
 *
 * @param {Stirng}      key   Hash key
 * @param {Cachetree}   root  Root Cachetree instance (null if top node)
 */
function Hash(key, root) {
  var type = typeof key,
      len = 0;
  if ((type === 'string' && key) || type === 'number') {
    key = [key];
  } else if (Array.isArray(key)) {
    key = slice.call(key);
  }
  if (Array.isArray(key)) len = key.length;
  if (!(!root && len === 1) && !(root && len > 1)) throw new Error('Invalid key');
  if (!root) root = this;
  // Define properties
  Object.defineProperties(this, {
    key: {
      value: key,
      writable: false
    },
    root: {
      value: root,
      writable: false
    }
  });
}

/**
 * Execute a store function that takes variable arguments
 *
 * @param   {String}  name  Function name to execute
 * @param   {Array}   args  Arguments array
 * @return  {this}    for chaining
 */
Hash.prototype._exec = function(name, args) {
  args = slice.call(args);
  var len = args.length,
      cb;
  if (len > 0 && typeof args[len - 1] === 'function') cb = args.pop();
  this.root.store[name](this.key, args, cb);
  return this;
};

/**
 * Get the values of all the given hash fields
 *
 * @param   {...String} field   Hash field(s) or omit for all
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
Hash.prototype.get = function() {
  return this._exec('get', arguments);
};

/**
 * Set the values of given hash fields
 *
 * @param   {String|Object} field   Hash field or object
 * @param   {Object}        value   Value (if field is not object)
 * @param   {Function}      cb      Callback function
 * @return  {this}          for chaining
 */
Hash.prototype.set = function() {
  return this._exec('set', arguments);
};

/**
 * Determine if a hash field exists
 *
 * @param   {String}    field   Hash field
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
Hash.prototype.exists = function(field, cb) {
  if (typeof field === 'function') {
    cb = field;
    field = null;
  }
  this.root.store.exists(this.key, field, cb);
  return this;
};

/**
 * Delete given hash fields
 *
 * @param   {...String} field   Hash field(s)
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
Hash.prototype.del = function() {
  return this._exec('del', arguments);
};

/**
 * Clear the hash and all descendent hashes
 *
 * @param   {Function}  cb    Callback function
 * @return  {this} for chaining
 */
Hash.prototype.flush = function(cb) {
  var self = this;
  this.root.store.exists(this.childKey('*'), function(err, keys) {
    if (!Array.isArray(keys)) keys = [];
    keys.unshift(this.key);
    self.root.store.flush(keys, cb);
  });
  return this;
};

/**
 * Add child node(s)
 *
 * @param   {String|Object} name  Child node name or object
 * @param   {Object}        def   Child definition (if name is string)
 * @return  {this}          for chaining
 */
Hash.prototype.add = function(name, def) {
  var type = typeof name;
  if (type === 'string' || type === 'number') {
    this._add(name, def);
  } else if (name === Object(name)) {
    Object.keys(name).forEach(function(val) {
      this._add(val, name[val]);
    }, this);
  }
  return this;
};

/**
 * Add a child
 *
 * @param   {String}  name    Child name
 * @param   {Object}  def     Child definition
 * @return  {this}    for chaining
 */
Hash.prototype._add = function(name, def) {
  var self = this,
      type = typeof def,
      validateFn = false,
      children = [],
      create = function(key) {
        var hash = new Hash(self.childKey(key), self.root);
        children.forEach(function(val) {
          hash.add(val, def[val]);
        });
        return hash;
      };
  if (name && !this[name]) {
    // Validate the child definitiom
    if ((type === 'string' && def) || type === 'number') {
      def = { __key__: def };
    } else if (type === 'function' || def instanceof RegExp) {
      def = { __validate__: def };
    }
    // Extract child names
    if (!def) def = {};
    children = Object.keys(def).filter(function(value) {
      return value !== '__key__' && value !== '__validate__';
    });
    // Add the child
    if (def.__key__) {
      if (this.root.useProperties === true) {
        Object.defineProperty(this, name, {
          get: function() {
            return create(def.__key__);
          }
        });
      } else {
        this[name] = function() {
          return create(def.__key__);
        };
      }
    } else {
      if (def.__validate__ && typeof def.__validate__ === 'function') validateFn = true;
      this[name] = function(value) {
        var isValid = false,
            type = typeof value,
            hash;
        if (type === 'string' || type === 'number') {
          if (def.__validate__) {
            if (validateFn) {
              isValid = def.__validate__(value);
            } else {
              isValid = def.__validate__.test(value);
            }
          } else {
            if ((type === 'string' && value) || type === 'number') {
              isValid = true;
            }
          }
        }
        if (isValid !== true) throw new Error('Invalid key');
        return create(value);
      };
    }
  }
  return this;
};

/**
 * Generate a child key
 *
 * @param   {String|Number} key   Child key
 * @return  {Array}         Child key array
 */
Hash.prototype.childKey = function(key) {
  var type = typeof key,
      childKey;
  if ((type === 'string' && key) || type === 'number') {
    childKey = slice.call(this.key);
    childKey.push(key);
    return childKey;
  }
};
