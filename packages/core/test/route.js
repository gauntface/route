const expect = require('chai').expect;

const Route = require('../route');
const RouteDevice = require('../route-device');

describe('Test Route Class', function() {
  it('should be able to create a Route', function() {
    new Route();
  });

  it('should be able to add a device', function() {
    const device = new RouteDevice('Hello');
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

  it('should be able to a single event command', function() {
    const callback = () => {
      console.log('Command Function');
    };
    const name = 'Hello';
    const route = new Route();
    route.addEventCommand(name, callback);

    Object.keys(route._eventCmdMap).length.should.equal(1);
    route._eventCmdMap[name].length.should.equal(1);
  });

  it('should be able to a event command map', function() {
    const callback = () => {
      console.log('Command Function');
    };
    const name = 'Hello';
    const mapping = {};
    mapping[name] = callback;

    const route = new Route();
    route.addEventCommandMap(mapping);

    Object.keys(route._eventCmdMap).length.should.equal(1);
    route._eventCmdMap[name].length.should.equal(1);
  });
});
