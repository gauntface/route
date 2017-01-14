const Mopidy = require('mopidy');
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

  init() {
    return new Promise((resolve) => {
      this._mopidy = new Mopidy({
        callingConvention: 'by-position-or-by-name',
        webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
      });

      this._mopidy.on('state:online', resolve);
    });
  }

  play(uri) {
    return this._mopidy.playlists.getPlaylists()
    .then((playlists) => {
      return playlists[0].tracks;
    })
    .then((tracks) => {
      return this._mopidy.tracklist.add({tracks: tracks});
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
    });
    /** var get = function (key, object) {
      return object[key];
    };

    var printTypeAndName = function (model) {
        console.log(model.__model__ + ": " + model.name);
        // By returning the playlist, this function can be inserted
        // anywhere a model with a name is piped in the chain.
        return model;
    };

    var trackDesc = function (track) {
        return track.name + " by " + track.artists[0].name +
            " from " + track.album.name;
    };

    var printNowPlaying = function () {
        // By returning any arguments we get, the function can be inserted
        // anywhere in the chain.
        var args = arguments;
        return mopidy.playback.getCurrentTrack()
            .then(function (track) {
                console.log("Now playing:", trackDesc(track));
                return args;
            });
    };

    var queueAndPlay = function (playlistNum, trackNum) {
        playlistNum = playlistNum || 0;
        trackNum = trackNum || 0;
        mopidy.playlists.getPlaylists()
            // => list of Playlists
            .fold(get, playlistNum)
            // => Playlist
            .then(printTypeAndName)
            // => Playlist
            .fold(get, 'tracks')
            // => list of Tracks
            .then(mopidy.tracklist.add)
            // => list of TlTracks
            .fold(get, trackNum)
            // => TlTrack
            .then(mopidy.playback.play)
            // => null
            .then(printNowPlaying)
            // => null
            .catch(console.error.bind(console))  // Handle errors here
            // => null
            .done();                       // ...or they'll be thrown here
        };             // Connect to server
        // mopidy.on(console.log.bind(console));  // Log all events**/
  }
}

module.exports = LocalSpotify;
