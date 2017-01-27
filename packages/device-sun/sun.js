const RouteDevice = require('routoh/route-device');
const suncalc = require('suncalc');

class Sun extends RouteDevice {
  constructor({id, latitude, longitude} = {}) {
    if (!id) {
      id = 'Sun';
    }
    super(id);

    if (!latitude || !longitude) {
      throw new Error(`A 'latitude' & 'longitude' are required inputs for ` +
        `this device.`);
    }

    this._latitude = latitude;
    this._longitude = longitude;

    this._updateSunEvents = this._updateSunEvents.bind(this);
  }

  init() {
    this._updateSunEvents();
  }

  _updateSunEvents() {
    const rawSunInfo = suncalc.getTimes(
      new Date(), this._latitude, this._longitude);

    const sunEventInfo = this._sortAndParseSunEvents(rawSunInfo);

    this._updateCurrentState(sunEventInfo);
    this._configureDaysEvents(sunEventInfo);

    // recalculate tomorrow at 3am;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);

    this._setDateTimeout(this._updateSunEvents, tomorrow);
  }

  _sortAndParseSunEvents(sunInfo) {
    const sortedSunEvents = Object.keys(sunInfo).sort((a, b) => {
      return sunInfo[a] - sunInfo[b];
    });

    return sortedSunEvents.map((sunEvent) => {
      const upperCase = sunEvent.charAt(0).toUpperCase() + sunEvent.slice(1);
      return {
        eventName: upperCase,
        date: sunInfo[sunEvent],
      };
    });
  }

  _setDateTimeout(callback, date) {
    const timeDiff = date.getTime() - (new Date()).getTime();
    if (timeDiff <= 0) {
      return;
    }

    return setTimeout(callback, timeDiff);
  }

  _updateCurrentState(sunEventInfo) {
    const sunPosition = suncalc.getPosition(
      new Date(), this._latitude, this._longitude);

    const currentSunEvent = this._getCurrentSunEvent(new Date(), sunEventInfo);

    this.emitStateEvent('TodaysEvents', sunEventInfo);
    this.emitStateEvent('CurrentSunEvent', currentSunEvent);
    this.emitStateEvent('SunPosition', sunPosition);
  }

  _configureDaysEvents(sunEventInfo) {
    sunEventInfo.forEach((eventInfo) => {
      this._setDateTimeout(() => {
        this.emitDeviceEvent(eventInfo.eventName);
        this.emitStateEvent('CurrentSunEvent', eventInfo.eventName);
      }, eventInfo.date);
    });
  }

  _getCurrentSunEvent(date, sunEventInfo) {
    let sunEvent;
    sunEventInfo.forEach((eventInfo) => {
      if (eventInfo.date < date) {
        sunEvent = eventInfo.eventName;
      }
    });

    return sunEvent;
  }
}

module.exports = Sun;
