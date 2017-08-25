# Media Player [<img src="https://jonathantneal.github.io/media-player/logo.svg" alt="" width="90" height="90" align="right">][Media Player]

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]

[Media Player] is a tiny, responsive, international, accessible, cross browser,
easily customizable media player written in plain vanilla JavaScript.

<p align="center"><img src="https://jonathantneal.github.io/media-player/screenshot.png" alt="Media Player Screenshot" width="400"></p>

[Media Player] can be controlled with any pointer or keyboard, whether it’s to 
toggle play or pause, move across the timeline, adjust the volume, or do
anything else you usually do when listening to audio or watching a video.

It’s also designed for developers who want complete visual control, or who want
to hack at and extend the player without any fuss, while the player itself does
all the heavy lifting; accessibility, languages, fullscreen, text direction,
pointer agnostic scrubbable timelines, and lots of other cool sounding stuff.

```sh
npm install --save mediaplayer
```

Here’s what you get:

- Flat classnames for every element, all with a configurable prefix
- Language configuration for every control, which double as accessible labels
- Semantic markup with ARIA states already wired up
- Easy access in JS to all generated elements; i.e. `myplayer.dom.mute`, etc.
- Scrubbale timelines and adjustable volume controls that work with any pointer,
  work with keyboards and respond as expected in RTL, and the ability to
  configure which direction they move in (*ltr*, *rtl*, *ttb*, *btt*)
- A cross-browser fullscreen button
- Three new events; `playchange` (*for play or pause*), `timechange`
  (*it fires more often*), and `canplayonce` (*it fires only once*)
- A download button that actually triggers a download
- Toggle-able play/pause and mute/unmute buttons (*you don’t say!*)
- Something that functions in IE9 (*if you need it to and write your own CSS*)

## Usage

Import and create a new media player.

```js
// import media player
import MediaPlayer from 'media-player';

// get target from media with controls
const $target = document.querySelector('audio[controls], video[controls]');

// assign media player from target (all these options are the defaults)
const player = new MediaPlayer(
  $target,
  {
    prefix: 'media',
    show: {
      play: true,
      mute: true,
      volume: true,
      currentTime: true,
      remainingTime: true,
      time: true,
      download: true,
      fullscreen: true
    },
    lang: {
      play: 'play',
      mute: 'mute',
      volume: 'volume',
      currentTime: 'current time',
      remainingTime: 'remaining time',
      minutes: 'minutes',
      seconds: 'seconds',
      download: 'download',
      fullscreen: 'fullscreen'
    }
  }
);
```

## Demos

- [Standard Experience](https://jonathantneal.github.io/media-player/)
- [Right-To-Left Experience](https://jonathantneal.github.io/media-player/rtl.html)
- [Playlist Experience](https://jonathantneal.github.io/media-player/playlist.html)
- [Subtitled Experience](https://jonathantneal.github.io/media-player/subtitles.html)
- [SVG Experience](https://jonathantneal.github.io/media-player/svg.html)

## Keyboard Controls

### Spacebar, Enter / Return

When focused on the **play button** or the **timeline slider**, pressing the
**spacebar** or **enter / return** toggles the playback of the media.

When focused on the **mute button** or the **volume slider**, pressing the
**spacebar** or **enter / return** toggles the muting of the media.

### Arrows

When focused on the **play button** or the **timeline slider**, pressing the
**left arrow** or **right arrow** moves the timeline forward or backward. The
timeline moves by increments of 1 second, unless **shift** is also pressed,
in which case it moves by 10 seconds.

When focused on the **mute button** or the **volume slider**, pressing the
**left arrow** or **right arrow** moves the volume up or down. The volume moves
by increments of 1%, unless **shift** key is also pressed, in which case it
moves by 10%.

For `ltr` languages written from left to right (like English), the
**left arrow** moves the timeline backward or the volume down, and the
**right arrow** moves the timeline forward or the volume up.

For `rtl` languages written from right to left (like Hebrew or Arabic), the
**left arrow** moves the timeline forward or the volume up, and the
**right arrow** moves the timeline backward or the volume down.

**[RTL Demo]**

---

[Media Player] compiles as 1.91 kB of JS and 569 B of CSS (gzipped).

[Media Player]: https://github.com/jonathantneal/media-player

[npm-url]: https://www.npmjs.com/package/mediaplayer
[npm-img]: https://img.shields.io/npm/v/mediaplayer.svg
[cli-url]: https://travis-ci.org/jonathantneal/media-player
[cli-img]: https://img.shields.io/travis/jonathantneal/media-player.svg

[PostCSS Import]: https://github.com/postcss/postcss-import
[RTL Demo]: https://jonathantneal.github.io/media-player/rtl.html
