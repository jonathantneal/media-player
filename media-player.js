/* Media Player
/* ====================================================================== */

export default function MediaPlayer(media, rawopts) { // eslint-disable-line complexity
	/* Options
	/* ====================================================================== */

	const self = this;
	const opts = Object(rawopts);
	const prefix = opts.prefix || 'media';
	const lang = Object(opts.lang);
	const svgs = Object(opts.svgs);

	const timeDir = opts.timeDir || 'ltr';
	const volumeDir = opts.volumeDir || 'ltr';

	/* Elements
	/* ====================================================================== */

	const document = media.ownerDocument;

	self.media = $(media, {
		canplaythrough: onCanPlayStart,
		loadstart: onLoadStart,
		loadeddata: onLoadedData,
		pause: onPlayChange,
		play: onPlayChange,
		timeupdate: onTimeChange,
		volumechange: onVolumeChange
	});

	// play/pause toggle
	self.playSymbol = svg(prefix, svgs, 'play');
	self.pauseSymbol = svg(prefix, svgs, 'pause');
	self.play = $('button', { class: `${prefix}-control ${prefix}-play`, click: onPlayClick, keydown: onTimeKeydown }, self.playSymbol, self.pauseSymbol);

	// time slider
	self.timeMeter = $('span', { class: `${prefix}-meter ${prefix}-time-meter` });
	self.timeRange = $('span', { class: `${prefix}-range ${prefix}-time-range` }, self.timeMeter);
	self.time = $('button', { class: `${prefix}-slider ${prefix}-time`, role: 'slider', 'aria-label': lang.currentTime || 'current time', 'data-dir': timeDir, click: onTimeClick, keydown: onTimeKeydown }, self.timeRange);

	// current time text
	self.currentTimeText = document.createTextNode('');
	self.currentTime = $('span', { class: `${prefix}-text ${prefix}-current-time`, role: 'timer', 'aria-label': lang.currentTime || 'current time' }, self.currentTimeText);

	// remaining time text
	self.remainingTimeText = document.createTextNode('');
	self.remainingTime = $('span', { class: `${prefix}-text ${prefix}-remaining-time`, role: 'timer', 'aria-label': lang.remainingTime || 'remaining time' }, self.remainingTimeText);

	// mute/unmute toggle
	self.muteSymbol = svg(prefix, svgs, 'mute');
	self.unmuteSymbol = svg(prefix, svgs, 'unmute');
	self.mute = $('button', { class: `${prefix}-control ${prefix}-mute`, click: onMuteClick, keydown: onVolumeKeydown }, self.muteSymbol, self.unmuteSymbol);

	// volume slider
	self.volumeMeter = $('span', { class: `${prefix}-meter ${prefix}-volume-meter` });
	self.volumeRange = $('span', { class: `${prefix}-range ${prefix}-volume-range` }, self.volumeMeter);
	self.volume = $('button', { class: `${prefix}-slider ${prefix}-volume`, role: 'slider', 'aria-label': lang.volume || 'volume', 'data-dir': volumeDir, click: onVolumeClick, keydown: onVolumeKeydown }, self.volumeRange);

	// download button
	self.downloadSymbol = svg(prefix, svgs, 'download');
	self.download = $('button', { class: `${prefix}-control ${prefix}-download`, 'aria-label': lang.download || 'download', click: onDownloadClick }, self.downloadSymbol);

	// fullscreen button
	self.enterFullscreenSymbol = svg(prefix, svgs, 'enterFullscreen');
	self.leaveFullscreenSymbol = svg(prefix, svgs, 'leaveFullscreen');
	self.fullscreen = $('button', { class: `${prefix}-control ${prefix}-fullscreen`, click: onFullscreenClick }, self.enterFullscreenSymbol, self.leaveFullscreenSymbol);

	// player toolbar
	self.toolbar = $('div',
		{ class: `${prefix}-toolbar`, role: 'toolbar', 'aria-label': lang.player || 'media player' },
		self.play, self.mute,self.volume, self.currentTime, self.time, self.remainingTime, self.download, self.fullscreen
	);

	// player
	const player = self.player = $('div', { class: `${prefix}-player`, role: 'region', 'aria-label': lang.player || 'media player' }, self.toolbar);

	// fullscreen api
	const fullscreenchange = self._fullscreenchange = 'onfullscreenchange' in player ? 'fullscreenchange' : 'onwebkitfullscreenchange' in player ? 'webkitfullscreenchange' : 'onmozfullscreenchange' in player ? 'mozfullscreenchange' : 'onMSFullscreenChange' in player ? 'MSFullscreenChange' : 'fullscreenchange';
	const fullscreenElement = self._fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
	const requestFullscreen = self._requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen || player.mozRequestFullScreen || player.msRequestFullscreen;
	const exitFullscreen = self._exitFullscreen = () => document.exitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen;

	// listen for fullscreen changes
	document.addEventListener(fullscreenchange, onFullscreenChange);

	// update media class and controls
	$(media, { class: `${prefix}-media`, playsinline: '', 'webkit-playsinline': '', role: 'img', tabindex: -1 }).controls = false;

	// replace the media element with the media player
	if (media.parentNode) {
		player.insertBefore(
			media.parentNode.replaceChild(player, media),
			self.toolbar
		);
	}

	/* Interval Events
	/* ====================================================================== */

	let paused, currentTime, duration, interval;

	// when the play state changes
	function onPlayChange() {
		if (paused !== media.paused) {
			paused = media.paused;

			$(self.play, { 'aria-label': paused ? lang.play || 'play' : lang.pause || 'pause' });
			$(self.playSymbol, { 'aria-hidden': !paused });
			$(self.pauseSymbol, { 'aria-hidden': paused });

			clearInterval(interval);

			if (!paused) {
				// listen for time changes every 30th of a second
				interval = setInterval(onTimeChange, 34);
			}

			// dispatch new "playchange" event
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

				$(self.currentTime, { title: `${timeToAural(currentTime, lang.minutes || 'minutes', lang.seconds || 'seconds')}` });
			}

			if (remainingTimeCode !== self.remainingTimeText.nodeValue) {
				self.remainingTimeText.nodeValue = remainingTimeCode;

				$(self.remainingTime, { title: `${timeToAural(duration - currentTime, lang.minutes || 'minutes', lang.seconds || 'seconds')}` });
			}

			$(self.time, { 'aria-valuenow': currentTime, 'aria-valuemin': 0, 'aria-valuemax': duration });

			const dirIsInline = /^(ltr|rtl)$/i.test(timeDir);
			const axisProp = dirIsInline ? 'width' : 'height';

			self.timeMeter.style[axisProp] = `${currentTimePercentage * 100}%`;

			// dispatch new "timechange" event
			dispatchCustomEvent(media, 'timechange');
		}
	}

	// when media loads for the first time
	function onLoadStart() {
		media.removeEventListener('canplaythrough', onCanPlayStart);

		$(media, { canplaythrough: onCanPlayStart });

		$(self.download, { href: media.src, download: media.src });

		onPlayChange();
		onVolumeChange();
		onFullscreenChange();
		onTimeChange();
	}

	// when the immediate current playback position is available
	function onLoadedData() {
		onTimeChange();
	}

	// when the media can play
	function onCanPlayStart() {
		media.removeEventListener('canplaythrough', onCanPlayStart);

		// dispatch new "canplaystart" event
		dispatchCustomEvent(media, 'canplaystart');

		if (!paused || media.autoplay) {
			media.play();
		}
	}

	// when the volume changes
	function onVolumeChange() {
		const volumePercentage = media.muted ? 0 : media.volume;
		const isMuted = !volumePercentage;

		$(self.volume, { 'aria-valuenow': volumePercentage, 'aria-valuemin': 0, 'aria-valuemax': 1 });

		const dirIsInline = /^(ltr|rtl)$/i.test(volumeDir);
		const axisProp = dirIsInline ? 'width' : 'height';

		self.volumeMeter.style[axisProp] = `${volumePercentage * 100}%`;

		$(self.mute, { 'aria-label': isMuted ? lang.unmute || 'unmute' : lang.mute || 'mute' });
		$(self.muteSymbol, { 'aria-hidden': isMuted });
		$(self.unmuteSymbol, { 'aria-hidden': !isMuted });
	}

	function onFullscreenChange() {
		const isFullscreen = player === fullscreenElement();

		$(self.fullscreen, { 'aria-label': isFullscreen ? lang.leaveFullscreen || 'leave full screen' : lang.enterFullscreen || 'enter full screen' });
		$(self.enterFullscreenSymbol, { 'aria-hidden': isFullscreen });
		$(self.leaveFullscreenSymbol, { 'aria-hidden': !isFullscreen });
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

	// click from download control
	function onDownloadClick() {
		const a = document.head.appendChild($('a', { download: '', href: media.src }));

		a.click();

		document.head.removeChild(a);
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

				// maintain focus in internet explorer
				self.fullscreen.focus();

				// maintain focus in safari
				setTimeout(() => {
					self.fullscreen.focus();
				}, 200);
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

		// 37: LEFT, 38: UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = /^(btt|ltr)$/.tests(timeDir);
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : keyCode - 39;

			media.currentTime = Math.max(0, Math.min(duration, currentTime + offset * (isLTR ? 1 : -1) * (shiftKey ? 10 : 1)));

			onTimeChange();
		}
	}

	// keydown from mute control or volume control
	function onVolumeKeydown(event) {
		const { keyCode, shiftKey } = event;

		// 37: LEFT, 38: UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = /^(btt|ltr)$/.tests(volumeDir);
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : isLTR ? 39 - keyCode : keyCode - 39;

			media.volume = Math.max(0, Math.min(1, media.volume + offset * (isLTR ? 0.1 : -0.1) * (shiftKey ? 1 : 0.2)));
		}
	}

	// pointer events from time control
	onDrag(self.time, self.timeRange, timeDir, (percentage) => {
		media.currentTime = duration * Math.max(0, Math.min(1, percentage));

		onTimeChange();
	});

	// pointer events from volume control
	onDrag(self.volume, self.volumeRange, volumeDir, (percentage) => {
		media.volume = Math.max(0, Math.min(1, percentage));
	});

	onLoadStart();
}

/* Handle Drag Ranges
/* ========================================================================== */

function onDrag(target, innerTarget, dir, listener) { // eslint-disable-line max-params
	const hasPointerEvent = undefined !== target.onpointerup;
	const hasTouchEvent   = undefined !== target.ontouchstart;
	const pointerDown = hasPointerEvent ? 'pointerdown' : hasTouchEvent ? 'touchstart' : 'mousedown';
	const pointerMove = hasPointerEvent ? 'pointermove' : hasTouchEvent ? 'touchmove' : 'mousemove';
	const pointerUp   = hasPointerEvent ? 'pointerup'   : hasTouchEvent ? 'touchend' : 'mouseup';

	// ...
	const dirIsInline = /^(ltr|rtl)$/i.test(dir);
	const dirIsStart  = /^(ltr|ttb)$/i.test(dir);

	// ...
	const axisProp = dirIsInline ? 'clientX' : 'clientY';

	let window, start, end;

	// on pointer down
	target.addEventListener(pointerDown, onpointerdown);

	function onpointerdown(event) {
		// window
		window = target.ownerDocument.defaultView;

		// client boundaries
		const rect = innerTarget.getBoundingClientRect();

		// the container start and end coordinates
		start = dirIsInline ? rect.left : rect.top;
		end   = dirIsInline ? rect.right : rect.bottom;

		onpointermove(event);

		window.addEventListener(pointerMove, onpointermove);
		window.addEventListener(pointerUp, onpointerup);
	}

	function onpointermove(event) {
		// prevent browser actions on this event
		event.preventDefault();

		// the pointer coordinate
		const position = axisProp in event ? event[axisProp] : event.touches && event.touches[0] && event.touches[0][axisProp] || 0;

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

function svg(prefix, svgs, type) { // eslint-disable-line max-params
	const svgns = 'http://www.w3.org/2000/svg';
	const use = document.createElementNS(svgns, 'use');

	use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', svgs[type] || `#symbol-${type}`);

	return $(document.createElementNS(svgns, 'svg'), {
		class: `${prefix}-symbol ${prefix}-${type}-symbol`,
		role: 'presentation'
	}, use);
}

/* Dispatch Events
/* ====================================================================== */

function dispatchCustomEvent(node, type) {
	const event = document.createEvent('CustomEvent');

	event.initCustomEvent(type, true, true, undefined);

	node.dispatchEvent(event);
}
