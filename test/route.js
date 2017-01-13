const expect = require('chai').expect;

const Route = require('../core/route');
const RouteDevice = require('../core/route-device');

describe('Test Route Class', function() {
  it('should be able to create a Route', function() {
    new Route();
  });

  it('should be able to add a device', function() {
    const device = new RouteDevice();
    const route = new Route();
    route.addDevice(device);
  });

  it('should error when a non-device is added', function() {
    expect(() => {
      const route = new Route();
      route.addDevice({});
    }).to.throw('RouteDevice');
  });

  it('should throw when adding two devices with the same name', function() {
    expect(() => {
      const device1 = new RouteDevice('Hello');
      const device2 = new RouteDevice('Hello');
      const route = new Route();
      route.addDevice(device1);
      route.addDevice(device2);
    }).to.throw('already exists');
  });
});
