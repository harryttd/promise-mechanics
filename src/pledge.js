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
      this._callHandlers();
    }
  }

  _internalReject(value) {
    if (this._state === 'pending') {
      this._value = value;
      this._state = 'rejected';
      this._callHandlers();
    }
  }

  _isPending() { return this._state === 'pending'; }
  _isFulfilled() { return this._state === 'fulfilled'; }
  _isRejected() { return this._state === 'rejected'; }
  _isPromise(value) { return value instanceof $Promise; }
  _isFunc(input) { return typeof input === 'function'; }
  _valueIfFunc(value) { return this._isFunc(value) ? value : undefined; }

  _handleFulfilled(group) {
    const { successCb, downstreamPromise } = group;
    if (this._isFunc(successCb)) {
      try {
        const success = successCb(this._value);
        if (this._isPromise(success)) {
          success.then(
            (value) => downstreamPromise._internalResolve(value),
            (err) => downstreamPromise._internalReject(err)
          );
        }
        else downstreamPromise._internalResolve(success);
      } catch (err) {
        downstreamPromise._internalReject(err);
      }
    }
    else downstreamPromise._internalResolve(this._value);
  }

  _handleRejected(group) {
    const { errorCb, downstreamPromise } = group;
    if (this._isFunc(errorCb)) {
      try {
        const error = errorCb(this._value);
        if (this._isPromise(error)) {
          error.then(
            (value) => downstreamPromise._internalResolve(value),
            (err) => downstreamPromise._internalReject(err)
          );
        }
        else downstreamPromise._internalResolve(error);
      } catch (err) {
        downstreamPromise._internalReject(err);
      }
    }
    else downstreamPromise._internalReject(this._value);
  }

  _callHandlers() {
    if (this._isPending()) return;

    this._handlerGroups.forEach(group => {
      // const { successCb, errorCb, downstreamPromise } = group;
      if (this._isFulfilled()) this._handleFulfilled(group);
      else this._handleRejected(group);
    });

    this._handlerGroups = [];
  }

  then(successCb, errorCb) {
    const downstreamPromise = new $Promise();
    this._handlerGroups.push({
      successCb: this._valueIfFunc(successCb),
      errorCb: this._valueIfFunc(errorCb),
      downstreamPromise
    });
    this._callHandlers();
    return downstreamPromise;
  }

  catch(errorCb) { return this.then(null, errorCb); }

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
