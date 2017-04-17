# routoh-device-local-spotify

The device is designed to play spotify tracks through the current devices audio out (i.e. headphone jack or internal speakers).

This requires the mopidy application to be installed on the system, but this
module will manage starting and stopping mopidy (i.e. you don't need to run it
as a service.)

This needs proper integration with route.io's event system.

```javascript
const LocalSpotify = require('routoh-device-local-spotify');
const spotifyDevice = new LocalSpotify();

spotifyDevice.playPlaylist(SPOTIFY_ALARM_PLAYLIST);


// Some time later....
spotifyDevice.stop();
```
# Install

Install the dependencies:

    sudo apt-get install mopidy mopidy-spotify

Set up config file at `~/.config/mopidy/mopidy.conf`.