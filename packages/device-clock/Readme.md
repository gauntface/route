# routoh-device-clock

A fork / ES2015 rewrite of the time module on [route.io](http://route.io).

The device will emit events every minute with format 'Clock.<Hour Digits><MinuteDigits>'.

```javascript
const Route = require('routoh');
const Clock = require('routoh-device-clock');

const route = new Route();
route.addDevice(new Clock());

// Listen for 6am
route.addEventCommand('Clock.0600', () => {
  // Do Something Cool....
});

// Listen for 7am
route.addEventCommand('Clock.0700', () => {
  // Do Something Else Cool....
});
```
