/*global describe: true, it:true, beforeEach: true, afterEach: true, before: true, after: true */
var assert      = require('assert'),
    cachetree   = require('../'),
    MemoryStore = cachetree.MemoryStore;

describe('MemoryStore', function() {

  var store;
  before(function() {
    store = cachetree().store;
  });

  it('should accept a custom delimiter', function() {
    var inst = new MemoryStore({ delimiter: '-' });
    assert.equal(inst.delimiter, '-');
  });

  describe('.get(key, field, cb)', function() {
    
    before(function() {
      store._data['icao'] = {
        alpha: 'dot dash',
        bravo: 'dash dot dot dot',
        charlie: 'dash dot dash dot',
        delta: 'dash dot dot'
      };
    });

    after(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.get(), store);
    });

    it('should return an error if the key is not defined', function(done) {
      store.get(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid key');
        done();
      });
    });

    it('should return a value if a single field is specified', function(done) {
      store.get('icao', 'charlie', function(err, value) {
        assert.ok(!err);
        assert.equal(value, 'dash dot dash dot');
        done();
      });
    });

    it('should accept an array for the key', function(done) {
      store.get(['icao'], 'charlie', function(err, value) {
        assert.ok(!err);
        assert.equal(value, 'dash dot dash dot');
        done();
      });
    });

    it('should return null if a single field is specified but does not exist', function(done) {
      store.get('icao', 'echo', function(err, value) {
        assert.ok(!err);
        assert.equal(value, null);
        done();
      });
    });

    it('should return an object if multiple fields are specified', function(done) {
      store.get('icao', 'charlie', 'alpha', function(err, values) {
        assert.ok(!err);
        assert.deepEqual(values, { charlie: 'dash dot dash dot', alpha: 'dot dash' });
        done();
      });
    });

    it('should return an empty object if multiple fields are specified but do not exist', function(done) {
      store.get('icao', 'echo', 'foxtrot', function(err, values) {
        assert.ok(!err);
        assert.strictEqual(values, Object(values));
        assert.deepEqual(Object.keys(values), ['echo', 'foxtrot']);
        assert.deepEqual(values, { echo: null, foxtrot: null });
        done();
      });
    });

    it('should return an object with all fields if no fields are specified', function(done) {
      store.get('icao', function(err, values) {
        assert.ok(!err);
        assert.notStrictEqual(values, store._data['icao']);
        assert.deepEqual(values, store._data['icao']);
        done();
      });
    });

  });

  describe('.set(key, field, value, cb)', function() {

    beforeEach(function() {
      store._data = {};
    });

    after(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.set(), store);
    });

    it('should return an error if the key is not defined', function(done) {
      store.set(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid key');
        done();
      });
    });

    it('should accept single field and value arguments', function(done) {
      store.set('icao', 'alpha', 'dot dash', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { alpha: 'dot dash' } });
        done();
      });
    });

    it('should accept an array for the key', function(done) {
      store.set(['icao'], 'alpha', 'dot dash', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { alpha: 'dot dash' } });
        done();
      });
    });

    it('should accept multiple field and value arguments', function(done) {
      store.set('icao', 'alpha', 'dot dash', 'bravo', 'dash dot dot dot', 'charlie', 'dash dot dash dot', 'delta', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { alpha: 'dot dash', bravo: 'dash dot dot dot', charlie: 'dash dot dash dot' } });
        done();
      });
    });

    it('should accept an array of field and value arguments', function(done) {
      store.set('icao', ['alpha', 'dot dash', 'bravo', 'dash dot dot dot', 'charlie', 'dash dot dash dot', 'delta'], function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { alpha: 'dot dash', bravo: 'dash dot dot dot', charlie: 'dash dot dash dot' } });
        done();
      });
    });

    it('should accept an object of field and values', function(done) {
      store.set('icao', { alpha: 'dot dash', bravo: 'dash dot dot dot', charlie: 'dash dot dash dot' }, function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { alpha: 'dot dash', bravo: 'dash dot dot dot', charlie: 'dash dot dash dot' } });
        done();
      });
    });

  });

  describe('.keys(pattern, cb)', function() {

    before(function() {
      store._data = {
        icao: {
          alpha: 'dot dash',
          bravo: 'dash dot dot dot'
        },
        'icao:more': {
          charlie: 'dash dot dash dot',
          delta: 'dash dot dot'
        },
        itu: {
          echo: 'dot',
          foxtrot: 'dot dot dash dot'
        },
        'alpha:icao': {
          golf: 'dash dash dot',
          hotel: 'dot dot dot dot'
        }
      };
    });

    after(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.keys(), store);
    });

    it('should return an error if the pattern is not defined', function(done) {
      store.keys(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid pattern');
        done();
      });
    });

    it('should return an error if the pattern is not a string or regular expression', function(done) {
      store.keys({}, function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid pattern');
        done();
      });
    });

    it('should accept a string pattern', function(done) {
      store.keys('ic*', function(err, keys) {
        assert.ok(!err);
        assert.ok(Array.isArray(keys));
        assert.deepEqual(keys, ['icao', 'icao:more']);
        done();
      });
    });

    it('should accept a regular expression pattern', function(done) {
      store.keys(/.*icao.*/i, function(err, keys) {
        assert.ok(!err);
        assert.ok(Array.isArray(keys));
        assert.deepEqual(keys, ['icao', 'icao:more', 'alpha:icao']);
        done();
      });
    });

    it('should return an empty array if pattern is not found', function(done) {
      store.keys('phonetic', function(err, keys) {
        assert.ok(!err);
        assert.ok(Array.isArray(keys));
        assert.equal(keys.length, 0);
        done();
      });
    });

  });

  describe('.exists(key, field, cb)', function() {

    before(function() {
      store._data['icao'] = {
        alpha: 'dot dash',
        bravo: 'dash dot dot dot',
        charlie: 'dash dot dash dot',
        delta: 'dash dot dot'
      };
    });

    after(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.exists(), store);
    });

    it('should return an error if the key is not defined', function(done) {
      store.exists(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid key');
        done();
      });
    });

    it('should return an error if the field is not defined', function(done) {
      store.exists('icao', function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid field');
        done();
      });
    });

    it('should accept an array for the key', function(done) {
      store.exists(['icao'], 'bravo', function(err, exists) {
        assert.ok(!err);
        assert.equal(exists, true);
        done();
      });
    });

    it('should return true if the field exists', function(done) {
      store.exists('icao', 'bravo', function(err, exists) {
        assert.ok(!err);
        assert.equal(exists, true);
        done();
      });
    });

    it('should return false if the field exists', function(done) {
      store.exists('icao', 'foxtrot', function(err, exists) {
        assert.ok(!err);
        assert.equal(exists, false);
        done();
      });
    });

  });

  describe('.del(key, field, cb)', function() {

    beforeEach(function() {
      store._data['icao'] = {
        alpha: 'dot dash',
        bravo: 'dash dot dot dot',
        charlie: 'dash dot dash dot',
        delta: 'dash dot dot'
      };
    });

    afterEach(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.del(), store);
    });

    it('should return an error if the key is not defined', function(done) {
      store.del(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid key');
        done();
      });
    });

    it('should accept a single field', function(done) {
      store.del('icao', 'alpha', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { bravo: 'dash dot dot dot', charlie: 'dash dot dash dot', delta: 'dash dot dot' } });
        done();
      });
    });

    it('should accept an array for the key', function(done) {
      store.del(['icao'], 'alpha', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { bravo: 'dash dot dot dot', charlie: 'dash dot dash dot', delta: 'dash dot dot' } });
        done();
      });
    });

    it('should accept multiple fields', function(done) {
      store.del('icao', 'alpha', 'charlie', 'echo', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { bravo: 'dash dot dot dot', delta: 'dash dot dot' } });
        done();
      });
    });

    it('should accept an array of fields', function(done) {
      store.del('icao', ['alpha', 'charlie', 'alpha'], function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { icao: { bravo: 'dash dot dot dot', delta: 'dash dot dot' } });
        done();
      });
    });

  });

  describe('.flush(key, cb)', function() {

    beforeEach(function() {
      store._data = {
        icao: {
          alpha: 'dot dash',
          bravo: 'dash dot dot dot'
        },
        'icao:more': {
          charlie: 'dash dot dash dot',
          delta: 'dash dot dot'
        },
        itu: {
          echo: 'dot',
          foxtrot: 'dot dot dash dot'
        },
        'alpha:icao': {
          golf: 'dash dash dot',
          hotel: 'dot dot dot dot'
        }
      };
    });

    afterEach(function() {
      store._data = {};
    });

    it('should return self for chaining', function() {
      assert.strictEqual(store.flush(), store);
    });

    it('should return an error if the key is not defined', function(done) {
      store.flush(function(err) {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Invalid key');
        done();
      });
    });

    it('should accept a single field', function(done) {
      store.flush('icao', 'alpha', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { 'icao:more': { charlie: 'dash dot dash dot', delta: 'dash dot dot' }, itu: { echo: 'dot', foxtrot: 'dot dot dash dot' }, 'alpha:icao': { golf: 'dash dash dot', hotel: 'dot dot dot dot' } });
        done();
      });
    });

    it('should accept an array for they key', function(done) {
      store.flush(['icao'], 'alpha', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { 'icao:more': { charlie: 'dash dot dash dot', delta: 'dash dot dot' }, itu: { echo: 'dot', foxtrot: 'dot dot dash dot' }, 'alpha:icao': { golf: 'dash dash dot', hotel: 'dot dot dot dot' } });
        done();
      });
    });

    it('should accept multiple fields', function(done) {
      store.flush('icao', 'icao:more', 'echo', function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { itu: { echo: 'dot', foxtrot: 'dot dot dash dot' }, 'alpha:icao': { golf: 'dash dash dot', hotel: 'dot dot dot dot' } });
        done();
      });
    });

    it('should accept an array of fields', function(done) {
      store.flush(['icao', 'icao:more', 'icao'], function(err) {
        assert.ok(!err);
        assert.deepEqual(store._data, { itu: { echo: 'dot', foxtrot: 'dot dot dash dot' }, 'alpha:icao': { golf: 'dash dash dot', hotel: 'dot dot dot dot' } });
        done();
      });
    });

  });

  describe('.cacheKey(key)', function() {
    
    it('should return an array concatenated with delimiter', function() {
      assert.equal(store.cacheKey(['alpha', 'bravo']), 'alpha:bravo');
      var inst = new MemoryStore({ delimiter: '-' });
      assert.equal(inst.cacheKey(['alpha', 'bravo']), 'alpha-bravo');
    });

    it('should return the value if a string or number', function() {
      assert.equal(store.cacheKey(['alpha', 'bravo']), 'alpha:bravo');
      assert.equal(store.cacheKey(1234), 1234);
    });

  });

});
