const EventEmitter = require('events').EventEmitter;

const RouteDevice = require('./route-device');
const logHelper = require('./log-helper');

class Route extends EventEmitter {
  constructor(data = {}) {
    super();

    this._devices = {};
    this._eventCmdMap = {};
    this._stateWatchers = {};
    this._debug = data.debug;

    this._handleEvent = this._handleEvent.bind(this);
  }

  addDevice(newDevice) {
    if (!(newDevice instanceof RouteDevice)) {
      throw new Error(`A device which does not extend 'RouteDevice' was ` +
        `added. '${JSON.stringify(newDevice)}'.`);
    }

    if (newDevice.id in this._devices) {
      throw new Error(`A device with name '${newDevice.id}' already exists.`);
    }

    this._devices[newDevice.id] = newDevice;

    newDevice.on('DeviceEvent', this._handleEvent);

    // if (newDevice.type.STATEOBSERVER) {
    //   // remember, this is a reference
    //   obj.initStateObserver(this, this.state);
    // }
  }
  addEventCommand(eventName, command) {
    if (!this._eventCmdMap[eventName]) {
      this._eventCmdMap[eventName] = [];
    }

    this._eventCmdMap[eventName] =
      this._eventCmdMap[eventName].concat(command);
  }

  addEventCommandMap(map) {
    Object.keys(map).forEach((eventName) => {
      const commands = map[eventName];
      this.addEventCommand(eventName, commands);
    });
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
        logHelper.warn('What should be done with: ' + eventTrigger);
      }
    });
  }
}

module.exports = Route;