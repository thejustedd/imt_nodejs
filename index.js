const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { serveClient: true });
const dl = require('delivery');
const emojer = require('emojer.js');
const sqlite = require('sqlite');
const Promise = require('bluebird');
const urlRegEx = /((http|https|www):\/\/[a-zа-я0-9\w?=&.\/-;#~%-]+(?![a-zа-я0-9\w\s?&.\/;#~%"=-]*>))/g;

const dbPromise = Promise.resolve()
	.then(() => sqlite.open(path.join(__dirname, 'database.sqlite'), { Promise }))
	.then(db => db.migrate({ force: 'last' }));

app.locals.pages = [
	{ title: 'Home', link: '/' },
	{ title: 'About', link: '/about' },
	{ title: 'Medusa', link: '/medusa' },
	{ title: 'Chat', link: '/chat' }
];
app.use(express.static(path.join(__dirname, 'public')));
app.use('/delivery/lib/client', express.static(path.join(__dirname, 'node_modules', 'delivery', 'lib', 'client')));

app.use((req, res, next) => {
	app.locals.page_link = req.originalUrl;
	next();
});

app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: 'hbs',
	helpers: {
		isActive: link => (link === app.locals.page_link) ? 'active' : ''
	}
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	res.render('home', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
	res.render('about', { title: 'About Page', version: process.versions.v8 });
});

app.get('/medusa', (req, res) => {
	res.render('medusa', { title: 'Medusa Page' });
});

app.get('/chat', (req, res) => {
	res.render('chat', { layout: false, title: 'Chat Page' });
});

http.listen(9090, () => {
	console.log('Server running on port 9090');
});

var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}

let template = '';
function sendMessage(to, msg) {
	if (template) to.emit('server answer', template(msg));
	else {
		fs.readFile('./views/partials/message.hbs', { encoding: 'utf8' }, (err, data) => {
			if (err) return console.error(err);

			const handlebars = require('handlebars');
			template = handlebars.compile(data);

			to.emit('server answer', template(msg));
		});
	}
}

io.on('connection', socket => {
	socket.emit('connection', 'You have been connected');

	dbPromise
		.then(db => db.all('SELECT date, sender, content FROM Message LIMIT 50'))
		.then(messages => messages.forEach(msg => sendMessage(socket, msg)));

	var filename;
	var chatdir = 'img/chat';
	var delivery = dl.listen(socket);
	delivery.on('receive.success', file => {
		var params = file.params;
		filename = params.id + '-' + file.name;
		var filepath = './public/' + chatdir + '/' + filename;

		fs.writeFile(filepath, file.buffer, err => {
			err ? console.log('File "' + filename + '" could not be saved') : console.log('File ' + filename + ' saved');
		});
	});

	socket.on('client message', msg => {
		msg.date = new Date().toLocaleTimeString();
		// msg.content = msg.content.replace(urlRegEx, '<a href="$&" target="_blank">$&</a>');
		msg.content = emojer.parse(msg.content);
		msg.content = escapeHtml(msg.content);

		if (filename) {
			msg.content += `<br><img src="${chatdir}/${filename}" alt="${filename}" style="max-width: 256px; max-height: 256px">`;
			filename = '';
		}

		sendMessage(socket, msg);
		sendMessage(socket.broadcast, msg);
		dbPromise.then(db => db.get(`INSERT INTO Message (date, sender, content) VALUES ('${msg.date}', '${msg.sender}', '${msg.content}')`));
	});
});