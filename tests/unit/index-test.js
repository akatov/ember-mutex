import Mutex from 'ember-mutex';
import Ember from 'ember';
import { module, test } from 'qunit';

const {
  RSVP: {
    Promise,
    all,
    resolve
  },
  run
} = Ember;

module('Unit | Utility | mutex', {
  beforeEach() {
    this.mutex = Mutex.create();
  }
});

test('#lock() returns a fulfilled promise if the given function succeeds', function (assert) {
  var s = 'abc';
  var res;
  run(() => {
    this.mutex.lock(function () {
      return s;
    }).then(function (r) {
      res = r;
    });
  });
  assert.equal(res, s);
});

test('#lock() returns a rejected promise if the given function fails', function (assert) {
  var e = new Error();
  var err;
  run(() => {
    return this.mutex.lock(function () {
      throw e;
    }).catch(function (er) {
      err = er;
    });
  });
  assert.equal(err, e);
});

test('#lock() returns a rejected promise if the given argument is not a function', function (assert) {
  var err;
  run(() => {
    this.mutex.lock(3).catch(function (e) {
       err = e;
    });
  });
  assert.equal(err.message, 'argument not function');
});

test('#lock() allows only one promise chain to run at a time', function (assert) {
  let done = assert.async();
  var xs = [];

  var task = function (x) {
    xs.push(x);
    return resolve(x);
  };

  var chain = function (x) {
    return task(x).then(function (x) {
      return task(x);
    }).then(function (x) {
      return task(x);
    });
  };

  var fun = (x) => {
    return this.mutex.lock(function () {
      return chain(x);
    });
  };

  return all([
    fun(5),
    fun(8),
    fun(11)
  ]).then(function (rs) {
    assert.deepEqual(rs, [5, 8, 11]);
    assert.deepEqual(xs, [5, 5, 5, 8, 8, 8, 11, 11, 11]);
    done();
  });
});

test('#isLocked is false while being not locked', function (assert) {
  assert.notOk(this.mutex.get('isLocked'));
});

test('#isLocked is true while being locked', function (assert) {
  let mutex = this.mutex;

  var task = function () {
    assert.ok(mutex.get('isLocked'));
    return resolve(null);
  };

  var chain = function () {
    return task().then(function () {
      return task();
    });
  };

  return mutex.lock(chain).then(() => {
    assert.notOk(mutex.get('isLocked'));
  });
});

test('#isLocked is true even between execution loops', function (assert) {
  let mutex = this.mutex;

  var task = function () {
    assert.ok(mutex.get('isLocked'));
    return new Promise(function(resolve) {
      assert.ok(mutex.get('isLocked'));
      setTimeout(function() {
        assert.ok(mutex.get('isLocked'));
      }, 5);
      setTimeout(resolve, 10);
    });
  };

  var chain = function () {
    return task().then(function () {
      return task();
    });
  };

  return mutex.lock(chain).then(() => {
    assert.notOk(mutex.get('isLocked'));
  });
});
