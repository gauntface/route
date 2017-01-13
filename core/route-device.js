const EventEmitter = require('events');

class RouteDevice extends EventEmitter {
  constructor(deviceId, name) {
    super();

    this.deviceId = deviceId;
    this.name = name;
  }

  /**
   * The ...args here will pass the remaining input directly through to
   * super.emit() as is.
   */
  emit(eventType, eventName, ...args) {
    super.emit(eventType, `${this.deviceId}.${eventName}`, ...args);
  }
}

module.exports = RouteDevice;
