/*global describe: true, it:true, beforeEach: true, afterEach: true, before: true, after: true */
var assert    = require('assert'),
    cachetree = require('../'),
    noop      = function() {};

describe('Cachetree', function() {

  describe('.isStore(store)', function() {

    it('should return true if an object implements the store interface', function() {
      var obj = { get: noop, set: noop, keys: noop, exists: noop, del: noop, flush: noop };
      assert.equal(cachetree.isStore(obj), true);
    });

    it('should return false if an object does not implement the store interface', function() {
      var obj = { set: noop, keys: noop, exists: noop, del: noop, flush: noop };
      assert.equal(cachetree.isStore(obj), false);
    });

    it('should return false if an object is not provided', function() {
      assert.equal(cachetree.isStore(), false);
    });

  });

});
