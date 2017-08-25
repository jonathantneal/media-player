document.addEventListener('DOMContentLoaded', function () {
	// the media element
	var $media = document.querySelector('audio, video');
	var $subtitles = document.querySelector('.subtitles');

	if ($media && $subtitles) {
		$media.addEventListener('canplayonce', function () {
			var subtitles = [].map.call($media.textTracks[0].cues, (cue) => {
				var dom = document.createElement('p');

				dom.appendChild(document.createTextNode(cue.text));

				dom.addEventListener('click', function () {
					$media.currentTime = cue.startTime;
				});

				return {
					dom: dom,
					cue: cue
				};
			});

			subtitles.forEach(function (subtitle) {
				$subtitles.appendChild(subtitle.dom);
			});

			$media.addEventListener('timechange', function () {
				subtitles.forEach(function (subtitle) {
					if ($media.currentTime >= subtitle.cue.startTime && $media.currentTime < subtitle.cue.endTime) {
						subtitle.dom.classList.add('active');
					} else {
						subtitle.dom.classList.remove('active');
					}
				});
			});
		});
	}
});
