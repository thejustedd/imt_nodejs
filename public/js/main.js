$(() => {
	$('.active').on('click', e => { e.preventDefault(); });

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

	const socket = io();

	socket.on('connection', msg => {
		console.log(msg);
	});

	$('#chatForm').on('submit', event => {
		event.preventDefault();

		socket.emit('client message', {
			name: $('#userName').val(),
			message: $('#userMessage').val()
		});

		$('#userMessage').val('');
	});

	socket.on('server answer', data => {
		console.log(data);
		$('.chat-area').append(data);
	});

	// $('#userMessage').keyup((event) => {
	// 	if (event.keyCode == 13) {
	// 		$('#chatBtn').click();
	// 	}
	// });
});