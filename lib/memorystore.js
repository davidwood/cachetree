/**
 * Array.prototype.slice reference
 */
var slice = Array.prototype.slice;

/**
 * Constructor
 *
 * @param {Object}  options Optional options object
 */
function MemoryStore(options) {
  if (!(this instanceof MemoryStore)) {
    return new MemoryStore(options);
  }
  var type,
      delimiter = ':';
  this._data = {};
  if (!options) {
    options = {};
  }
  // Set the delimiter property
  type = typeof options.delimiter;
  if ((type === 'string' && options.delimiter) || type === 'number') {
    delimiter = options.delimiter;
  }
  Object.defineProperty(this, 'delimiter', {
    value: delimiter,
    writable: false
  });
}

/**
 * Export MemoryStore
 */
module.exports = MemoryStore;

/**
 * Get the values of all the given hash fields
 *
 * @param   {String}    key         Hash key
 * @param   {Boolean}   [asBuffer]  true if return data as a Buffer
 * @param   {...String} field       Hash field(s) or omit for all
 * @param   {Function}  cb          Callback function
 * @return  {this}      for chaining
 */
MemoryStore.prototype.get = function() {
  var args = slice.call(arguments),
      cb = args.pop(),
      key = this.cacheKey(args.shift()),
      len = args.length,
      obj,
      data;
  if (typeof cb !== 'function') {
    return this;
  }
  if (key) {
    // Extract the values
    obj = {};
    data = this._data[key];
    if (data) {
      // Unwrap the fist argument
      if (len === 1 && Array.isArray(args[0])) {
        args = args[0];
        len = args.length;
      }
      // Dispose of buffer flag, since not supported in this store
      if (len && args[0] === true) {
        args.shift();
        len = len - 1;
      }
      if (len === 1) {
        cb(null, data[args[0]]);
      } else {
        if (len === 0) {
          args = Object.keys(data);
        }
        args.forEach(function(field) {
          obj[field] = data[field];
          if (obj[field] === undefined) {
            obj[field] = null;
          }
        });
        cb(null, obj);
      }
    }
  } else {
    cb(new Error('Invalid key'));
  }
  return this;
};

/**
 * Set the values of given hash fields
 *
 * @param   {String}        key     Hash key
 * @param   {String|Object} field   Hash field or object
 * @param   {Object}        value   Value (if field is not object)
 * @param   {Function}      cb      Callback function
 * @return  {this}          for chaining
 */
MemoryStore.prototype.set = function() {
  var args = slice.call(arguments),
      cb = args.pop(),
      key = this.cacheKey(args.shift()),
      err = null,
      len,
      field;
  if (typeof cb !== 'function') {
    args.push(cb);
    cb = null;
  }
  len = args.length;
  if (key) {
    if (!this._data[key]) {
      this._data[key] = {};
    }
    // Unwrap the first argument if its an array
    if (len === 1 && Array.isArray(args[0])) {
      args = args[0];
      len = args.length;
    }
    if (len === 1) {
      if (args[0] === Object(args[0])) {
        // Iterate over the object and add
        Object.keys(args[0]).forEach(function(field) {
          this._data[key][field] = args[0][field];
        }, this);
      } else {
        err = new Error('Invalid data');
      }
    } else if (len === 2) {
      field = args[0];
      this._data[key][field] = args[1];
    } else if (len > 2) {
      // Array of field and values, iterate and update
      for (var i = 0; i < len; i += 2) {
        if (i + 1 < len) {
          field = args[i];
          this._data[key][field] = args[i + 1];
        }
      }
    } else {
      err = new Error('Invalid data');
    }
  } else {
    err = new Error('Invalid key');
  }
  if (typeof cb === 'function') {
    cb(err);
  }
  return this;
};

/**
 * Find all keys matching a given pattern
 *
 * @param   {String|RegExp} pattern   Key pattern
 * @param   {Function}      cb        Callback function
 * @return  {this}          for chaining
 */
MemoryStore.prototype.keys = function(pattern, cb) {
  if (typeof pattern === 'function') {
    pattern(new Error('Invalid pattern'));
    return this;
  }
  if (typeof cb !== 'function') {
    return this;
  }
  if (Array.isArray(pattern)) {
    pattern = this.cacheKey(pattern);
  }
  var re,
      source,
      matches;
  if (typeof pattern === 'string') {
    source = pattern.replace(/\*/g, '.*').replace(/\?/g, '.{1,1}');
  } else if (pattern instanceof RegExp) {
    source = pattern.source;
  }
  if (source) {
    if (source.substring(0, 1) !== '^') {
      source = '^' + source;
    }
    if (source.substr(-1) !== '$') {
      source += '$';
    }
    re = new RegExp(source, 'i');
    matches = Object.keys(this._data).filter(function(key) {
      return re.test(key);
    });
    cb(null, matches);
  } else {
    cb(new Error('Invalid pattern'));
  }
  return this;
};

/**
 * Determine if a hash field exists
 *
 * @param   {String}    key     Hash key
 * @param   {String}    field   Hash field
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
MemoryStore.prototype.exists = function(key, field, cb) {
  if (typeof key === 'function') {
    key(new Error('Invalid key'));
  } else if (typeof field === 'function') {
    field(new Error('Invalid field'));
  }
  if (typeof cb !== 'function') {
    return this;
  }
  key = this.cacheKey(key);
  if (!key) {
    return cb(new Error('Invalid key'));
  }
  var exists = this._data[key] && this._data[key][field] !== undefined;
  cb(null, exists);
  return this;
};

/**
 * Delete given hash fields
 *
 * @param   {String}    key     Hash key
 * @param   {...String} field   Hash field(s)
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
MemoryStore.prototype.del = function() {
  var args = slice.call(arguments),
      cb = args.pop(),
      key = this.cacheKey(args.shift()),
      err = null,
      len,
      obj;
  if (typeof cb !== 'function') {
    args.push(cb);
    cb = null;
  }
  len = args.length;
  if (key) {
    obj = this._data[key];
    if (obj && len > 0) {
      if (len === 1 && Array.isArray(args[0])) {
        args = args[0];
      }
      args.forEach(function(field) {
        if (field in obj) {
          delete obj[field];
        }
      }, this);
    }
  } else {
    err = new Error('Invalid key');
  }
  if (typeof cb === 'function') {
    cb(err);
  }
  return this;
};

/**
 * Clear the provided keys
 *
 * @param   {String}    key     Hash key
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
MemoryStore.prototype.flush = function() {
  var args = slice.call(arguments),
      len = args.length,
      err = null,
      cb;
  if (len > 0 && typeof args[len - 1] === 'function') {
    cb = args.pop();
    len -= 1;
  }
  if (len === 1 && Array.isArray(args[0])) {
    args = args[0];
    len = args.length;
  }
  if (len > 0) {
    args.forEach(function(key) {
      key = this.cacheKey(key);
      if (key && key in this._data) {
        delete this._data[key];
      }
    }, this);
  } else {
    err = new Error('Invalid key');
  }
  if (typeof cb === 'function') {
    cb(err);
  }
  return this;
};

/**
 * Generate a cache key
 *
 * @param   {Array|String}  key   Cache key array
 * @return  {String}        cache key
 */
MemoryStore.prototype.cacheKey = function(key) {
  var type;
  if (Array.isArray(key) && key.length > 0) {
    return key.join(this.delimiter);
  }
  type = typeof key;
  if ((type === 'string' && key) || (type === 'number')) {
    return key;
  }
};

/**
 * Return a list of field keys
 *
 * @param   {String}    key     Hash key
 * @param   {Function}  cb      Callback function
 * @return  {this}      for chaining
 */
MemoryStore.prototype.fields = function(key, cb) {
  if (typeof key === 'function') {
    key(new Error('Invalid key'));
  }
  if (typeof cb !== 'function') {
    return this;
  }
  key = this.cacheKey(key);
  if (!key) {
    return cb(new Error('Invalid key'));
  }
  if (this._data[key]) {
    cb(null, Object.keys(this._data[key]));
  } else {
    cb(null, []);
  }
  return this;
};


