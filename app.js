var express = require('express')
	, httpProxy = require('http-proxy')
	, mongoose = require('mongoose')
    , swig = require('swig')
    , bodyParser = require('body-parser')
	;

var connectionData = 'mongodb://localhost:27017/proxy'
    , mongooseOptions = { server: { poolSize: 5 } };
mongoose
	.connect(connectionData, mongooseOptions)
	.connection
		.on('connected', function () {  
		    console.log('Mongoose connected');
		});


var Host = require('./models/Host')(mongoose);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', swig.renderFile);
app.set('views', __dirname +'/views');
app.set('view engine', 'html');
// Mudar essa opção de cache para true quando estiver em production
app.set('view cache', false);
swig.setDefaults({ cache: false });

var proxy = httpProxy.createProxyServer({});

app.use('/*', function(req, res) {
	var host = req.headers.host;
	var folders = req.originalUrl;

	console.log(host, folders);
	if(host == 'node'){
		//var target = 'http://localhost:3000'+ folders;
		var target = 'https://tumblr.com';
		proxy.web(req, res, { target: target });
	} else if(host == 'apache') {
		var target = 'http://localhost:8080'+ folders;
		proxy.web(req, res, { target: target });
	} else {
		var options = {};
		var url = req.originalUrl.split('?')[0];

		if(url == '/new-domain' && req.method == 'POST') {
			var toSave = {};
			toSave.domain = req.param('domain');
			toSave.port = req.param('port');
			
			Host.register(toSave, function(err) {
				if(err) throw err;
				return res.redirect('/');
			});
		} else if(url == '/delete-domain') {
			var id = req.query.id;
			Host.deleteItem(id, function(err) {
				if(err) throw err;
				return res.redirect('/');
			});
		} else {
			Host.listAll(function(data) {
				options.links = data;

				res.render('index', options);
			});
		}		
	}
});

app.listen(80, function() {
	console.log('Server running on port 80');
});