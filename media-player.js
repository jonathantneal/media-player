/* Media Player
/* ====================================================================== */

export default function MediaPlayer(media, rawopts) { // eslint-disable-line complexity
	/* Options
	/* ====================================================================== */

	const self = this;
	const opts = Object(rawopts);
	const prefix = opts.prefix || 'media';
	const dir = /^(btt|ltr|rtl|ttb)$/i.test(opts.dir) ? String(opts.dir).toLowerCase() : getComputedStyle(media).direction;

	/* Language
	/* ====================================================================== */

	const lang = opts.lang = Object(opts.lang);

	lang.player = lang.player || 'media player';
	lang.currentTime = lang.currentTime || 'current time';
	lang.download = lang.download || 'download';
	lang.fullscreen = lang.fullscreen || 'fullscreen';
	lang.minutes = lang.minutes || 'minutes';
	lang.mute = lang.mute || 'mute';
	lang.play = lang.play || 'play';
	lang.remainingTime = lang.remainingTime || 'remaining time';
	lang.seconds = lang.seconds || 'seconds';
	lang.volume = lang.volume || 'volume';

	/* Elements
	/* ====================================================================== */

	self.media = $(media, {
		canplaythrough: onCanPlayOnce,
		loadstart: onLoadStart,
		loadeddata: onLoadedData,
		pause: onPlayChange,
		play: onPlayChange,
		timeupdate: onTimeChange,
		volumechange: onVolumeChange
	});

	// play/pause toggle
	self.playText = document.createTextNode(lang.play);
	self.play = $('button', { class: `${prefix}-control ${prefix}-play`, 'aria-label': lang.play, 'aria-pressed': false, 'data-dir': dir, click: onPlayClick, keydown: onTimeKeydown }, self.playText);

	// time slider
	self.timeMeter = $('div', { class: `${prefix}-meter ${prefix}-time-meter` });
	self.timeRange = $('div', { class: `${prefix}-range ${prefix}-time-range` }, self.timeMeter);
	self.time = $('button', { class: `${prefix}-slider`, role: 'slider', 'aria-label': lang.currentTime, 'data-dir': dir, click: onTimeClick, keydown: onTimeKeydown }, self.timeRange);

	// current time text
	self.currentTimeText = document.createTextNode('00:00');
	self.currentTime = $('span', { class: `${prefix}-text ${prefix}-current-time`, role: 'timer', 'aria-label': lang.currentTime }, self.currentTimeText);

	// remaining time text
	self.remainingTimeText = document.createTextNode('00:00');
	self.remainingTime = $('span', { class: `${prefix}-text ${prefix}-remaining-time`, role: 'timer', 'aria-label': lang.remainingTime }, self.remainingTimeText);

	// mute/unmute toggle
	self.muteText = document.createTextNode(lang.mute);
	self.mute = $('button', { class: `${prefix}-control ${prefix}-mute`, 'aria-label': lang.mute, 'aria-pressed': false, 'data-dir': dir, click: onMuteClick, keydown: onVolumeKeydown }, self.muteText);

	// volume slider
	self.volumeMeter = $('span', { class: `${prefix}-meter ${prefix}-volume-meter` });
	self.volumeRange = $('span', { class: `${prefix}-range ${prefix}-volume-range` }, self.volumeMeter);
	self.volume = $('button', { class: `${prefix}-slider ${prefix}-volume`, role: 'slider', 'aria-label': lang.volume, 'data-dir': dir, click: onVolumeClick, keydown: onVolumeKeydown }, self.volumeRange);

	// download link
	self.downloadText = document.createTextNode(lang.download);
	self.download = $('a', { class: `${prefix}-control ${prefix}-download`, href: media.src, download: media.src, 'aria-label': lang.download, 'data-dir': dir }, self.downloadText);

	// fullscreen link
	self.fullscreenText = document.createTextNode(lang.fullscreen);
	self.fullscreen = $('button', { class: `${prefix}-control ${prefix}-fullscreen`, 'aria-label': lang.fullscreen, 'aria-pressed': false, 'data-dir': dir, click: onFullscreenClick }, self.fullscreenText);

	// player toolbar
	self.toolbar = $('div',
		{ class: `${prefix}-toolbar`, role: 'toolbar', 'aria-label': lang.player },
		self.play, self.mute, self.currentTime, self.remainingTime, self.volume, self.time, self.download, self.fullscreen
	);

	// player
	const player = self.player = $('div', { class: `${prefix}-player`, role: 'region', 'aria-label': lang.player }, self.toolbar);

	// fullscreen api
	const fullscreenchange = self._fullscreenchange = 'onfullscreenchange' in player ? 'fullscreenchange' : 'onwebkitfullscreenchange' in player ? 'webkitfullscreenchange' : 'onmozfullscreenchange' in player ? 'mozfullscreenchange' : 'onMSFullscreenChange' in player ? 'MSFullscreenChange' : 'fullscreenchange';
	const fullscreenElement = self._fullscreenElement = () => player.ownerDocument.fullscreenElement || player.ownerDocument.webkitFullscreenElement || player.ownerDocument.msFullscreenElement;
	const requestFullscreen = self._requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen || player.mozRequestFullScreen || player.msRequestFullscreen;
	const exitFullscreen = self._exitFullscreen = () => player.ownerDocument.exitFullscreen || player.ownerDocument.webkitCancelFullScreen || player.ownerDocument.mozCancelFullScreen || player.ownerDocument.msExitFullscreen;

	// update media class and controls
	$(media, { class: `${prefix}-media`, playsinline: '', 'webkit-playsinline': '', role: 'img' }).controls = false;

	// replace the media element with the media player
	if (media.parentNode) {
		player.insertBefore(
			media.parentNode.replaceChild(player, media),
			self.toolbar
		);

		// fullscreen changes
		player.ownerDocument.addEventListener(fullscreenchange, onFullscreenChange);
	}

	/* Interval Events
	/* ====================================================================== */

	let paused = true, currentTime, duration, interval;

	// when the play state changes
	function onPlayChange() {
		if (paused !== media.paused) {
			paused = media.paused;

			$(self.play, { 'aria-pressed': !paused });

			clearInterval(interval);

			if (!paused) {
				// listen for time changes every 30th of a second
				interval = setInterval(onTimeChange, 34);
			}

			dispatchCustomEvent(media, 'playchange');
		}
	}

	// when the time changes
	function onTimeChange() {
		if (currentTime !== media.currentTime || duration !== media.duration) {
			currentTime = media.currentTime;
			duration = media.duration || 0;

			const currentTimePercentage = currentTime / duration;
			const currentTimeCode = timeToTimecode(currentTime);
			const remainingTimeCode = timeToTimecode(duration - Math.floor(currentTime));

			if (currentTimeCode !== self.currentTimeText.nodeValue) {
				self.currentTimeText.nodeValue = currentTimeCode;

				$(self.currentTime, { title: `${timeToAural(currentTime, lang.minutes, lang.seconds)}` });
			}

			if (remainingTimeCode !== self.remainingTimeText.nodeValue) {
				self.remainingTimeText.nodeValue = remainingTimeCode;

				$(self.remainingTime, { title: `${timeToAural(duration - currentTime, lang.minutes, lang.seconds)}` });
			}

			$(self.time, { 'aria-valuenow': currentTime, 'aria-valuemin': 0, 'aria-valuemax': duration });

			const dirIsInline = /^(ltr|rtl)$/i.test(self.time.getAttribute('data-dir'));
			const axisProp = dirIsInline ? 'width' : 'height';

			self.timeMeter.style[axisProp] = `${currentTimePercentage * 100}%`;

			dispatchCustomEvent(media, 'timechange');
		}
	}

	function onLoadStart() {
		$(media, { canplaythrough: onCanPlayOnce });

		$(self.download, { href: media.src, download: media.src });
	}

	// when the immediate current playback position is available
	function onLoadedData() {
		onTimeChange();
		onVolumeChange();
	}

	// when the media can play
	function onCanPlayOnce() {
		media.removeEventListener('canplaythrough', onCanPlayOnce);

		dispatchCustomEvent(media, 'canplayonce');

		if (!paused || media.autoplay) {
			media.play();
		}
	}

	// when the volume changes
	function onVolumeChange() {
		const volumePercentage = media.muted ? 0 : media.volume;

		$(self.volume, { 'aria-valuenow': volumePercentage, 'aria-valuemin': 0, 'aria-valuemax': 1 });

		const dirIsInline = /^(ltr|rtl)$/i.test(self.volume.getAttribute('data-dir'));
		const axisProp = dirIsInline ? 'width' : 'height';

		self.volumeMeter.style[axisProp] = `${volumePercentage * 100}%`;

		$(self.mute, { 'aria-pressed': !volumePercentage });
	}

	function onFullscreenChange() {
		const isFullscreen = player === fullscreenElement();

		$(self.fullscreen, { 'aria-pressed': isFullscreen });
	}

	/* Input Events
	/* ====================================================================== */

	// when the play control is clicked
	function onPlayClick(event) {
		event.preventDefault();

		media[media.paused ? 'play' : 'pause']();
	}

	// when the time control
	function onTimeClick(event) {
		// handle click if clicked without pointer
		if (!event.pointerType && !event.detail) {
			onPlayClick(event);
		}
	}

	// click from mute control
	function onMuteClick(event) {
		event.preventDefault();

		media.muted = !media.muted;
	}

	// click from volume control
	function onVolumeClick(event) {
		// handle click if clicked without pointer
		if (!event.pointerType && !event.detail) {
			onMuteClick(event);
		}
	}

	// click from fullscreen control
	function onFullscreenClick() {
		if (requestFullscreen) {
			if (player === fullscreenElement()) {
				// exit fullscreen
				exitFullscreen().call(document);
			} else {
				// enter fullscreen
				requestFullscreen.call(player);
			}
		} else if (media.webkitSupportsFullscreen) {
			// iOS allows fullscreen of the video itself
			if (media.webkitDisplayingFullscreen) {
				// exit ios fullscreen
				media.webkitExitFullscreen();
			} else {
				// enter ios fullscreen
				media.webkitEnterFullscreen();
			}

			onFullscreenChange();
		}
	}

	// keydown from play control or current time control
	function onTimeKeydown(event) {
		const { keyCode, shiftKey } = event;

		// 37: LEFT, 38 is UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = 'ltr' === getComputedStyle(self.time).direction;
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : keyCode - 39;

			media.currentTime = Math.max(0, Math.min(duration, currentTime + offset * (isLTR ? 1 : -1) * (shiftKey ? 10 : 1)));

			onTimeChange();
		}
	}

	// keydown from mute control or volume control
	function onVolumeKeydown(event) {
		const { keyCode, shiftKey } = event;

		// 37: LEFT, 38 is UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = 'ltr' === getComputedStyle(self.time).direction;
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : isLTR ? 39 - keyCode : keyCode - 39;

			media.volume = Math.max(0, Math.min(1, media.volume + offset * (isLTR ? 0.1 : -0.1) * (shiftKey ? 1 : 0.2)));
		}
	}

	// pointer events from time control
	onDrag(self.time, (percentage) => {
		media.currentTime = duration * Math.max(0, Math.min(1, percentage));

		onTimeChange();
	});

	// pointer events from volume control
	onDrag(self.volume, (percentage) => {
		media.volume = Math.max(0, Math.min(1, percentage));
	});
}

MediaPlayer.$ = $;

/* Handle Drag Ranges
/* ========================================================================== */

function onDrag(target, listener) {
	const hasPointerEvent = undefined !== target.onpointerup;
	const hasTouchEvent   = undefined !== target.ontouchstart;
	const pointerDown = hasPointerEvent ? 'pointerdown' : hasTouchEvent ? 'touchstart' : 'mousedown';
	const pointerMove = hasPointerEvent ? 'pointermove' : hasTouchEvent ? 'touchmove' : 'mousemove';
	const pointerUp   = hasPointerEvent ? 'pointerup'   : hasTouchEvent ? 'touchend' : 'mouseup';

	let window, rect, dir, dirIsInline, dirIsStart;

	// on pointer down
	target.addEventListener(pointerDown, onpointerdown);

	function onpointerdown(event) {
		// window
		window = target.ownerDocument.defaultView;

		// client boundaries
		rect = target.getBoundingClientRect();

		// drag direction
		dir = target.getAttribute('data-dir') || 'ltr';

		dirIsInline = /^(ltr|rtl)$/i.test(dir);
		dirIsStart  = /^(ltr|ttb)$/i.test(dir);

		onpointermove(event);

		window.addEventListener(pointerMove, onpointermove);
		window.addEventListener(pointerUp, onpointerup);
	}

	function onpointermove(event) {
		// prevent browser actions on this event
		event.preventDefault();

		// the pointer coordinate
		const axisProp = dirIsInline ? 'clientX' : 'clientY';
		const position = axisProp in event ? event[axisProp] : event.touches && event.touches[0] && event.touches[0][axisProp] || 0;

		// the container start and end coordinates
		const start = dirIsInline ? rect.left : rect.top;
		const end   = dirIsInline ? rect.right : rect.bottom;

		// the percentage of the pointer along the container
		const percentage = (dirIsStart ? position - start : end - position) / (end - start);

		// call the listener with percentage
		listener(percentage);
	}

	function onpointerup() {
		window.removeEventListener(pointerMove, onpointermove);
		window.removeEventListener(pointerUp, onpointerup);
	}
}

/* Time To Timecode
/* ====================================================================== */

function timeToTimecode(time) {
	return `${`0${Math.floor(time / 60)}`.slice(-2)}:${`0${Math.floor(time % 60)}`.slice(-2)}`;
}

/* Time To Aural
/* ====================================================================== */

function timeToAural(time, langMinutes, langSeconds) {
	return `${Math.floor(time / 60)} ${langMinutes}, ${Math.floor(time % 60)} ${langSeconds}`;
}

/* Update Elements
/* ========================================================================== */

function $(rawid) {
	const id = rawid instanceof Node ? rawid : document.createElement(rawid);
	const args = [].slice.call(arguments, 1);

	for (let index in args) {
		if (args[index] instanceof Node) {
			id.appendChild(args[index]);
		} else if (Object(args[index]) === args[index]) {
			for (let attr in args[index]) {
				if ('function' === typeof args[index][attr]) {
					id.addEventListener(attr, args[index][attr]);
				} else {
					id.setAttribute(attr, args[index][attr]);
				}
			}
		}
	}

	return id;
}

/* Dispatch Events
/* ====================================================================== */

function dispatchCustomEvent(node, type) {
	const event = document.createEvent('CustomEvent');

	event.initCustomEvent(type, true, true, undefined);

	node.dispatchEvent(event);
}
