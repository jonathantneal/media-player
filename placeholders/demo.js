/* global MediaPlayer */

document.addEventListener('DOMContentLoaded', function () {
	// if the MediaPlayer class is available
	if ('function' === typeof MediaPlayer) {
		// for each media element
		[].forEach.call(document.querySelectorAll('audio[controls], video[controls]'), function (media) {
			// create an media player from the media element
			var player = media.player = new MediaPlayer(media, JSON.parse(media.getAttribute('data-options')));

			// log the media player
			console.log(player);
		});
	}
});
