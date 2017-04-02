class CallbackQueue {
  constructor() {
    this._queue = [];
    this._isWorking = false;
  }

  add(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback must be a function.');
    }
    this._queue.push(cb);
    this._processQueue();
  }

  _processQueue() {
    if (this._isWorking) {
      return;
    }

    if (this._queue.length === 0) {
      return;
    }

    this._isWorking = true;

    const cb = this._queue.pop();
    const result = cb();
    if (result instanceof Promise) {
      result.then(() => this._onJobComplete());
    } else {
      this._onJobComplete();
    }
  }

  _onJobComplete() {
    this._isWorking = false;
    this._processQueue();
  }
}

module.exports = new CallbackQueue();
