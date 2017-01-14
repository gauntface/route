const Mopidy = require('mopidy');
const url = require('url');
const RouteDevice = require('../core/route-device');

const SPOTIFY_HOSTNAME = 'play.spotify.com';

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

  init() {
    return new Promise((resolve) => {
      this._mopidy = new Mopidy({
        callingConvention: 'by-position-or-by-name',
        webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
      });

      this._mopidy.on('state:online', resolve);
    });
  }

  playPlaylist(playlistUrl) {
    playlistUrl = url.parse(playlistUrl);
    if(playlistUrl.host !== SPOTIFY_HOSTNAME) {
      return Promise.reject(new Error(`Expected playlist URL to have ` +
        `hostname '${SPOTIFY_HOSTNAME}' instead found: '${playlistUrl.host}'`));
    }

    const mopidyUri = `spotify${playlistUrl.path.replace(/\//g, ':')}`;
    return this._mopidy.playlists.filter({uri: mopidyUri})
    .then((playlists) => {
      if (playlists.length !== 1) {
        throw new Error(`Unable to find desired playlist with uri: ` +
          `'${mopidyUri}'`);
      }
      return playlists[0].tracks;
    })
    .then((tracks) => {
      return this._mopidy.tracklist.add({tracks: tracks});
    })
    .then(() => {
      return this._mopidy.tracklist.shuffle();
    })
    .then(() => {
      return this._mopidy.tracklist.getTlTracks();
    })
    .then((tlTracks) => {
      return this._mopidy.playback.play({
        tl_track: tlTracks[0],
      });
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    })
    .then(() => {
      return this._mopidy.playback.stop();
    })
    .catch((err) => {
      console.error(err);
    });
  }
}

module.exports = LocalSpotify;
