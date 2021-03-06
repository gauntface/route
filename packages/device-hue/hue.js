const RouteDevice = require('routoh/route-device');
const ssdp = require('node-ssdp');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

const callbackQueue = require('./callback-queue');
const HueLight = require('./hue-light');
const colorsHelper = require('./colors-helper');

class HueHub extends RouteDevice {
  constructor({id, address, username} = {}) {
    if (!id) {
      id = 'Hue';
    }
    super(id);

    if (typeof address !== 'undefined' &&
      (typeof address !== 'string' || address.length === 0)) {
      throw new Error(`The 'address' parameter must be a string containing ` +
        `an IP address. (i.e. '192.168.0.1').`);
    }

    if (typeof username !== 'undefined' &&
      (typeof username !== 'string' || username.length === 0)) {
      throw new Error(`The 'username' parameter must be a string containing ` +
        `at least one character.`);
    }

    this._bridgeAddress = address;
    this._username = username;
    this._lights = {};
  }

  init() {
    if (this._bridgeAddress) {
      this._addBridge(this._bridgeAddress);
    } else {
      this._scanForBridges();
    }
  }

  getDetails() {
    if (!this._bridgeAddress || !this._username) {
      return null;
    }

    return {
      address: this._bridgeAddress,
      username: this._username,
    };
  }

  getLights() {
    return this._lights;
  }

  allOff() {
    this._applyStateToAll({
      on: false,
    });
  }

  allOn() {
    this._applyStateToAll({
      on: true,
    });
  }

  simulateSunRise(bulbId) {
    const totalSteps = 500;
    const totalDuration = 20 * 60 * 1000;
    const stepDuration = totalDuration / totalSteps;

    let currentStep = 0;
    const intervalId = setInterval(() => {
      const increment = currentStep / totalSteps;
      const newState = {
        on: true,
        bri: increment * 1.0,
        colorTemp: (0.5 - increment/2),
      };
      this.setBulbState(bulbId, colorsHelper.validateValues(newState));

      currentStep++;
      if(currentStep >= 500) {
        clearInterval(intervalId);
      }
    }, stepDuration);
  }

  _applyStateToAll(newState) {
    Object.keys(this._lights).forEach((lightId) => {
      this.setBulbState(lightId, newState);
    });
  }

  _scanForBridges() {
    const discoveredIps = [];
    const ssdpClient = new ssdp.Client();
    ssdpClient.on('response', (headers, statusCode, rinfo) => {
      const host = rinfo.address;
      if (discoveredIps.indexOf(host) !== -1) {
        // Already seen this IP
        return;
      }

      // Mark IP as found
      discoveredIps.push(host);

      const location = headers['LOCATION'];

      fetch(location)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Resposne was not 200.');
        }

        return response.text();
      })
      .then((response) => {
        const parser = new xml2js.Parser();
        return new Promise((resolve, reject) => {
          parser.parseString(response, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      })
      .then((parsedResponse) => {
        const modelName = parsedResponse.root.device[0].modelName[0];
        const isHue = modelName.indexOf('Philips hue bridge') !== -1;
        if (isHue) {
          this._addBridge(host);
        }
      })
      .catch((err) => {
        this.logHelper.error('Unable to query devices description: ', err);
      });
    });
    ssdpClient.search('upnp:rootdevice');
  }

  _addBridge(bridgeAddress) {
    if (this._bridgeAddress && this._bridgeAddress !== bridgeAddress) {
      this.logHelper.error('New bridge found but bridge address already ' +
        'defined');
      return;
    }

    this._bridgeAddress = bridgeAddress;

    this.logHelper.log(`Found hue bridge @ ${this._bridgeAddress}`);

    return this._registerWithHub()
    .then(() => {
      return this._updateLightsList();
    })
    .then(() => {
      this.addListener('CommandEvent', ({commandName, commandData}) => {
        switch(commandName) {
          case 'AllOn': {
            this.allOn();
            break;
          }
          case 'AllOff': {
            this.allOff();
            break;
          }
          case 'ChangeAllColor': {
            if (!commandData || !commandData.userData) {
              this.logHelper.warn('Recevied `ChangeAllColor` event without ' +
                'userdata.');
              break;
            }

            const userData = commandData.userData;
            if (!userData.color) {
              this.logHelper.warn('Recevied `ChangeAllColor` event without ' +
                'userdata.color.', userData);
              break;
            }

            const hsv = colorsHelper.hex2hsv(userData.color);
            if (!hsv) {
              this.logHelper.warn('Recevied `ChangeAllColor` event but ' +
                'unable to parse userdata.color.', userData.color);
              break;
            }

            this._applyStateToAll(colorsHelper.validateValues({
              on: true,
              hue: hsv.h,
              sat: hsv.s,
              bri: hsv.v,
            }));
            break;
          }
          case 'ChangeLightState': {
            if (!commandData || !commandData.userData) {
              this.logHelper.warn('Recevied `ChangeAllColor` event without ' +
                'userdata.');
              break;
            }

            const userData = commandData.userData;
            if (typeof userData.on !== 'boolean') {
              this.logHelper.warn('Recevied `ChangeLightState` event without ' +
                'userdata.on.', userData);
              break;
            }
            if (!userData.bulbName) {
              this.logHelper.warn('Recevied `ChangeLightState` event without ' +
                'userdata.bulbName.', userData);
              break;
            }

            const bulbId = this.getBulbIdFromName(userData.bulbName);
            if (!bulbId) {
              this.logHelper.warn('Recevied `ChangeLightState` event with an ' +
                'invalid bulbName.', userData.bulbName);
              break;
            }

            const newState = {
              on: userData.on,
            };

            if (userData.color) {
              const hsv = colorsHelper.hex2hsv(userData.color);
              if (!hsv) {
                this.logHelper.warn('Recevied `ChangeLightState` event but ' +
                  'unable to parse userdata.color.', userData.color);
                break;
              }

              newState.hue = hsv.h;
              newState.sat = hsv.s;
              newState.bri = hsv.v;
            }

            this.setBulbState(bulbId, colorsHelper.validateValues(newState));
            break;
          }
          case 'SimulateSunRise': {
            if (!commandData || !commandData.userData) {
              this.logHelper.warn('Recevied `SimulateSunRise` event without ' +
                'userdata.');
              break;
            }

            const userData = commandData.userData;
            if (!userData.bulbName) {
              this.logHelper.warn('Recevied `ChangeLightState` event without ' +
                'userdata.bulbName.', userData);
              break;
            }

            const bulbId = this.getBulbIdFromName(userData.bulbName);
            if (!bulbId) {
              this.logHelper.warn('Recevied `SimulateSunRise` event with an ' +
                'invalid bulbName.', userData.bulbName);
              break;
            }

            if (!bulbId) {
              this.logHelper.log('Recevied `SimulateSunRise` event but the  ' +
                'bulbName could not be resolved to a bulb ID: ', userData);
              return;
            }

            this.simulateSunRise(bulbId);
            break;
          }
          default:
            this.logHelper.warn(`Unknown Command Event Received: ` +
              `'${commandName}'`);
            break;
        }
      });
    })
    .then(() => {
      this.emitDeviceEvent('Connected', {
        lights: this._lights,
      });
    });
  }

  _registerWithHub() {
    let body = {
      devicetype: 'routoh-device-hue',
    };

    if (this._username) {
      return Promise.resolve();
    }

    return fetch(`http://${this._bridgeAddress}/api`, {
      method: 'post',
      body: JSON.stringify(body),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Non-OK response when registering with bridge.');
      }
      return response.json();
    })
    .then((response) => {
      response = response[0];
      if (response.error) {
        if (response.error.type === 101) {
          this.logHelper.log('--------------------------------');
          this.logHelper.log('');
          this.logHelper.log('            Important           ');
          this.logHelper.log('');
          this.logHelper.log('The Hue Bridge needs the button ');
          this.logHelper.log('on top to be pressed to connect.');
          this.logHelper.log('');
          this.logHelper.log('Please press it within the next ');
          this.logHelper.log('30 seconds.');
          this.logHelper.log('');
          this.logHelper.log('--------------------------------');
          return new Promise((resolve) => {
            setTimeout(resolve, 30 * 1000);
          })
          .then(() => {
            this.logHelper.log('Attempting to reconnect with hub...');
            return this._registerWithHub();
          });
        } else {
          throw new Error('Unable to register app with hub: ' +
            JSON.stringify(response.error));
        }
      }

      if (!response.success || !response.success.username) {
        throw new Error('Unexpected response from Hue bridge: ' +
          JSON.stringify(response));
      }

      this.logHelper.log('--------------------------------');
      this.logHelper.log('');
      this.logHelper.log('Please add the following details');
      this.logHelper.log('to your bootup config:');
      this.logHelper.log('');
      this.logHelper.log('address: ' + this._bridgeAddress);
      this.logHelper.log('username: ' + response.success.username);
      this.logHelper.log('');
      this.logHelper.log('--------------------------------');

      this._username = response.success.username;
    })
    .catch((err) => {
      this.logHelper.error('Unable to register with bridge: ', err);
      throw err;
    });
  }

  _updateLightsList() {
    return fetch(`http://${this._bridgeAddress}/api/${this._username}/lights`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Non-OK response from bridge.');
      }

      return response.json();
    })
    .then((response) => {
      if (response instanceof Array) {
        throw new Error('Invalid response from bridge: ' +
          JSON.stringify(response));
      }

      Object.keys(response).forEach((lightId) => {
        const lightDetails = response[lightId];
        this._lights[lightId] = new HueLight(lightId, lightDetails);
      });
    })
    .catch((err) => {
      this.logHelper.error('Unable to update light list: ', err);
      throw err;
    });
  }

  getBulbIdFromName(name) {
    const lightIds = Object.keys(this._lights);
    for (let i = 0; i < lightIds.length; i++) {
      const currentId = lightIds[i];
      const lightDetails = this._lights[currentId];
      if (lightDetails.name === name) {
        return currentId;
      }
    }
    return null;
  }

  getBulbState(bulbId) {
    if (!this._lights[bulbId]) {
      this.logHelper.error('Unable to find light with ID: ', bulbId);
      throw new Error('Unable to find light with ID: ' + bulbId);
    }

    return this._lights[bulbId].state;
  }

  setBulbState(bulbId, newState) {
    if (!this._lights[bulbId]) {
      this.logHelper.error('Unable to find light with ID: ', bulbId);
      throw new Error('Unable to find light with ID: ' + bulbId);
    }

    callbackQueue.add(() => {
      return fetch(`http://${this._bridgeAddress}/api/${this._username}/lights/${bulbId}/state`, {
        body: JSON.stringify(newState),
        method: 'PUT',
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Non-OK response from bridge.');
        }

        return response.json();
      })
      .then((response) => {
        if (response.error) {
          if (response.error.description) {
            throw new Error(`Bad response from hub: ` +
              `'${response.error}'`);
          }

          throw new Error(`Bad response from hub: ` +
            `'${JSON.stringify(response)}'`);
        }

        this.updateBulbState(bulbId);
      });
    });
  }

  updateBulbState(bulbId) {
    callbackQueue.add(() => {
      return fetch(`http://${this._bridgeAddress}/api/${this._username}/lights/${bulbId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Non-OK response from bridge.');
        }
        return response.json();
      })
      .then((response) => {
        if (response.error) {
          if (response.error.description) {
            throw new Error(`Bad response from hub: '${response.error}'`);
          }

          throw new Error(`Bad response from hub: ` +
            `'${JSON.stringify(response)}'`);
        }

        this._lights[bulbId].updateState(response.state);

        this.emitStateEvent('LightStateChange', {
          lights: this._lights,
        });
      });
    });
  }
}

module.exports = HueHub;
