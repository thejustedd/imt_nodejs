const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { serveClient: true });
const emojer = require('emojer.js');
const sqlite = require('sqlite');
const Promise = require('bluebird');
const urlRegEx = /((http|https|www):\/\/[a-zа-я0-9\w?=&.\/-;#~%-]+(?![a-zа-я0-9\w\s?&.\/;#~%"=-]*>))/g;

// const dbPromise = sqlite.open(path.join(__dirname, 'database.sqlite'), { Promise });

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
	res.render('chat', { title: 'Chat Page' });
});

http.listen(9090, () => {
	console.log('Server running on port 9090');
});

let template = '';
function sendMessage(to, msgObj) {
	if (template) to.emit('server answer', template(msgObj).replace(urlRegEx, '<a href="$&" target="_blank">$&</a>'));
	else {
		fs.readFile('./views/partials/message.hbs', { encoding: 'utf8' }, (err, data) => {
			if (err) return console.error(err);

			const handlebars = require('handlebars');
			template = handlebars.compile(data);

			to.emit('server answer', template(msgObj));
		});
	}
}

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

// let messages = [];
io.on('connection', socket => {
	socket.emit('connection', 'You have been connected');

	// messages.forEach(msgObj => sendMessage(socket, msgObj));
	dbPromise
		.then(db => db.all('SELECT * FROM Messages'))
		.then(messages => messages.forEach(msgObj => sendMessage(socket, msgObj)));

	socket.on('client message', msgObj => {
		msgObj.date = new Date().toLocaleTimeString();
		// msgObj.message = msgObj.message.replace(urlRegEx, '<a href="$&" target="_blank">$&</a>');
		msgObj.message = emojer.parse(msgObj.message);
		msgObj.message = escapeHtml(msgObj.message);

		sendMessage(socket, msgObj);
		sendMessage(socket.broadcast, msgObj);
		dbPromise.then(db => db.get(`INSERT INTO Messages (date, name, message) VALUES ('${msgObj.date}', '${msgObj.name}', '${msgObj.message}')`));
		// messages.push(msgObj);
	});
});