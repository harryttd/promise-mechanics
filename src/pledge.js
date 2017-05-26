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

  _executeHandler(callback, downstreamPromise) {
    try {
      const executedCallback = callback(this._value);
      if (this._isPromise(executedCallback)) {
        executedCallback.then(
          (value) => downstreamPromise._internalResolve(value),
          (err) => downstreamPromise._internalReject(err)
        );
      }
      else {
        downstreamPromise._internalResolve(executedCallback);
      }
    } catch (error) {
      downstreamPromise._internalReject(error);
    }
  }

  _callHandlers() {
    this._handlerGroups.forEach(group => {
      const { successCb, errorCb, downstreamPromise } = group;
      if (this._isFulfilled()) {
        if (this._isFunc(successCb)) {
          this._executeHandler(successCb, downstreamPromise);
        } else {
          downstreamPromise._internalResolve(this._value);
        }
      }
      else {
        if (this._isFunc(errorCb)) {
          this._executeHandler(errorCb, downstreamPromise);
        } else {
          downstreamPromise._internalReject(this._value);
        }
      }
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
    if (!this._isPending()) this._callHandlers();
    return downstreamPromise;
  }

  catch(errorCb) { return this.then(null, errorCb); }

}
