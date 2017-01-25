# routoh-device-bluetooth-proximity

A fork / ES2015 rewrite of the time module on [route.io](http://route.io).

The device will emit events when a particular bluetooth device is in proximity or not.

On startup it's assumed the device in nearby and the `Away` event will trigger
if after a default time period the device can't be found.

```javascript
const Route = require('routoh');
const BlutetoothProximity = require('routoh-device-bluetooth-proximity');

route.addDevice(new BlutetoothProximity({
  mac: 'AA:AA:AA:AA:AA:AA'
}));

route.addEventCommand('BluetoothProximity.Present', () => {
  // Device is nearby - do something....
});

route.addEventCommand('BluetoothProximity.Away', () => {
  // Device is no-longer nearby - do something....
});
```
