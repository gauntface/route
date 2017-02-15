const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BluetoothProximity = require('../../bluetooth-proximity');

const expect = require('chai').expect;
require('chai').should();

const fakeMac = 'aa:aa:AA:AA:aa:aa';

describe('Bluetooth Proximity', function() {
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

  it('should throw an error without mac address', function() {
    expect(() => {
      new BluetoothProximity();
    }).to.throw('mac address');
  });

  it('should instantiate new bluetooth snooper.', function() {
    new BluetoothProximity({mac: fakeMac});
  });

  it('should be able to exit without a problem.', function() {
    new BluetoothProximity({mac: fakeMac}).exit();
  });

  it('should wait until poweredOn to perform any work', function() {
    return new Promise((resolve, reject) => {
      let currentState = 'poweredOff';
      const nobleCb = {};
      const BTPFake = proxyquire('../../bluetooth-proximity', {
        noble: {
          on: (name, cb) => {
            nobleCb[name] = cb;
          },
          startScanning: () => {
            if (currentState !== 'poweredOn') {
              reject('noble.startScanning() Called before poweredOn.');
              return;
            }
          },
          state: currentState,
        },
      });

      let lastEventDetails = null;

      const fakeBTP = new BTPFake({mac: fakeMac});
      fakeBTP.on('DeviceEvent', (eventDetails) => {
        lastEventDetails = eventDetails;
      });

      fakeBTP.init();

      currentState = 'poweredOn';
      nobleCb.stateChange(currentState);

      (typeof fakeBTP._present).should.equal('undefined');

      sinonClock.tick(95000);

      fakeBTP._present.should.equal(false);
      lastEventDetails.deviceId.should.equal('BluetoothProximity');
      lastEventDetails.eventName.should.equal('Away');

      sinonClock.tick(95000);

      fakeBTP._present.should.equal(false);
      lastEventDetails.deviceId.should.equal('BluetoothProximity');
      lastEventDetails.eventName.should.equal('Away');

      nobleCb.discover({
        address: fakeMac + ':FA:KE',
      });

      fakeBTP._present.should.equal(false);
      lastEventDetails.deviceId.should.equal('BluetoothProximity');
      lastEventDetails.eventName.should.equal('Away');

      nobleCb.discover({
        address: fakeMac,
      });

      fakeBTP._present.should.equal(true);
      lastEventDetails.deviceId.should.equal('BluetoothProximity');
      lastEventDetails.eventName.should.equal('Present');

      resolve();
    });
  });

  it('should dispatch preset event if available on start', function() {
    return new Promise((resolve, reject) => {
      let currentState = 'poweredOff';
      const nobleCb = {};
      const BTPFake = proxyquire('../../bluetooth-proximity', {
        noble: {
          on: (name, cb) => {
            nobleCb[name] = cb;
          },
          startScanning: () => {
            if (currentState !== 'poweredOn') {
              reject('noble.startScanning() Called before poweredOn.');
              return;
            }
          },
          state: currentState,
        },
      });

      let lastEventDetails = null;

      const fakeBTP = new BTPFake({mac: fakeMac});
      fakeBTP.on('DeviceEvent', (eventDetails) => {
        lastEventDetails = eventDetails;
      });

      fakeBTP.init();

      currentState = 'poweredOn';
      nobleCb.stateChange(currentState);

      (typeof fakeBTP._present).should.equal('undefined');

      sinonClock.tick(5000);

      nobleCb.discover({
        address: fakeMac,
      });

      fakeBTP._present.should.equal(true);
      lastEventDetails.deviceId.should.equal('BluetoothProximity');
      lastEventDetails.eventName.should.equal('Present');

      resolve();
    });
  });

  // TODO: Add test to check if poweredOn is state before init();
});
