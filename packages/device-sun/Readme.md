# routoh-device-sun

A fork / ES2015 rewrite of the time module on [route.io](http://route.io).

// TODO Need to hook up state events and cover how to use them . . . .

```javascript
const Route = require('routoh');
const Sun = require('routoh-device-sun');

const route = new Route();
route.addDevice(new Sun({
  latitude: 0.000,
  longitude: 0.000
}));
```
