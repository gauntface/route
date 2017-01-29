const sinon = require('sinon');

const Clock = require('../../clock');

require('chai').should();

describe('Test Clock Device', function() {
  let sandbox;
  let sinonClock;

  beforeEach(() => {
    const dateTimeNow = new Date();
    dateTimeNow.setHours(0);
    dateTimeNow.setMinutes(0);

    sandbox = sinon.sandbox.create();
    sinonClock = sinon.useFakeTimers(dateTimeNow.getTime());
  });

  afterEach(() => {
    sinonClock.restore();
    sandbox.restore();
  });

  it('should be able to create a clock device', function() {
    new Clock();
  });

  it('should emit time', function() {
    const clockIncrement = (60 * 1000);
    return new Promise((resolve, reject) => {
      const clock = new Clock();
      let numberOfEvents = 0;
      const expectedEventNames = [
        'Clock.0001',
        'Clock.0002',
      ];
      clock.on('DeviceEvent', (eventName) => {
        eventName.should.equal(expectedEventNames[numberOfEvents]);
        numberOfEvents++;

        if (numberOfEvents >= expectedEventNames.length) {
          resolve();
        } else {
          sinonClock.tick(clockIncrement);
        }
      });
      // Need to kick off the first event by moving time forward
      sinonClock.tick(clockIncrement);
    });
  });
});
