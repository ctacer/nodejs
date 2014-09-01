


/**
 * Module dependencies.
 */

global = {};
global.__dirname = __dirname;
global.config = require('./config.json');

var express = require('express');

global.routes = {};
global.routes.indexRoute = require('./routes');

global.modules = {};
global.modules.http = require('http');
global.modules.path = require('path');
global.modules.bodyParser = require('body-parser');

var app = express();
global.app = app;

// all environments
app.set('port', global.config.server.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade')
app.use(global.modules.bodyParser.json());
app.use(express.static(global.modules.path.join(__dirname, 'app')));

app.get('/', global.routes.indexRoute.index);
app.get('/lobby', global.routes.indexRoute.lobby);
app.get('/login', global.routes.indexRoute.login);
app.get('/register', global.routes.indexRoute.register);
app.get('/room', global.routes.indexRoute.room);

global.modules.http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});