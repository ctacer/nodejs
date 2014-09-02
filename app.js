


/**
 * Module dependencies.
 */

global = {};
global.__dirname = __dirname;
global.config = require('./config.json');
global.config.logger.dist = __dirname + global.config.logger.dist;

var express = require('express');

global.routes = {};
global.routes.navigation = require('./routes/navigation');
global.routes.user = require('./routes/user');

global.modules = {};
global.modules.http = require('http');
global.modules.path = require('path');
global.modules.bodyParser = require('body-parser');
global.modules.db = require('./db/mongo.js');

global.utils = {};
var logger = require(global.config.logger.dist)(module);

var app = express();
global.app = app;

//init function
(function () {
    "use strict";
    global.modules.passport = require('./utils/password') (global.modules.db.User.find);
}) ();

// all environments
app.set('port', global.config.server.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade')
app.use(global.modules.bodyParser.json());
app.use(global.modules.bodyParser.urlencoded());
app.use(express.static(global.modules.path.join(__dirname, 'app')));
app.use(require('express-session')({ secret: 'keyboard cat' }));
app.use(global.modules.passport.initialize());
app.use(global.modules.passport.session());

app.get('/', global.routes.navigation.index);
app.get('/test', global.routes.navigation.test);
app.get('/login', global.routes.navigation.login);
app.get('/register', global.routes.navigation.register);
app.get('/lobby', global.routes.navigation.checkUserLogin, global.routes.navigation.lobby);
app.get('/room', global.routes.navigation.checkUserLogin, global.routes.navigation.room);

app.post('/user/login', global.routes.user.login);
app.post('/user/register', global.routes.user.register);
app.post('/user/logout', global.routes.user.logout);

global.modules.http.createServer(app).listen(app.get('port'), function(){
  logger.info('Express server listening on port ' + app.get('port'));
});