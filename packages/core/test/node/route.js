const expect = require('chai').expect;

const Route = require('../../route');
const RouteDevice = require('../../route-device');

require('chai').should();

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

  it('should be able to add an event - command pair (Command as Function)', function() {
    let callbackTriggered = false;
    const callback = () => {
      callbackTriggered = true;
    };
    const name = 'Test.Event';
    const route = new Route();
    route.addEventCommand(name, callback);

    Object.keys(route._eventCmdMap).length.should.equal(1);
    route._eventCmdMap[name].length.should.equal(1);

    const testDevice = new RouteDevice('Test');
    route.addDevice(testDevice);
    testDevice.emitDeviceEvent('Event');

    callbackTriggered.should.equal(true);
  });

  it('should be able to add an event - command pair (Command as String)', function() {
    const exampleArgs = {
      id: Date.now(),
    };

    const testDevice1 = new RouteDevice('Device1');
    const testDevice2 = new RouteDevice('Device2');

    let testCommandFired = false;
    testDevice2.on('CommandEvent', ({eventName, data}) => {
      testCommandFired = true;
      eventName.should.equal('TestCommand');
      data.should.equal(exampleArgs);
    });

    const route = new Route();
    route.addEventCommand('Device1.TestEvent', 'Device2.TestCommand', exampleArgs);

    Object.keys(route._eventCmdMap).length.should.equal(1);
    route._eventCmdMap['Device1.TestEvent'].length.should.equal(1);

    route.addDevice(testDevice1);
    route.addDevice(testDevice2);

    testDevice1.emitDeviceEvent('TestEvent');

    testCommandFired.should.equal(true);
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
