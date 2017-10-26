// const inquirer = require('inquirer');

const HS1XXDevice = require('../../hs1xx');

require('chai').should();

describe('Integration Test HS1XX', function() {
  it('should search for plugs', function(done) {
    this.timeout(4 * 60 * 1000);

    const hsDevice = new HS1XXDevice();
    hsDevice.init();
  });
});
