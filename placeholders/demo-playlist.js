document.addEventListener('DOMContentLoaded', function () {
	// the media element
	var media = document.querySelector('audio, video');

	// get the playlist links and prepare them for interaction
	var links = [].slice.call(document.querySelectorAll('ul a'));

	// for each playlist link
	links.forEach(function (link) {
		// when the playlist link is clicked
		link.addEventListener('click', function (event) {
			event.preventDefault();

			// update the media src
			media.src = link.href;

			// update link classes
			links.forEach(function (testLink) {
				if (testLink === link) {
					testLink.classList.add('active');
				} else {
					testLink.classList.remove('active');
				}
			});
		});
	});

	// activate the first link
	links[0].click();

	// automatically advance playlist
	media.addEventListener('ended', function () {
		var currentLink = links.filter(function (link) {
			return link.classList.contains('active');
		})[0];

		// current index
		var currentIndex = links.indexOf(currentLink);

		// next index
		var nextIndex = 1 + currentIndex;

		nextIndex = nextIndex === links.length ? 0 : nextIndex;

		// activate the next link
		links[nextIndex].click();

		media.play();
	});
});
