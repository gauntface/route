const RouteDevice = require('../core/route-device');

class Clock extends RouteDevice {
  constructor(name, interval) {
    super('Clock', name);

    // Interval is 60 seconds.
    this._interval = interval ? interval : 60 * 1000;

    // Set binding so it can be used with setTimeout
    this._onIntervalTick = this._onIntervalTick.bind(this);

    this._startIntervals();
  }

  _onIntervalTick() {
    const currentTime = new Date();

    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();

    if (hours < 10) {
      hours = '0' + hours.toString();
    }

    if (minutes < 10) {
      minutes = '0' + minutes.toString();
    }

    const timeString = `${hours}${minutes}`;
    this.emit('DeviceEvent', timeString);
  }

  _startIntervals() {
    setInterval(this._onIntervalTick, this._interval);
  }
}

module.exports = Clock;
