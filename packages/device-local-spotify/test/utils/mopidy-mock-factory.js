module.exports = (mockInput) => {
  class MopidyMock {
    constructor() {
      this.__mockAPI = {
        eventListener: {},
        functionCallCount: {
          close: 0,
          off: 0,
        },
      };
    }

    on(evtName, cb) {
      this.__mockAPI.eventListener[evtName] = cb;
    }

    close() {
      this.__mockAPI.functionCallCount.close++;
    }

    off() {
      this.__mockAPI.functionCallCount.off++;
    }

    connect() {
      this.__mockAPI.playlist = mockInput['playlist'];
      this.__mockAPI.playback = mockInput['playback'];
      this.__mockAPI.tracklist = mockInput['tracklist'];
      if (this.__mockAPI.eventListener['state:online']) {
        this.__mockAPI.eventListener['state:online']();
      }
      if (this.__mockAPI.online) {
        this.__mockAPI.online();
      }
    }

    get playback() {
      if (!this.__mockAPI.playback) {
        return;
      }

      return this.__mockAPI.playback;
    }

    get playlists() {
      if (!this.__mockAPI.playlist) {
        return;
      }

      return this.__mockAPI.playlist;
    }

    get tracklist() {
      if (!this.__mockAPI.tracklist) {
        return;
      }

      return this.__mockAPI.tracklist;
    }
  }

  return MopidyMock;
};
