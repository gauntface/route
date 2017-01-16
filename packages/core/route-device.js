const EventEmitter = require('events');
const logHelper = require('./log-helper');

class RouteDevice extends EventEmitter {
  constructor(id) {
    super();

    if (!id || typeof id !== 'string' || id.length === 0) {
      throw new Error('No ID passed to RouteDevice.');
    }

    this.logHelper = logHelper;
    this.id = id;
  }

  /**
   * The ...args here will pass the remaining input directly through to
   * super.emit() as is.
   */
  emit(eventType, eventName, ...args) {
    super.emit(eventType, `${this.id}.${eventName}`, ...args);
  }

  exit() {
    return Promise.resolve();
  }
}

module.exports = RouteDevice;
