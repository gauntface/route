const RouteDevice = require('routoh/route-device');
const HS100Api = require('hs100-api');

class HSPlug extends RouteDevice {
  constructor({id, address} = {}) {
    if (!id) {
      id = 'HS1xx';
    }
    super(id);

    this._address = address;
    this._client = new HS100Api.Client();
  }

  init() {
    if (!this._address) {
      this._startDiscovery();
    } else {
      // TODO
      // this._plug = client.getPlug({host: address});
    }
  }

  _startDiscovery() {
    /* eslint-disable no-console */
    console.log('Here?');
    this._client.startDiscovery().on('plug-new', (plug) => {
      console.log('Plug Found.');
      plug.getInfo().then((plugInfo) => {
        console.log(plugInfo);
      });
    });
  }
  // this.emitDeviceEvent(eventName);
}

module.exports = HSPlug;
