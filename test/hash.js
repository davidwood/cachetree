/*global describe: true, it:true, beforeEach: true, afterEach: true, before: true, after: true */
var assert    = require('assert'),
    cachetree = require('../'),
    noop      = function() {};

/**
 * Validate an object as a hash
 *
 * @param   {Object}  obj Object to validate
 */
function isHash(obj, key) {
  assert.ok(obj);
  assert.equal(typeof obj.get, 'function');
  assert.equal(typeof obj.set, 'function');
  assert.equal(typeof obj.del, 'function');
  assert.equal(typeof obj.flush, 'function');
  assert.equal(typeof obj.add, 'function');
  assert.equal(typeof obj.childKey, 'function');
  if (Array.isArray(key)) {
    assert.deepEqual(obj.key, key);
  }
}

describe('hash', function() {

  describe('childKey(key)', function() {
    
    var cache;
    before(function() {
      cache = cachetree();
    });

    it('should accept a string', function() {
      var keys = cache.childKey('test');
      assert.ok(Array.isArray(keys));
      assert.deepEqual(keys, ['cache', 'test']);
    });

    it('should accept a number', function() {
      var keys = cache.childKey(1234);
      assert.ok(Array.isArray(keys));
      assert.deepEqual(keys, ['cache', 1234]);
    });

    it('should undefined if the child key is invalid', function() {
      var keys = cache.childKey();
      assert.equal(keys, undefined);
    });

  });

  describe('.add(name, def)', function() {
    
    it('should accept a name as a string', function() {
      var cache = cachetree();
      cache.add('test');
      assert.equal(typeof cache.test, 'function');
      isHash(cache.test('alpha'), ['cache', 'alpha']);
    });
    
    it('should accept a name as a number', function() {
      var cache = cachetree();
      cache.add('test');
      assert.equal(typeof cache.test, 'function');
      isHash(cache.test(1234, ['cache', 1234]));
    });

    it('should accept a name and explicit key', function() {
      var cache = cachetree();
      cache.add('alpha', 'bravo');
      isHash(cache.alpha(), ['cache', 'bravo']);
    });

    it('should accept a name and definition object with key', function() {
      var cache = cachetree();
      cache.add('alpha', { __key__: 'bravo' });
      isHash(cache.alpha(), ['cache', 'bravo']);
    });

    it('should accept an object', function() {
      var cache = cachetree();
      cache.add({ alpha: { __key__: 'bravo' }, charlie: 'delta' });
      isHash(cache.alpha(), ['cache', 'bravo']);
      isHash(cache.charlie(), ['cache', 'delta']);
    });

    it('should create an accessor function if useProperties option is false', function() {
      var cache = cachetree();
      cache.add('test');
      assert.equal(typeof cache.test, 'function');
    });

    it('should create an accessor property if useProperties option is true and key is explicit', function() {
      var cache = cachetree({ useProperties: true });
      cache.add('alpha', 'bravo');
      assert.ok(cache.hasOwnProperty('alpha'));
      isHash(cache.alpha, ['cache', 'bravo']);
    });

    it('should throw an error if the key is not explicit or provided', function() {
      var cache = cachetree(),
          err;
      cache.add('phonetic');
      assert.equal(typeof cache.phonetic, 'function');
      try {
        hash = cache.phonetic();
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
    });

    it('should accept a validation function and throw an error if the function does not return true', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', function(val) { return val === 'bravo'; });
      try {
        cache.alpha('charlie');
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      hash = cache.alpha('bravo');
      isHash(hash);
    });

    it('should accept a validation regular expression and throw an error if the test does not return true', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', /^br.*$/i);
      try {
        cache.alpha('charlie');
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      hash = cache.alpha('bravo');
      isHash(hash);
    });

    it('should accept an object with a validation function and throw an error if the function does not return true', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', { __validate__: function(val) { return val === 'bravo'; } });
      try {
        cache.alpha('charlie');
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      hash = cache.alpha('bravo');
      isHash(hash);
    });

    it('should accept an object with a validation regular expression and throw an error if the test does not return true', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', { __validate__: /^br.*$/i });
      try {
        cache.alpha('charlie');
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      hash = cache.alpha('bravo');
      isHash(hash);
    });

    it('should accept an object with a key prefix as a string', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', { __prefix__: 'bravo-' });
      hash = cache.alpha('charlie');
      isHash(hash, ['cache', 'bravo-charlie']);
    });

    it('should accept an object with a key prefix as a number', function() {
      var cache = cachetree(),
          hash,
          err;
      cache.add('alpha', { __prefix__: 123 });
      hash = cache.alpha('charlie');
      assert.deepEqual(hash.key, ['cache', '123charlie']);
    });

    it('should create a child hash that can be extended', function() {
      var cache = cachetree(),
          hash;
      cache.add('alpha');
      hash = cache.alpha('bravo').add('charlie', 'delta');
      isHash(hash.charlie(), ['cache', 'bravo', 'delta']);
    });

    it('should accept and object and recursively create children', function() {
      var cache = cachetree(),
          err;
      cache.add({
        alpha: {
          __key__: 'alpha',
          bravo: {
            charlie: {}
          },
          delta: {
            __validate__: function(val) { return val === 'foxtrot'; },
            echo: 'echo'
          }
        },
        golf: {
          __key__: 'golf',
          bravo: /^hotel$/i
        }
      });
      isHash(cache.alpha(), ['cache', 'alpha']);
      try {
        cache.alpha().bravo();
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      err = null;
      isHash(cache.alpha().bravo('br'), ['cache', 'alpha', 'br']);
      try {
        cache.alpha().bravo('br').charlie();
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      err = null;
      isHash(cache.alpha().bravo('br').charlie('c'), ['cache', 'alpha', 'br', 'c']);
      try {
        cache.alpha().delta('delta');
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      err = null;
      isHash(cache.alpha().delta('foxtrot'), ['cache', 'alpha', 'foxtrot']);
      isHash(cache.alpha().delta('foxtrot').echo(), ['cache', 'alpha', 'foxtrot', 'echo']);
      isHash(cache.golf(), ['cache', 'golf']);
      try {
        cache.golf().bravo();
      } catch (e) {
        err = e;
      }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid key');
      err = null;
      isHash(cache.golf().bravo('hotel'), ['cache', 'golf', 'hotel']);
    });

  });

});
