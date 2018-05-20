$(() => {
	const socket = io();

	socket.on('connection', text => {
		console.log(text);
		$('#chatArea').html('');

		var delivery = new Delivery(socket);
		delivery.on('delivery.connect', delivery => {
			$('#fileBtn').on('change', e => {
				var file = $('#fileBtn')[0].files[0];
				var extraParams = { id: Date.now() };

				delivery.send(file, extraParams);
			});
		});

		delivery.on('send.success', fileUID => {
			console.log(`File "${fileUID.params.id}-${fileUID.name}" was successfully sent`);
		});

		$('#chatForm').on('submit', event => {
			socket.emit('client message', {
				sender: $('#userName').val(),
				content: $('#userMessage').val()
			});

			$('#userMessage').val('');
			$('#fileBtn').val('');
			event.preventDefault();
		});
	});

	socket.on('server answer', data => {
		$('#chatArea').append(data);
	});

	// $('#userMessage').keyup((event) => {
	// 	if (event.keyCode == 13) {
	// 		$('#sendBtn').click();
	// 	}
	// });
});