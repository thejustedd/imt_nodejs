
// npm init

let express = require('express');
let exphbs = require('express-handlebars');

let app = express();

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: 'hbs' }));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.render('home', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
	res.render('about', { title: 'About Page', version: process.version });
});

app.get('/medusa', (req, res) => {
	res.render('medusa', { title: 'Medusa Page' });
});

app.listen(9090, () => {
	console.log('Server running on port 9090');
});