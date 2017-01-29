const proxyquire = require('proxyquire');
const mopidyMockFactory = require('../utils/mopidy-mock-factory');

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
    const LocalSpotify = proxyquire('../../local-spotify', {
      mopidy: mopidyMockFactory(),
    });
    const spotifyDevice = new LocalSpotify();
    spotifyDevice.exit();
  });

  it('should not throw when stopping an non-playing track', function() {
    const LocalSpotify = proxyquire('../../local-spotify', {
      mopidy: mopidyMockFactory(),
    });
    spotifyDevice = new LocalSpotify();
    return spotifyDevice.stop()
    .then(() => {
      return spotifyDevice.exit();
    });
  });

  // TODO: Add test for no shuffle

  it('should be able to play and stop playlist after initialisation', function() {
    const EXAMPLE_TRACKS = ['song-1', 'song-2'];
    const EXAMPLE_TL_TRACKS = ['tl-song-1', 'tl-song-2'];
    const EXAMPLE_PLAYLISTS = [
      {
        tracks: EXAMPLE_TRACKS,
      },
    ];
    const EXAMPLE_PLAYLISTS_API = {
      filter(input) {
        if (input.uri.indexOf('spotify:') !== 0) {
          return Promise.reject(new Error(`Injected Error. 'filter({uri: ...})' should start with 'spotify:'`));
        }
        return Promise.resolve(EXAMPLE_PLAYLISTS);
      },
    };
    const EXAMPLE_PLAYBACK_API = {
      play(input) {
        if(input.tl_track !== EXAMPLE_TL_TRACKS[0]) {
          return Promise.reject(new Error(`Injected Error. 'playback.play()' should have passed in the first EXAMPLE_TL_TRACKS.`));
        }
      },
      stop() {
        return Promise.resolve();
      },
    };
    const EXAMPLE_TRACKLIST_API = {
      add(input) {
        if (input.tracks !== EXAMPLE_TRACKS) {
          return Promise.reject(new Error(`Injected Error. 'tracklists.add()' should have passed in EXAMPLE_TRACKS.'`));
        }
      },
      shuffle() {
        return Promise.resolve();
      },
      getTlTracks() {
        return Promise.resolve(EXAMPLE_TL_TRACKS);
      },
    };
    const LocalSpotify = proxyquire('../../local-spotify', {
      spawn: () => {

      },
      mopidy: mopidyMockFactory({
        playlist: EXAMPLE_PLAYLISTS_API,
        playback: EXAMPLE_PLAYBACK_API,
        tracklist: EXAMPLE_TRACKLIST_API,
      }),
    });
    spotifyDevice = new LocalSpotify();
    spotifyDevice.init();

    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE)
    .then(() => {
      return spotifyDevice.stop();
    })
    .then(() => {
      return spotifyDevice.exit();
    });
  });

  it('should handle killing of mopidy service', function() {
    const EXAMPLE_TRACKS = ['song-1', 'song-2'];
    const EXAMPLE_TL_TRACKS = ['tl-song-1', 'tl-song-2'];
    const EXAMPLE_PLAYLISTS = [
      {
        tracks: EXAMPLE_TRACKS,
      },
    ];
    const EXAMPLE_PLAYLISTS_API = {
      filter(input) {
        if (input.uri.indexOf('spotify:') !== 0) {
          return Promise.reject(new Error(`Injected Error. 'filter({uri: ...})' should start with 'spotify:'`));
        }
        return Promise.resolve(EXAMPLE_PLAYLISTS);
      },
    };
    const EXAMPLE_PLAYBACK_API = {
      play(input) {
        if(input.tl_track !== EXAMPLE_TL_TRACKS[0]) {
          return Promise.reject(new Error(`Injected Error. 'playback.play()' should have passed in the first EXAMPLE_TL_TRACKS.`));
        }
      },
      stop() {
        return Promise.resolve();
      },
    };
    const EXAMPLE_TRACKLIST_API = {
      add(input) {
        if (input.tracks !== EXAMPLE_TRACKS) {
          return Promise.reject(new Error(`Injected Error. 'tracklists.add()' should have passed in EXAMPLE_TRACKS.'`));
        }
      },
      shuffle() {
        return Promise.reject('Injected Error. This should not have been called');
      },
      getTlTracks() {
        return Promise.resolve(EXAMPLE_TL_TRACKS);
      },
    };
    const LocalSpotify = proxyquire('../../local-spotify', {
      spawn: () => {

      },
      mopidy: mopidyMockFactory({
        playlist: EXAMPLE_PLAYLISTS_API,
        playback: EXAMPLE_PLAYBACK_API,
        tracklist: EXAMPLE_TRACKLIST_API,
      }),
    });
    spotifyDevice = new LocalSpotify();
    spotifyDevice.init();
    return spotifyDevice.playPlaylist(PLAYLIST_EXAMPLE, false)
    .then(() => {
      return spotifyDevice.exit();
    });
  });
});
