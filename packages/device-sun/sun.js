const RouteDevice = require('routoh/route-device');
const suncalc = require('suncalc');

const TRACKED_EVENTS = [
  'NightEnd', 'NauticalDawn', 'Dawn', 'Sunrise', 'SunriseEnd', 'GoldenHourEnd',
  'SolarNoon', 'GoldenHour', 'SunsetStart', 'Sunset', 'Dusk', 'NauticalDusk',
  'Night',
];

class Sun extends RouteDevice {
  constructor({id, latitude, longitude} = {}) {
    if (!id) {
      id = 'Sun';
    }
    super(id);

    this._latitude = latitude;
    this._longitude = longitude;

    this._updateSunEvents = this._updateSunEvents.bind(this);

    this._updateSunEvents();
  }

  _updateSunEvents() {
    const rawSunInfo = suncalc.getTimes(
      new Date(), this._latitude, this._longitude);

    const sunEventInfo = this._normalizeKeys(rawSunInfo);

    const sunPosition = suncalc.getPosition(
      new Date(), this._latitude, this._longitude);

    this.emit('StateEvent', {
      SunEvents: sunEventInfo,
    });
    this.emit('StateEvent', {
      SunEvent: this._getCurrentSunEvent(new Date(), sunEventInfo),
    });
    this.emit('StateEvent', {
      SunPosition: sunPosition,
    });

    // recalculate tomorrow at 3am;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);

    const intervalTime = tomorrow.getTime() - (new Date()).getTime();
    setTimeout(this._updateSunEvents, intervalTime);
  }

  _normalizeKeys(obj) {
    const normalisedKeys = {};
    Object.keys(obj).forEach((key) => {
      const parsedKey = key.charAt(0).toUpperCase() +
        key.slice(1);
      normalisedKeys[parsedKey] = obj[key];
    });
    return normalisedKeys;
  }

  _getCurrentSunEvent(date, sunEventInfo) {
    let sunEvent = 'Night';
    TRACKED_EVENTS.forEach((eventName) => {
      if (sunEventInfo[eventName] < date) {
        sunEvent = eventName;
      }
    });

    return sunEvent;
  }
}

module.exports = Sun;
