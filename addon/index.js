import Ember from 'ember';

const {
  RSVP: {
    Promise
  },
  run,
  computed: {
    reads
  }
} = Ember;

/**
 * @module utils
 */

/**
 * This is inspired by https://github.com/plenluno/promise-mutex but makes
 * use of the Ember runloop.
 * Usage: `Mutex.create().lock(function usesChainedPromises() { ... })`,
 * where the function `usesChainedPromises` uses chained promises.
 *
 * @class Mutex
 */
export default Ember.Object.extend({

  _locked: false,

  _lock() {
    if (this.get('_locked')) {
      return false;
    } else {
      this.set('_locked', true);
      return true;
    }
  },

  _unlock() {
    if (this.get('_locked')) {
      this.set('_locked', false);
      return true;
    } else {
      return false;
    }
  },

  lock(f) {
    let executor = run.bind(this, function(resolve, reject) {
      if (!this._lock()) {
        run.next(null, executor, resolve, reject);
        return;
      }

      if (!(f instanceof Function)) {
        reject(new Error('argument not function'));
        this._unlock();
        return;
      }

      var r;

      try {
        r = f();
      } catch (e) {
        reject(e);
        this._unlock();
        return;
      }

      Promise.resolve(r).then((res) => {
        resolve(res);
        this._unlock();
      }).catch((err) => {
        reject(err);
        this._unlock();
      });
    });

    return new Promise(executor);
  },

  isLocked: reads('_locked')

});
