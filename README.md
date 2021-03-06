# Cachetree [![Build Status](https://secure.travis-ci.org/davidwood/cachetree.png)](http://travis-ci.org/davidwood/cachetree)

Cachetree provides a scoped, fluent API for easily interacting with hierarchical, key-value data.  Cachetree was developed to provide an API for hierarchical data caching (hence the name), but can be used to interact with any hash data that can be organized into a tree-like structure.

## Installation

    npm install cachetree

## Storage Backends

The original implementation of Cachtree has a single storage backend, Redis, and was designed to provide a wrapper API around Redis [hashes](http://redis.io/topics/data-types).  Redis hashes are simply key-value collections, accessible by a `key`.  Within a Redis hash, an individual value is accessible by its key, which is referred to a `field`.  The current implementation of Cachetree has been refactored to allow for pluggable storage backends, but the language still mirrors its Redis-specific ancestry.

The following storage backends are available:

* Memory store (via the included `MemoryStore`)
* Redis (via `cachetree-redis` module)

### Developing Additional Backends

Storage backends extend EventEmitter and expose the following functions:

* `get(key, field, [field …], cb)`: Get the values of all the given hash fields 
* `set(key, field, value, [field, value …], cb)`: Set the values of given hash fields
* `keys(pattern, cb)`: Find all keys matching the given pattern
* `exists(key, field, cb)`: Determine if a hash field exists
* `del(key, field, [field …], cb)`: Delete one or more hash fields
* `flush(key, [key …], cb)`: Delete one or more hashes
* `fields(key, cb)`: List fields in a hash

## Usage

To create a new Cachetree instance:

```
var cachetree = require('cachetree'),
    cache = cachetree();
```

The Cachetree module export a single contstructor function that accepts two optional arguments and returns a Cachtree instance.

`cachetree(store, key, useProperties)`

* `store`: Storage backend instance
* `key`: Root cache key, defaults to `cache`
* `options`: An object containing the following configuration options:
    * `useProperties`: Use properties (and not functions) for explicit scope, defaults to `false`

## Running Tests

Cachetree tests require [Mocha](https://mochajs.org/) and can be run with either `npm test` or `make test`.  You can specify Mocha options, such as the reporter, by adding a [mocha.opts](https://mochajs.org/#mochaopts) file, which is ignored by git, to the `test` directory.
 
