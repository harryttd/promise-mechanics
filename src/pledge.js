'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/

class $Promise {
  constructor(executer) {
    this._state = 'pending';
    this._value = undefined;
    executer && executer(this._internalResolve.bind(this), this._internalReject.bind(this));
  }

  _internalResolve(value) {
    if (this._state === 'pending') {
      this._value = value;
      this._state = 'fulfilled';
    }
  }

  _internalReject(value) {
    if (this._state === 'pending') {
      this._value = value;
      this._state = 'rejected';
    }
  }
}


/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = $Promise;

So in a Node-based project we could write things like this:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
