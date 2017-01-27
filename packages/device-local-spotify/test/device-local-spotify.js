const spawnSync = require('child_process').spawnSync;
const LocalSpotify = require('../local-spotify');

describe('Test Local Spotify Device', function() {
  const PLAYLIST_EXAMPLE = 'https://play.spotify.com/user/mattgaunt/playlist/6pOIdTUvKFiMmzlG4clupX';
  let spotifyDevice;

  afterEach(function() {
    if (spotifyDevice) {
      spotifyDevice.exit();
    }

    spotifyDevice = null;
  });

  it('should be constructed without values', function() {
    this.timeout(6 * 1000);

    const spotifyDevice = new LocalSpotify();
    spotifyDevice.exit();
  });

  it('should not throw when stopping an non-playing track', function() {
    this.timeout(15 * 1000);

    spotifyDevice = new LocalSpotify();
    return spotifyDevice.stop()
    .then(() => {
      return spotifyDevice.exit();
    });
  });

  it('should be able to play, stop, play and stop playlist after initialisation', function() {
    this.timeout(30 * 1000);

    spotifyDevice = new LocalSpotify();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return spotifyDevice.stop();
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE);
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return spotifyDevice.stop();
    })
    .then(() => {
      return spotifyDevice.exit();
    });
  });

  it('should handle killing of mopidy service', function() {
    this.timeout(40 * 1000);

    spotifyDevice = new LocalSpotify();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        spotifyDevice._mopidyService.on('close', () => resolve());
        spawnSync('killall', ['mopidy']);
      });
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    })
    .then(() => {
      return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE);
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        spotifyDevice._mopidyService.on('close', () => resolve());
        spawnSync('killall', ['mopidy']);
      });
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    })
    .then(() => {
      return spotifyDevice.stop();
    })
    .then(() => {
      return spotifyDevice.exit();
    });
  });

  it('should be able to exit mopidy', function() {
    this.timeout(20 * 1000);

    spotifyDevice = new LocalSpotify();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    })
    .then(() => {
      return spotifyDevice.exit();
    });
  });
});
