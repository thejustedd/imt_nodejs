$(() => {
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