$(() => {
	// ALL
	$('.active').on('click', (e) => { e.preventDefault(); });

	// MEDUSA
	function rand(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	}

	function getRandLetter() {
		return String.fromCharCode(rand(65, 90));
	}

	function getRandLetter() {
		return String.fromCharCode(rand(65, 90));
	}

	let interval = setInterval(() => console.log(getRandLetter()), 5000);
	setTimeout(() => {
		clearInterval(interval);
		console.log('Generating random letters is over');
	}, 50500);

	$('[data-fancybox="gallery"]').fancybox({
		loop: true
	});

	$('.owl-carousel').owlCarousel({
		items: 1,
		dotsEach: true,
		loop: true,
		autoplay: true,
		autoplayHoverPause: true,
		responsive: {
			768: { items: 2 }
		}
	});
});