/*global describe: true, it:true, beforeEach: true, afterEach: true, before: true, after: true */
var assert    = require('assert'),
    cachetree = require('../'),
    noop      = function() {};

describe('cachetree(store, options)', function() {

  it('should not require arguments', function() {
    var cache = cachetree();
    assert.equal(typeof cache, 'object');
    assert.equal(typeof cache.store, 'object');
    assert.deepEqual(cache.key, ['cache']);
    assert.equal(cache.useProperties, false);
  });

  it('should accept a store instance', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store);
    assert.strictEqual(cache2.store, cache1.store);
  });

  it('should accept a string cache key', function() {
    var cache = cachetree('test');
    assert.deepEqual(cache.key, ['test']);
  });

  it('should accept a numeric cache key', function() {
    var cache = cachetree(1234);
    assert.deepEqual(cache.key, [1234]);
  });

  it('should accept an options hash', function() {
    var cache = cachetree({ useProperties: true });
    assert.deepEqual(cache.key, ['cache']);
    assert.equal(cache.useProperties, true);
  });

  it('should only set options if the correct type', function() {
    var cache = cachetree({ useProperties: 'y' });
    assert.equal(cache.useProperties, false);
  });

  it('should accept a store instance and a key', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store, 'test');
    assert.strictEqual(cache2.store, cache1.store);
    assert.deepEqual(cache2.key, ['test']);
    assert.equal(cache2.useProperties, false);
  });

  it('should accept a store instance and an options hash', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store, { useProperties: true });
    assert.strictEqual(cache2.store, cache1.store);
    assert.deepEqual(cache2.key, ['cache']);
    assert.equal(cache2.useProperties, true);
  });

  it('should accept a key and an options hash', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(1234, { useProperties: true });
    assert.notStrictEqual(cache2.store, cache1.store);
    assert.deepEqual(cache2.key, [1234]);
    assert.equal(cache2.useProperties, true);
  });

  it('should accept a store instance, key and an options hash', function() {
    var cache1 = cachetree(),
        cache2 = cachetree(cache1.store, 1234, { useProperties: true });
    assert.strictEqual(cache2.store, cache1.store);
    assert.deepEqual(cache2.key, [1234]);
    assert.equal(cache2.useProperties, true);
  });

  it('should extend from hash', function() {
    var cache = cachetree();
    assert.equal(typeof cache.get, 'function');
    assert.equal(typeof cache.set, 'function');
    assert.equal(typeof cache.del, 'function');
    assert.equal(typeof cache.flush, 'function');
    assert.equal(typeof cache.add, 'function');
    assert.equal(typeof cache.childKey, 'function');
  });

});
