class CallbackQueue {
  constructor() {
    this._queue = [];
    this._isRunning = false;
  }

  add(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback must be a function.');
    }

    this._queue.push(cb);

    if (this._isRunning === false) {
      this._isRunning = true;
      this._processQueue();
    }
  }

  _processQueue() {
    if (this._queue.length === 0) {
      this._isRunning = false;
      return;
    }

    const cb = this._queue.pop();
    const result = cb();
    if (result instanceof Promise) {
      result.then(() => this._onJobComplete());
    } else {
      this._onJobComplete();
    }
  }

  _onJobComplete() {
    this._processQueue();
  }
}

module.exports = new CallbackQueue();
