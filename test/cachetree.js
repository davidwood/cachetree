/*global describe: true, it:true, beforeEach: true, afterEach: true, before: true, after: true */
var assert    = require('assert'),
    cachetree = require('../'),
    noop      = function() {};

describe('cachetree(store, options)', function() {

  it('should not require arguments', function() {
    var cache = cachetree();
    assert.equal(typeof cache, 'object');
    assert.equal(typeof cache.store, 'object');
    assert.equal(cache.prefix, 'cache');
    assert.equal(cache.delimiter, ':');
    assert.equal(cache.useProperties, false);
  });

  it('should accept a store instance', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store);
    assert.strictEqual(cache2.store, cache1.store);
  });

  it('should accept an options hash', function() {
    var cache = cachetree({ prefix: 'test', delimiter: '-', useProperties: true });
    assert.equal(cache.prefix, 'test');
    assert.equal(cache.delimiter, '-');
    assert.equal(cache.useProperties, true);
  });

  it('should only set options if the correct type', function() {
    var cache = cachetree({ prefix: 1234, delimiter: 0, useProperties: 'y' });
    assert.equal(cache.prefix, 'cache');
    assert.equal(cache.delimiter, ':');
    assert.equal(cache.useProperties, false);
  });

  it('should accept a store instance and an options hash', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store, { prefix: 'test', delimiter: '-', useProperties: true });
    assert.strictEqual(cache2.store, cache1.store);
    assert.equal(cache2.prefix, 'test');
    assert.equal(cache2.delimiter, '-');
    assert.equal(cache2.useProperties, true);
  });

});
