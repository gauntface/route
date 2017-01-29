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
   * This method is called by the router and is option for
   * devices that have initialisation that could result in events
   * being dispatched. This gives the router a chance to register for
   * these events.
   */
  init() {
    // NOOP.
  }

  /**
   * The ...args here will pass the remaining input directly through to
   * super.emit() as is.
   */
  emit(eventType, eventName, data) {
    super.emit(eventType, `${this.id}.${eventName}`, data);
  }

  emitDeviceEvent(eventName, data) {
    this.emit('DeviceEvent', eventName, data);
  }

  emitStateEvent(eventName, data) {
    this.emit('StateEvent', eventName, data);
  }

  exit() {
    return Promise.resolve();
  }
}

module.exports = RouteDevice;
