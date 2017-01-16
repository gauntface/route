const Mopidy = require('mopidy');
const url = require('url');
const spawn = require('child_process').spawn;
const RouteDevice = require('routoh/route-device');

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

    this._init();
  }

  _init() {
    if (this._ready) {
      return;
    }

    this._ready = new Promise((resolve) => {
      this._spawnMopidyService();

      const mopidy = new Mopidy({
        callingConvention: 'by-position-or-by-name',
        webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
        console: {
          log: () => {},
          warn: () => {},
          error: () => {},
          info: () => {},
          debug: () => {},
        },
      });

      mopidy.on((eventName) => {
        switch(eventName) {
          case 'websocket:incomingMessage':
          case 'websocket:outgoingMessage':
            return;
          default:
            /* eslint-disable no-console */
            this.logHelper.log(`Mopidy: ${eventName}`);
            /* eslint-enable no-console */
            break;
        }
      });
      mopidy.on('state:online', () => resolve(mopidy));
    });
  }

  _spawnMopidyService() {
    this._mopidyService = spawn('mopidy');
  }

  playPlaylist(playlistUrl, shouldShuffle = true) {
    playlistUrl = url.parse(playlistUrl);
    if(playlistUrl.host !== SPOTIFY_HOSTNAME) {
      return Promise.reject(new Error(`Expected playlist URL to have ` +
        `hostname '${SPOTIFY_HOSTNAME}' instead found: '${playlistUrl.host}'`));
    }

    return this._ready.then((mopidyInstance) => {
      const mopidyUri = `spotify${playlistUrl.path.replace(/\//g, ':')}`;
      return mopidyInstance.playlists.filter({uri: mopidyUri})
      .then((playlists) => {
        if (playlists.length !== 1) {
          throw new Error(`Unable to find desired playlist with uri: ` +
            `'${mopidyUri}'`);
        }
        return playlists[0].tracks;
      })
      .then((tracks) => {
        return mopidyInstance.tracklist.add({tracks: tracks});
      })
      .then(() => {
        if (shouldShuffle) {
          return mopidyInstance.tracklist.shuffle();
        }
      })
      .then(() => {
        return mopidyInstance.tracklist.getTlTracks();
      })
      .then((tlTracks) => {
        return mopidyInstance.playback.play({
          tl_track: tlTracks[0],
        });
      });
    });
  }

  stop() {
    return this._ready.then((mopidyInstance) => {
      return mopidyInstance.playback.stop()
      .then(() => {
        if (this._mopidyService) {
          this._mopidyService.kill();
        }
      });
    });
  }

  exit() {
    return this.stop();
  }
}

module.exports = LocalSpotify;
