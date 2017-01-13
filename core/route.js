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

  _handleEvent() {
    logHelper.log('Handle Event.');
  }
}

module.exports = Route;
