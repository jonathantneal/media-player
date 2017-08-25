/* Media Player
/* ====================================================================== */

export default function MediaPlayer(media, rawopts) { // eslint-disable-line complexity
	/* Options
	/* ====================================================================== */

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

	/* Show
	/* ====================================================================== */

	const show = opts.show = Object(opts.show);

	show.play = 'play' in show ? show.play : true;
	show.mute = 'mute' in show ? show.mute : true;
	show.currentTime = 'currentTime' in show ? show.currentTime : true;
	show.remainingTime = 'remainingTime' in show ? show.remainingTime : true;
	show.volume = 'volume' in show ? show.volume : true;
	show.time = 'time' in show ? show.time : true;
	show.download = 'download' in show ? show.download : true;
	show.fullscreen = 'fullscreen' in show ? show.fullscreen : true;

	/* Elements
	/* ====================================================================== */

	const dom = this.dom = {};

	this.media = $(media, {
		canplaythrough: onCanPlayOnce,
		loadstart: onLoadStart,
		loadeddata: onLoadedData,
		pause: onPlayChange,
		play: onPlayChange,
		timeupdate: onTimeChange,
		volumechange: onVolumeChange
	});

	// play/pause toggle
	dom.playText = document.createTextNode(lang.play);
	dom.play = $('button', { class: `${prefix}-control ${prefix}-${show.play ? 'visible' : 'hidden'} ${prefix}-play`, 'aria-label': lang.play, 'aria-pressed': false, 'data-dir': dir, click: onPlayClick, keydown: onTimelineKeydown }, dom.playText);

	// time slider
	dom.timeMeter = $('div', { class: `${prefix}-meter ${prefix}-time-meter` });
	dom.timeRange = $('div', { class: `${prefix}-range ${prefix}-time-range` }, dom.timeMeter);
	dom.time = $('button', { class: `${prefix}-slider ${prefix}-${show.time ? 'visible' : 'hidden'} ${prefix}-time`, role: 'slider', 'aria-label': lang.currentTime, 'data-dir': dir, click: onTimelineClick, keydown: onTimelineKeydown }, dom.timeRange);

	// current time text
	dom.currentTimeText = document.createTextNode('00:00');
	dom.currentTime = $('span', { class: `${prefix}-text ${prefix}-${show.currentTime ? 'visible' : 'hidden'} ${prefix}-current-time`, role: 'timer', 'aria-label': lang.currentTime }, dom.currentTimeText);

	// remaining time text
	dom.remainingTimeText = document.createTextNode('00:00');
	dom.remainingTime = $('span', { class: `${prefix}-text ${prefix}-${show.remainingTime ? 'visible' : 'hidden'} ${prefix}-remaining-time`, role: 'timer', 'aria-label': lang.remainingTime }, dom.remainingTimeText);

	// mute/unmute toggle
	dom.muteText = document.createTextNode(lang.mute);
	dom.mute = $('button', { class: `${prefix}-control ${prefix}-${show.mute ? 'visible' : 'hidden'} ${prefix}-mute`, 'aria-label': lang.mute, 'aria-pressed': false, 'data-dir': dir, click: onMuteClick, keydown: onVolumeKeydown }, dom.muteText);

	// volume slider
	dom.volumeMeter = $('span', { class: `${prefix}-meter ${prefix}-volume-meter` });
	dom.volumeRange = $('span', { class: `${prefix}-range ${prefix}-volume-range` }, dom.volumeMeter);
	dom.volume = $('button', { class: `${prefix}-slider ${prefix}-${show.volume ? 'visible' : 'hidden'} ${prefix}-volume`, role: 'slider', 'aria-label': lang.volume, 'data-dir': dir, click: onVolumeClick, keydown: onVolumeKeydown }, dom.volumeRange);

	// download link
	dom.downloadText = document.createTextNode(lang.download);
	dom.download = $('a', { class: `${prefix}-control ${prefix}-${show.download ? 'visible' : 'hidden'} ${prefix}-download`, href: media.src, download: media.src, 'aria-label': lang.download, 'data-dir': dir }, dom.downloadText);

	// fullscreen link
	dom.fullscreenText = document.createTextNode(lang.fullscreen);
	dom.fullscreen = $('button', { class: `${prefix}-control ${prefix}-${show.fullscreen ? 'visible' : 'hidden'} ${prefix}-fullscreen`, 'aria-label': lang.fullscreen, 'aria-pressed': false, 'data-dir': dir, click: onFullscreenClick }, dom.fullscreenText);

	// player toolbar
	dom.toolbar = $('div',
		{ class: `${prefix}-toolbar`, role: 'toolbar' },
		dom.play, dom.mute, dom.currentTime, dom.remainingTime, dom.volume, dom.time, dom.download, dom.fullscreen
	);

	// player
	const player = dom.player = $('div', { class: `${prefix}-player`, role: 'group', 'aria-label': lang.player }, dom.toolbar);

	// update media class and controls
	$(media, { class: `${prefix}-media`, playsinline: '', 'webkit-playsinline': '' }).controls = false;

	// replace the media element with the media player
	if (media.parentNode) {
		player.insertBefore(
			media.parentNode.replaceChild(player, media),
			dom.toolbar
		);

		const fullscreenchange = 'onfullscreenchange' in player ? 'fullscreenchange' : 'onwebkitfullscreenchange' in player ? 'webkitfullscreenchange' : 'onmozfullscreenchange' in player ? 'mozfullscreenchange' : 'onMSFullscreenChange' in player ? 'MSFullscreenChange' : 'fullscreenchange';

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

			$(dom.play, { 'aria-pressed': !paused });

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

			if (currentTimeCode !== dom.currentTimeText.nodeValue) {
				dom.currentTimeText.nodeValue = currentTimeCode;

				$(dom.currentTime, { title: `${timeToAural(currentTime, lang.minutes, lang.seconds)}` });
			}

			if (remainingTimeCode !== dom.remainingTimeText.nodeValue) {
				dom.remainingTimeText.nodeValue = remainingTimeCode;

				$(dom.remainingTime, { title: `${timeToAural(duration - currentTime, lang.minutes, lang.seconds)}` });
			}

			$(dom.time, { 'aria-valuenow': currentTime, 'aria-valuemin': 0, 'aria-valuemax': duration });

			const dirIsInline = /^(ltr|rtl)$/i.test(dom.time.getAttribute('data-dir'));
			const axisProp = dirIsInline ? 'width' : 'height';

			dom.timeMeter.style[axisProp] = `${currentTimePercentage * 100}%`;

			dispatchCustomEvent(media, 'timechange');
		}
	}

	function onLoadStart() {
		$(media, { canplaythrough: onCanPlayOnce });

		$(dom.download, { href: media.src, download: media.src });
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

		$(dom.volume, { 'aria-valuenow': volumePercentage, 'aria-valuemin': 0, 'aria-valuemax': 1 });

		const dirIsInline = /^(ltr|rtl)$/i.test(dom.volume.getAttribute('data-dir'));
		const axisProp = dirIsInline ? 'width' : 'height';

		dom.volumeMeter.style[axisProp] = `${volumePercentage * 100}%`;

		$(dom.mute, { 'aria-pressed': !volumePercentage });
	}

	function onFullscreenChange() {
		$(dom.fullscreen, { 'aria-pressed': player === getFullscreenElement(player.ownerDocument) })
	}

	/* Input Events
	/* ====================================================================== */

	// when the play control is clicked
	function onPlayClick(event) {
		event.preventDefault();

		media[media.paused ? 'play' : 'pause']();
	}

	// when the time control
	function onTimelineClick(event) {
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
		const document = player.ownerDocument;
		const exitFullscreen = document.exitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen;
		const requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen || player.mozRequestFullScreen || player.msRequestFullscreen;

		if (getFullscreenElement(document)) {
			// exit fullscreen
			exitFullscreen.call(document);
		} else if (requestFullscreen) {
			// enter fullscreen
			requestFullscreen.call(player);
		} else if (media.webkitSupportsFullscreen) {
			// iOS allows fullscreen of the video itself
			if (media.webkitDisplayingFullscreen) {
				// exit ios fullscreen
				media.webkitExitFullscreen();
			} else {
				// enter ios fullscreen
				media.webkitEnterFullscreen();
			}
		}
	}

	// keydown from play control or current time control
	function onTimelineKeydown({ keyCode, shiftKey } = event) {
		// 37: LEFT, 38 is UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = 'ltr' === getComputedStyle(dom.time).direction;
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : keyCode - 39;

			media.currentTime = Math.max(0, Math.min(duration, currentTime + offset * (isLTR ? 1 : -1) * (shiftKey ? 10 : 1)));

			onTimeChange();
		}
	}

	// keydown from mute control or volume control
	function onVolumeKeydown({ keyCode, shiftKey } = event) {
		// 37: LEFT, 38 is UP, 39: RIGHT, 40: DOWN
		if (37 <= keyCode && 40 >= keyCode) {
			event.preventDefault();

			const isLTR = 'ltr' === getComputedStyle(dom.time).direction;
			const offset = 37 === keyCode || 39 === keyCode ? keyCode - 38 : isLTR ? 39 - keyCode : keyCode - 39;

			media.volume = Math.max(0, Math.min(1, media.volume + offset * (isLTR ? 0.1 : -0.1) * (shiftKey ? 1 : 0.2)));
		}
	}

	// pointer events from time control
	onDrag(dom.time, (percentage) => {
		media.currentTime = duration * Math.max(0, Math.min(1, percentage));

		onTimeChange();
	});

	// pointer events from volume control
	onDrag(dom.volume, (percentage) => {
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
	const opts = [].slice.call(arguments, 1);

	for (let index in opts) {
		if (opts[index] instanceof Node) {
			id.appendChild(opts[index]);
		} else if (Object(opts[index]) === opts[index]) {
			for (let attr in opts[index]) {
				if ('function' === typeof opts[index][attr]) {
					id.addEventListener(attr, opts[index][attr]);
				} else {
					id.setAttribute(attr, opts[index][attr]);
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

function getFullscreenElement(document) {
	return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}
