const LocalSpotify = require('../local-spotify');

describe('Test Local Spotify Device', function() {
  const PLAYLIST_EXAMPLE = 'https://play.spotify.com/user/mattgaunt/playlist/6pOIdTUvKFiMmzlG4clupX';

  it('should be constructed without values', function() {
    new LocalSpotify();
  });

  it('should be able to play and stop playlist after initialisation', function() {
    this.timeout(10 * 1000);

    const spotifyDevice = new LocalSpotify();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });
    })
    .then(() => {
      return spotifyDevice.stop();
    });
  });

  it('should not throw when stopping an non-playing track', function() {
    const spotifyDevice = new LocalSpotify();
    return spotifyDevice.stop();
  });

  it('should be able to play, play and stop playlist after initialisation', function() {
    this.timeout(10 * 1000);

    const spotifyDevice = new LocalSpotify();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
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
    });
  });
});
