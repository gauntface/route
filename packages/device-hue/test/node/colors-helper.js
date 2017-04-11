const colorsHelper = require('../../colors-helper');

require('chai').should();

describe('Test Color Helpers', function() {
  // Values supplied by http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
  const rgbToHsv = {
    '#000000': {h: 0, s: 0, v: 0},
    '#FFFFFF': {h: 0, s: 0, v: 1},
    '#FF0000': {h: 0, s: 1, v: 1},
    '#00FF00': {h: 120, s: 1, v: 1},
    '#0000FF': {h: 240, s: 1, v: 1},
    '#FFFF00': {h: 60, s: 1, v: 1},
    '#00FFFF': {h: 180, s: 1, v: 1},
    '#FF00FF': {h: 300, s: 1, v: 1},
    '#C0C0C0': {h: 0, s: 0, v: 0.75},
    '#808080': {h: 0, s: 0, v: 0.5},
    '#800000': {h: 0, s: 1, v: 0.5},
    '#808000': {h: 60, s: 1, v: 0.5},
    '#008000': {h: 120, s: 1, v: 0.5},
    '#800080': {h: 300, s: 1, v: 0.5},
    '#008080': {h: 180, s: 1, v: 0.5},
    '#000080': {h: 240, s: 1, v: 0.5},
  };
  Object.keys(rgbToHsv).forEach((rgbValue) => {
    const hsvValue = rgbToHsv[rgbValue];
    it(`should convert '${rgbValue}' to '${JSON.stringify(hsvValue)}'`, function() {
      const hsvResult = colorsHelper.hex2hsv(rgbValue);
      hsvResult.should.deep.equal(hsvValue);
    });
  });
});
