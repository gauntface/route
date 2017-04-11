class ColorsHelper {
  hex2hsv(hexValue) {
    const regex = /(?:#)?(..)(..)(..).*/;
    const regexResult = regex.exec(hexValue);
    if (!regexResult) {
      return null;
    }

    const red = parseInt(regexResult[1], 16) / 255;
    const green = parseInt(regexResult[2], 16) / 255;
    const blue = parseInt(regexResult[3], 16) / 255;

    const minVal = Math.min(red, green, blue);
    const maxVal = Math.max(red, green, blue);
    const delta = (maxVal - minVal);

    const hsvValue = {
      h: 0,
      s: 0,
      v: maxVal,
    };

    if (delta !== 0) {
      hsvValue.s = delta / maxVal;
      const delRed = (((maxVal - red) / 6) + (delta / 2)) / delta;
      const delGreen = (((maxVal - green) / 6) + (delta / 2)) / delta;
      const delBlue = (((maxVal - blue) / 6) + (delta / 2)) / delta;

      if (red == maxVal) {
        hsvValue.h = delBlue - delGreen;
      } else if (green == maxVal) {
        hsvValue.h = (1 / 3) + delRed - delBlue;
      } else if (blue == maxVal) {
        hsvValue.h = (2 / 3) + delGreen - delRed;
      }

      if (hsvValue.h < 0) {
        hsvValue.h += 1;
      }

      if (hsvValue.h > 1) {
        hsvValue.h -= 1;
      }
    }

    hsvValue.h = Math.round(hsvValue.h * 360);
    hsvValue.s = Math.round(hsvValue.s * 100) / 100;
    hsvValue.v = Math.round(hsvValue.v * 100) / 100;

    return hsvValue;
  }

  validateValues(newState) {
    if (newState.hue != null) {
      newState.hue = Math.round((newState.hue % 360) * 182.04);
    }
    if (newState.sat != null) {
      newState.sat = Math.round(newState.sat * 254);
    }
    if (newState.bri != null) {
      newState.bri = Math.round(newState.bri * 254);
    }
    if (newState.time != null) {
      newState.transitiontime = Math.round(newState.time * 10);
    }
    if (newState.effect != null) {
      newState.effect = newState.effect;
    }

    // The colour temperature (white only) 154 is the coolest, 500 is the
    // warmest this appears to be measured in Mireds, equivilent to 1000000/T
    // (where T is the temperature in Kelvin) corresponding to around
    // 6500K (154) to 2000K (500)
    if (newState.colorTemp != null) {
      // 154 - 500
      newState.ct = Math.round(154 + (1.0 - newState.colorTemp) * 346);
    }

    console.log(newState);

    return newState;
  }
}

module.exports = new ColorsHelper();
