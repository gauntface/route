const inquirer = require('inquirer');

const HueDevice = require('../../hue');

require('chai').should();

if (process.env['TRAVIS']) {
  console.warn(`Skipping integration tests for device-local-spotify on Travis.`);
  return;
}

describe('Integration Test HueDevice', function() {
  let hubDetails = null;

  it('should search and find hubs', function(done) {
    this.timeout(4 * 60 * 1000);

    const hueDevice = new HueDevice();
    hueDevice.on('DeviceEvent', (event) => {
      hubDetails = hueDevice.getDetails();
      done();
    });
    hueDevice.init();
  });

  it('should search, find and be able to reconnect', function(done) {
    const hueDevice = new HueDevice(hubDetails);
    hueDevice.on('DeviceEvent', (event) => {
      done();
    });
    hueDevice.init();
  });

  const toggleSingleBulb = (hueDevice, bulbId) => {
    const lightDetails = hueDevice.getLights()[bulbId];

    console.log(`Look at: '${lightDetails.name}'`);
    return new Promise((resolve) => {
      let counter = 0;
      let previousState = lightDetails.state;
      let initialState = lightDetails.state;
      const waitAndLoop = () => {
        setTimeout(() => {
          if (counter > 6) {
            hueDevice.setBulbState(bulbId, {
              on: initialState.on,
            });
            return resolve();
          }

          const currentState = hueDevice.getBulbState(bulbId);
          if (counter !== 0) {
            previousState.on.should.not.equal(currentState.on);
            previousState = currentState;
          }

          hueDevice.setBulbState(bulbId, {
            on: !currentState.on,
          });

          counter++;

          waitAndLoop();
        }, 1000);
      };

      waitAndLoop();
    })
    .then(() => {
      return inquirer.prompt([{
        type: 'confirm',
        message: `Did you see '${lightDetails.name}' blink?`,
        name: 'didBlink',
        default: false,
      }])
      .then((answer) => {
        answer.didBlink.should.equal(true);
      });
    });
  };

  const toggleAllBulbs = (hueDevice) => {
    const allLights = hueDevice.getLights();
    const primaryBulb = Object.keys(allLights)[0];
    const lightDetails = allLights[primaryBulb];

    console.log(`Toggling ALL lights`);
    return new Promise((resolve) => {
      let counter = 0;
      let previousState = lightDetails.state;
      let initialState = lightDetails.state;
      const waitAndLoop = () => {
        setTimeout(() => {
          if (counter > 4) {
            if (initialState.on) {
              hueDevice.allOn();
            } else {
              hueDevice.allOff();
            }
            return resolve();
          }

          const currentState = hueDevice.getBulbState(primaryBulb);
          if (counter !== 0) {
            previousState.on.should.not.equal(currentState.on);
            previousState = currentState;
          }

          if (currentState.on) {
            hueDevice.allOff();
          } else {
            hueDevice.allOn();
          }

          counter++;

          waitAndLoop();
        }, 1000);
      };

      waitAndLoop();
    })
    .then(() => {
      return inquirer.prompt([{
        type: 'confirm',
        message: `Did you see ALL lights blink?`,
        name: 'didBlink',
        default: false,
      }])
      .then((answer) => {
        answer.didBlink.should.equal(true);
      });
    });
  };

  it('should be able to get light list', function() {
    this.timeout(60 * 1000);

    const hueDevice = new HueDevice(hubDetails);

    return new Promise((resolve) => {
      hueDevice.on('DeviceEvent', (event) => {
        resolve();
      });
      hueDevice.init();
    })
    .then(() => {
      const lights = hueDevice.getLights();
      const lightIds = Object.keys(lights);
      lightIds.length.should.be.gt(0);

      const firstLightId = lightIds[0];
      const lightDetails = lights[firstLightId];

      // Check getBulbIdFromName().
      const bulbId = hueDevice.getBulbIdFromName(lightDetails.name);
      bulbId.should.equal(firstLightId);

      return toggleSingleBulb(hueDevice, firstLightId)
      .then(() => {
        return toggleAllBulbs(hueDevice);
      });
    });
  });
});
