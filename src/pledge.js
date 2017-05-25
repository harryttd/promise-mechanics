'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/

class $Promise {
  constructor(executer) {
    this._state = 'pending';
    this._value = undefined;
    this._handlerGroups = [];
    executer && executer(this._internalResolve.bind(this), this._internalReject.bind(this));
  }

  _internalResolve(value) {
    if (this._state === 'pending') {
      this._value = value;
      this._state = 'fulfilled';
    }
    this._callHandlers();
  }

  _internalReject(value) {
    if (this._state === 'pending') {
      this._value = value;
      this._state = 'rejected';
    }
    this._callHandlers();
  }

  _isPending() { return this._state === 'pending'; }
  _isFulfilled() { return this._state === 'fulfilled'; }
  _isRejected() { return this._state === 'rejected'; }

  _isFunc(input) { return typeof input === 'function'; }
  _valueIfFunc(value) { return this._isFunc(value) ? value : undefined; }

  _callHandlers() {
    if (this._isPending()) return;

    this._handlerGroups.forEach(group => {
      if (this._isFulfilled()) {
        if (this._isFunc(group.successCb)) {
          group.successCb(this._value);
        }
      } else {
        if (this._isFunc(group.errorCb)) {
          group.errorCb(this._value);
        }
      }
    });
    this._handlerGroups = [];
  }

  then(successCb, errorCb) {
    this._handlerGroups.push({
      successCb: this._valueIfFunc(successCb),
      errorCb: this._valueIfFunc(errorCb)
    });
    this._callHandlers();
  }

  catch(errorCb) { this.then(null, errorCb); }

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
