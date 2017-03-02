const Mopidy = require('mopidy');
const url = require('url');
const spawn = require('child_process').spawn;
const RouteDevice = require('routoh/route-device');

const SPOTIFY_HOSTNAME = 'play.spotify.com';

/**
 * This makes use of the Mopidy service to play Spotify tracks.
 */
class LocalSpotify extends RouteDevice {
  constructor({id} = {}) {
    if (!id) {
      id = 'LocalSpotify';
    }

    super(id);

    this._mopidyOnline = false;
  }

  init() {
    this._mopidyInstance = new Mopidy({
      autoConnect: false,
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
    // this._mopidyInstance.connect();

    let lastEventName = null;
    this._mopidyInstance.on((eventName) => {
      switch(eventName) {
        case 'websocket:incomingMessage':
        case 'websocket:outgoingMessage':
        case 'websocket:error':
        case 'websocket:close':
        case 'reconnectionPending':
          return;
        default:
          if (lastEventName !== eventName) {
            lastEventName = eventName;
            this.logHelper.log(`Mopidy: ${eventName}`);
          }
          break;
      }
    });
    this._mopidyInstance.on('state:online', () => {
      this._mopidyOnline = true;
    });
    this._mopidyInstance.on('state:offline', () => {
      this._mopidyOnline = false;
    });

    this.addListener('CommandEvent', ({commandName, commandData}) => {
      switch(commandName) {
        case 'Play': {
          const userData = commandData.userData;
          if (!userData || !userData.playlistUrl) {
            this.logHelper.log('Play event received but no playlist ' +
              'URL supplied: ', userData);
            return;
          }

          this.playPlaylist(userData.playlistUrl)
          .catch((err) => {
            this.logHelper.error(err);
          });
          break;
        }
        case 'Stop':
          this.stop()
          .catch((err) => {
            this.logHelper.error(err);
          });
          break;
        default:
          this.logHelper.warn(`Unknown Command Event Received: ` +
            `'${commandName}'`);
          break;
      }
    });
  }

  _getMopidyInstance() {
    if (this._mopidyOnline && this._mopidyInstance) {
      return Promise.resolve(this._mopidyInstance);
    }

    this._spawnMopidyService();

    return new Promise((resolve) => {
      const listener = () => {
        this._mopidyInstance.off('state:online', listener);
        resolve(this._mopidyInstance);
      };
      this._mopidyInstance.on('state:online', listener);
      this._mopidyInstance.connect();
    });
  }

  _spawnMopidyService() {
    if (this._mopidyService) {
      return;
    }

    this._mopidyService = spawn('mopidy');
    this._mopidyService.addListener('close', (code, signal) => {
      this._mopidyService = null;
    });
  }

  playPlaylist(playlistUrl, shouldShuffle = true) {
    playlistUrl = url.parse(playlistUrl);
    if(playlistUrl.host !== SPOTIFY_HOSTNAME) {
      return Promise.reject(new Error(`Expected playlist URL to have ` +
        `hostname '${SPOTIFY_HOSTNAME}' instead found: '${playlistUrl.host}'`));
    }

    return this._getMopidyInstance().then((mopidyInstance) => {
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
    if (!this._mopidyOnline) {
      return Promise.resolve();
    }

    if (!this._mopidyInstance || ! this._mopidyInstance.playback) {
      return Promise.resolve();
    }

    return Promise.resolve(this._mopidyInstance.playback.stop())
    .then(() => {
      this._mopidyInstance.close();
    });
  }

  exit() {
    if (this._mopidyInstance) {
      // Close the WebSocket without reconnecting.
      this._mopidyInstance.close();
      // Unregister all event listeners.
      this._mopidyInstance.off();
    }
    // Delete your reference to the object, so it can be garbage collected.
    this._mopidyInstance = null;

    // Kill mopidy service.
    if (this._mopidyService) {
      return new Promise((resolve) => {
        this._mopidyService.addListener('close', resolve);
        spawn('killall', ['mopidy']);
      });
    }

    return Promise.resolve();
  }
}

module.exports = LocalSpotify;
