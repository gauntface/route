const callbackQueue = require('../../callback-queue');

require('chai').should();

describe('Test Hue Callback Queue', function() {
  it('should be fine processing empty queue', function() {
    const badInputs = [
      undefined,
      null,
      123,
      '',
      true,
      false,
    ];
    badInputs.forEach((badInput) => {
      try {
        callbackQueue.add(badInput);
        throw new Error('Expected error to be thrown.');
      } catch (err) {
        if (err.message.indexOf('must be a function') === -1) {
          console.log(err);
          throw new Error('Unexpected error thrown');
        }
      }
    });
  });

  it('should call functions in order', function(done) {
    let order = '';
    const callback1 = function() {
      order += '1';
    };
    const callback2 = function() {
      order += '2';

      order.should.equal('12');
      done();
    };
    callbackQueue.add(callback1);
    callbackQueue.add(callback2);
  });

  it('should wait for promises to resolve', function(done) {
    let order = '';
    const callback1 = function() {
      order += '1';
      return new Promise((resolve) => {
        setTimeout(() => {
          order.should.equal('1');
          resolve();
        }, 200);
      });
    };
    const callback2 = function() {
      order.should.equal('1');
      order += '2';
      return new Promise((resolve) => {
        setTimeout(() => {
          order.should.equal('12');
          resolve();
          done();
        }, 200);
      });
    };
    callbackQueue.add(callback1);
    callbackQueue.add(callback2);
  });
});
