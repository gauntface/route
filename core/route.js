const EventEmitter = require('events').EventEmitter;

const RouteDevice = require('./route-device');
const logHelper = require('../utils/log-helper');

class Route extends EventEmitter {
  constructor(data = {}) {
    super();

    this._devices = {};
    this._eventMap = {};
    this._stateWatchers = {};
    this._debug = data.debug;

    this._handleEvent = this._handleEvent.bind(this);
  }

  addDevice(newDevice) {
    if (!(newDevice instanceof RouteDevice)) {
      const errorMsg = `A device which does not extend 'RouteDevice' was ` +
        `added. '${JSON.stringify(newDevice)}'.`;
      logHelper.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (newDevice.name in this._devices) {
      const errorMsg = `A device with name '${newDevice.name}' already exists.`;
      logHelper.error(errorMsg);
      throw new Error(errorMsg);
    }

    this._devices[newDevice.name] = newDevice;

    newDevice.on('DeviceEvent', this._handleEvent);

    // if (newDevice.type.STATEOBSERVER) {
    //   // remember, this is a reference
    //   obj.initStateObserver(this, this.state);
    // }
  }
  addEventAndTrigger(eventName, eventTrigger) {
    this._map(eventName, eventTrigger);
  }

  addEventMap(map) {
    Object.keys(map).forEach((initialEventName) => {
      const eventTriggers = map[initialEventName];
      this._map(initialEventName, eventTriggers);
    });
  }

  _map(initialEvent, eventTriggers) {
    if (!this._eventMap[initialEvent]) {
      this._eventMap[initialEvent] = [];
    }

    this._eventMap[initialEvent] =
      this._eventMap[initialEvent].concat(eventTriggers);
  }

  _handleEvent(eventName, ...args) {
    if(!this._eventMap[eventName]) {
      return;
    }

    const eventTriggers = this._eventMap[eventName];
    eventTriggers.forEach((eventTrigger) => {
      if (typeof eventTrigger === 'function') {
        try {
          eventTrigger();
        } catch (err) {
          logHelper.error(`Error occurred when calling function ` +
            `for '${eventName}'.`, err);
        }
      } else {
        console.warn('What should be done with: ' + eventTrigger);
      }
    });
  }
}

module.exports = Route;
