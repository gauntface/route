const RouteDevice = require('../core/route-device');

class Clock extends RouteDevice {
  constructor(id) {
    if (!id) {
      id = 'Clock';
    }
    super(id);

    // Interval is 60 seconds.
    this._interval = 60 * 1000;

    // Set binding so it can be used with setTimeout
    this._onIntervalTick = this._onIntervalTick.bind(this);

    this._setTimeout();
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

    this._setTimeout();

    const eventName = `${hours}${minutes}`;
    this.emit('DeviceEvent', eventName);
  }

  _setTimeout() {
    // Work out the remaining time til the next minute.
    const nextTime = new Date(new Date().getTime() + this._interval);
    nextTime.setSeconds(0);
    nextTime.setMilliseconds(0);
    setTimeout(() => {
      this._onIntervalTick();
    }, nextTime - new Date());
  }
}

module.exports = Clock;
