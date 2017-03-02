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
    return new Promise((resolve) => {
      const route = new Route();
      const testDevice = new RouteDevice('Test');
      route.addDevice(testDevice);
      route.addEventCommand('Test.Event', ({eventData, userData}) => {
        eventData.should.equal('Device Data');
        userData.should.equal('User Data');
        resolve();
      }, 'User Data');
      testDevice.emitDeviceEvent('Event', 'Device Data');
    });
  });

  it('should be able to add an event - command pair (Command as String)', function() {
    const userData = {
      id: Date.now(),
    };
    const eventData = {
      TestEvent: {
        example: 'Hello, World',
      },
    };

    return new Promise((resolve) => {
      const testDevice1 = new RouteDevice('Device1');
      const testDevice2 = new RouteDevice('Device2');

      testDevice2.on('CommandEvent', ({commandName, commandData}) => {
        commandName.should.equal('TestCommand');
        commandData.userData.should.equal(userData);
        commandData.eventData.should.equal(eventData);
        resolve();
      });

      const route = new Route();
      route.addDevice(testDevice1);
      route.addDevice(testDevice2);

      route.addEventCommand('Device1.TestEvent', 'Device2.TestCommand', userData);
      testDevice1.emitDeviceEvent('TestEvent', eventData);
    });
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

  it('should throw an error when setting a non-function event logger', function() {
    const route = new Route();
    expect(() => {
      route.addEventLogger('Break.');
    }).to.throw('addEventLogger() expects a function');
  });

  it('should be able to get log events', function() {
    return new Promise((resolve) => {
      const testDevice1 = new RouteDevice('Device1');
      const testDevice2 = new RouteDevice('Device2');
      const userData = {
        id: Date.now(),
      };
      const eventData = {
        TestEvent: {
          example: 'Hello, World',
        },
      };

      const route = new Route();

      route.addEventLogger((input) => {
        input.deviceId.should.equal('Device1');
        input.eventName.should.equal('TestEvent');
        input.eventData.should.equal(eventData);
        input.eventTriggers.should.deep.equal([{
          command: 'Device2.TestCommand',
          data: userData,
        }]);

        resolve();
      });

      route.addDevice(testDevice1);
      route.addDevice(testDevice2);

      route.addEventCommand('Device1.TestEvent', 'Device2.TestCommand', userData);
      testDevice1.emitDeviceEvent('TestEvent', eventData);
    });
  });

  it('should be able to access deviced', function() {
    const testDevice1 = new RouteDevice('Device1');
    const testDevice2 = new RouteDevice('Device2');

    const route = new Route();

    route.addDevice(testDevice1);
    route.addDevice(testDevice2);

    const devices = route.getDevices();
    const deviceIds = devices.map((device) => {
      return device.id;
    });
    deviceIds.should.deep.equal(['Device1', 'Device2']);
  });
});
