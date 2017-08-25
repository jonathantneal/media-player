/* global MediaPlayer */

document.addEventListener('DOMContentLoaded', function () {
	// if the MediaPlayer class is available
	if ('function' === typeof MediaPlayer) {
		// for each media element
		[].forEach.call(document.querySelectorAll('audio[controls], video[controls]'), function (media) {
			// create an media player from the media element
			var player = new MediaPlayer(media, JSON.parse(media.getAttribute('data-options')));

			replaceWithSVG('play', 'M28 16L3 0v32', 'M3 0h9v32H3zm26 0h-9v32h9');
			replaceWithSVG('mute', 'M0 11h6l10-8.5v27L6 21H0M22 6l10 10-10 10', 'M0 11h6l10-8.5v27L6 21H0');
			replaceWithSVG('download', 'M26 17l-2.6-2.8L17.8 20V0H14.2v20L8.6 14.2 6 17l10 10zM7.2 28.2h17.6V32H7.2z');
			replaceWithSVG('fullscreen', 'M29.414 26.586L22.828 20 20 22.828l6.586 6.586L24 32h8v-8zM2.586 5.414L9.172 12 12 9.172 5.414 2.586 8 0H0v8zm24-2.828L20 9.172 22.828 12l6.586-6.586L32 8V0h-8zM12 22.828L9.172 20l-6.586 6.586L0 24v8h8l-2.586-2.586z', 'M24.586 27.414L29.172 32 32 29.172l-4.586-4.586L32 20H20v12zM0 12h12V0L7.414 4.586 2.875.043.047 2.871l4.539 4.543zm0 17.172L2.828 32l4.586-4.586L12 32V20H0l4.586 4.586zM20 12h12l-4.586-4.586 4.547-4.543L29.133.043l-4.547 4.543L20 0z');

			// log the media player
			console.log(player);

			function replaceWithSVG(type, path1, path2) {
				if (path2) {
					player.dom[type].innerHTML = '<svg class="media-symbol media-released" viewBox="0 0 32 32"><path d="' + path1 + '"></svg><svg class="media-symbol media-pressed" viewBox="0 0 32 32"><path d="' + path2 + '">';
				} else {
					player.dom[type].innerHTML = '<svg class="media-symbol" viewBox="0 0 32 32"><path d="' + path1 + '">';
				}
			}
		});
	}
});
