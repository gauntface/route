const HueDevice = require('../../hue');

require('chai').should();

describe('Test Hue Device', function() {
  const EXAMPLE_INPUT = {
    address: '666.777.8.9',
    username: 'This is basically a password right?',
  };

  it('should be able to construct without input', function() {
    new HueDevice();
  });

  it('should throw on bad address input', function() {
    const badInputs = [
      '',
      false,
      true,
      [],
      {},
    ];
    badInputs.forEach((badInput) => {
      try {
        const input = Object.assign({}, EXAMPLE_INPUT);
        input.address = badInput;
        new HueDevice(input);
        throw new Error('Expected error to be thrown');
      } catch (err) {
        if (err.message.indexOf(`'address' parameter must be a string`) === -1) {
          console.log('Input: ', badInput);
          console.log('Error: ', err);
          throw new Error('Unexpected error.');
        }
      }
    });
  });

  it('should throw on bad username input', function() {
    const badInputs = [
      '',
      false,
      true,
      [],
      {},
    ];
    badInputs.forEach((badInput) => {
      try {
        const input = Object.assign({}, EXAMPLE_INPUT);
        input.username = badInput;
        new HueDevice(input);
        throw new Error('Expected error to be thrown');
      } catch (err) {
        if (err.message.indexOf(`'username' parameter must be a string`) === -1) {
          console.log('Input: ', badInput);
          console.log('Error: ', err);
          throw new Error('Unexpected error.');
        }
      }
    });
  });
});
