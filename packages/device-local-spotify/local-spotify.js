const RouteDevice = require('../core/route-device');

/**
 * This makes use of the Mopidy service to play Spotify tracks.
 */
class LocalSpotify extends RouteDevice {
  constructor(id) {
    if (!id) {
      id = 'LocalSpotify';
    }
    super(id);
  }

  login(username, password) {
    return new Promise((resolve, reject) => {

    });
  }

  play(uri) {

  }
}

module.exports = LocalSpotify;
