# Ember-mutex

[![Build Status](https://travis-ci.org/akatov/ember-mutex.svg)](https://travis-ci.org/akatov/ember-mutex)
[![Code Climate](https://codeclimate.com/github/akatov/ember-mutex/badges/gpa.svg)](https://codeclimate.com/github/akatov/ember-mutex)
[![Test Coverage](https://codeclimate.com/github/akatov/ember-mutex/badges/coverage.svg)](https://codeclimate.com/github/akatov/ember-mutex/coverage)
[![Issue Count](https://codeclimate.com/github/akatov/ember-mutex/badges/issue_count.svg)](https://codeclimate.com/github/akatov/ember-mutex)
[![npm Version](https://img.shields.io/npm/v/ember-cli-strophe-shim.svg?style=flat-square)](https://www.npmjs.org/package/ember-mutex)
[![Ember Observer Score](http://emberobserver.com/badges/ember-cli-strophe-shim.svg)](http://emberobserver.com/addons/ember-mutex)

A simple mutex implementation using Ember (RSVP) Promises.
This is pretty much a copy of https://github.com/plenluno/promise-mutex adjusted for Ember.

## Installation

```bash
ember install ember-mutex
```

## Usage

```js
import Mutex from 'ember-mutex';
let mutex = Mutex.create();

let sayHelloSynced = function() {
  mutex.lock(function() {
    return new Ember.RSVP.Promise(function(resolve) {
      console.log('hello');
      Ember.run.later(null, resolve, 1000);
    });
  });
};
sayHelloSynced(); // should print 'hello' immediately
sayHelloSynced(); // will print 'hello' after 1000ms
```

## Running Tests

```bash
ember try:testall
```
