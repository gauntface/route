const RouteDevice = require('routoh/route-device');
const noble = require('noble');

const AWAY_AFTER_TIME = 1.5 * 60 * 1000;
const MANUAL_UPDATE_PERIOD = 5 * 1000;

class BluetoothProximity extends RouteDevice {
  constructor({id, mac} = {}) {
    if (!id) {
      id = 'BluetoothProximity';
    }
    super(id);

    if (!mac) {
      throw new Error('You must provide a mac address in the input. ' +
        `new BluetoothProximity({mac: '<Address of device to track>'})`);
    }

    this._deviceAddress = mac.toUpperCase();

    this._nobleStateChange = this._nobleStateChange.bind(this);
    this._nobleDiscover = this._nobleDiscover.bind(this);
    this._checkAway = this._checkAway.bind(this);
  }

  init() {
    noble.on('stateChange', this._nobleStateChange);
    noble.on('discover', this._nobleDiscover);

    setInterval(this._checkAway.bind(this), MANUAL_UPDATE_PERIOD);
  }

  _nobleStateChange(state) {
    if (state === 'poweredOn') {
      if (!this._lastSeen) {
        // Pretend we're here.
        this._lastSeen = new Date().getTime();
        this._present = true;
      }

      noble.startScanning([], true);
    }
  }

  _nobleDiscover(peripheral) {
    const address = peripheral.address.toUpperCase();
    if (this._deviceAddress === address) {
      this._updatePresence();
    }
  }

  _checkAway() {
    if (this._lastSeen + AWAY_AFTER_TIME < Date.now()) {
      this._setAway();
    }
  }

  _updatePresence() {
    this._lastSeen = Date.now();
    if (this._present) {
      return;
    }

    this._present = true;
    this.emitDeviceEvent('Present');
  }

  _setAway() {
    if (!this._present) {
      return;
    }

    this._present = false;
    this.emitDeviceEvent('Away');
  }

  exit() {
    noble.stopScanning();
  }
}

module.exports = BluetoothProximity;
