const proxyquire = require('proxyquire');
const sinon = require('sinon');
const expect = require('chai').expect;

require('chai').should();

const Sun = require('../sun');

describe('Device Sun', function() {
  const EXAMPLE_LAT = 51.507351;
  const EXAMPLE_LON = -0.127758;

  let sandbox;
  let sinonClock;

  before(function() {
    sandbox = sinon.sandbox.create();
    sinonClock = sinon.useFakeTimers(new Date('2017-01-27T12:00:00.340Z').getTime());
  });

  after(function() {
    sinonClock.restore();
    sandbox.restore();
  });

  it('should throw when constructed without values', function() {
    expect(() => {
      new Sun();
    }).to.throw(`'latitude' & 'longitude'`);
  });

  it('should construct with latitude and longitude', function() {
    new Sun({
      latitude: EXAMPLE_LAT,
      longitude: EXAMPLE_LON,
    });
  });

  it('should emit state events on start up with correct data', function() {
    this.timeout(10000);

    const mockSunTimes = {
      solarNoon: new Date('2017-01-27T12:00:00.000Z'),
      nadir: new Date('2017-01-27T00:00:00.000Z'),
      sunrise: new Date('2017-01-27T08:00:00.000Z'),
      sunset: new Date('2017-01-27T16:00:00.000Z'),
      sunriseEnd: new Date('2017-01-27T09:00:00.000Z'),
      sunsetStart: new Date('2017-01-27T15:00:00.000Z'),
      dawn: new Date('2017-01-27T07:00:00.000Z'),
      dusk: new Date('2017-01-27T17:00:00.000Z'),
      nauticalDawn: new Date('2017-01-27T06:00:00.000Z'),
      nauticalDusk: new Date('2017-01-27T18:00:00.000Z'),
      nightEnd: new Date('2017-01-27T05:00:00.000Z'),
      night: new Date('2017-01-27T19:00:00.000Z'),
      goldenHourEnd: new Date('2017-01-27T10:00:00.000Z'),
      goldenHour: new Date('2017-01-27T14:00:00.000Z'),
    };

    const mockSunPosition = {
      azimuth: -0.0613335065527993,
      altitude: 0.3493943640503099,
    };

    const Sun = proxyquire('../sun', {
      'suncalc': {
        getTimes: (date, lat, long) => {
          lat.should.equal(EXAMPLE_LAT);
          long.should.equal(EXAMPLE_LON);

          return mockSunTimes;
        },
        getPosition: (date, lat, long) => {
          lat.should.equal(EXAMPLE_LAT);
          long.should.equal(EXAMPLE_LON);

          return mockSunPosition;
        },
      },
    });

    return new Promise((resolve, reject) => {
      const sun = new Sun({
        latitude: EXAMPLE_LAT,
        longitude: EXAMPLE_LON,
      });

      let numberOfEvents = 0;

      sun.on('StateEvent', (eventName, data) => {
        switch (eventName) {
          case 'Sun.TodaysEvents':
            data.forEach((eventInfo) => {
              let name = eventInfo.eventName;
              name = name.charAt(0).toLowerCase() + name.slice(1);
              mockSunTimes[name].should.equal(eventInfo.date);
            });
            break;
          case 'Sun.CurrentSunEvent':
            data.should.equal('SolarNoon');
            break;
          case 'Sun.SunPosition':
            data.azimuth.should.equal(-0.0613335065527993);
            data.altitude.should.equal(0.3493943640503099);
            break;
          default:
            throw new Error(`Unknown StateEvent: '${eventName}'`);
        }

        numberOfEvents ++;
        if (numberOfEvents === 3) {
          resolve();
        }
      });

      sun.init();
    });
  });
});
