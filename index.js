let express = require('express');
let exphbs = require('express-handlebars');

let app = express();

app.locals.pages = [
	{ title: 'Home', link: '/' },
	{ title: 'About', link: '/about' },
	{ title: 'Medusa', link: '/medusa' }
];
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
	app.locals.page_link = req.originalUrl;
	next();
});

app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: 'hbs',
	helpers: {
		isActive: (link) => {
			return link === app.locals.page_link ? 'active' : '';
		}
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

app.listen(9090, () => {
	console.log('Server running on port 9090');
});