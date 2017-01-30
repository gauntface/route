const EventEmitter = require('events').EventEmitter;

const exitLifecycle = require('./exit-lifecycle');
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

    this.logHelper = logHelper;

    exitLifecycle.addEventListener('exit', () => {
      const deviceExitPromises = Object.values(this._devices).map((device) => {
        const promiseChain = device.exit();
        if (promiseChain) {
          return promiseChain.then(() => {}, () => {});
        }
      });

      return Promise.all(deviceExitPromises);
    });
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

    newDevice.init();
  }
  addEventCommand(eventName, command, data) {
    if (!this._eventCmdMap[eventName]) {
      this._eventCmdMap[eventName] = [];
    }

    this._eventCmdMap[eventName] =
      this._eventCmdMap[eventName].concat({
        command,
        data,
      });
  }

  addEventCommandMap(map) {
    Object.keys(map).forEach((eventName) => {
      const commands = map[eventName];
      this.addEventCommand(eventName, commands);
    });
  }

  _handleEvent({eventName, data}) {
    if(!this._eventCmdMap[eventName]) {
      return;
    }

    const eventTriggers = this._eventCmdMap[eventName];
    eventTriggers.forEach((eventTriggerObj) => {
      const command = eventTriggerObj.command;
      const data = eventTriggerObj.data;

      switch(typeof command) {
        case 'function':
          try {
            command(data);
          } catch (err) {
            logHelper.error(`Error occurred when calling function ` +
              `for '${eventName}'.`, err);
          }
          break;
        case 'string': {
          const eventTriggerParts = command.split('.');
          if (eventTriggerParts.length < 2) {
            this.logHelper.warn(`Unexpected & unhandled event: ` +
              `'${command}'`);
            return;
          }

          const deviceName = eventTriggerParts[0];
          const deviceCommand = eventTriggerParts.splice(1).join('.');

          if (!this._devices[deviceName]) {
            this.logHelper.warn(`Device does not exist: ${deviceName}`);
            return;
          }

          this._devices[deviceName].emitCommandEvent(deviceCommand, data);
          break;
        }
        default:
          logHelper.error('Unable to do anything with : ' + command);
          break;
      }
    });
  }
}

module.exports = Route;
