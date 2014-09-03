
/**
 * Module dependencies.
 */
global = {};
global.__dirname = __dirname;
global.config = require('./config.json');
global.config.logger.dist = __dirname + global.config.logger.dist;

var logger = require(global.config.logger.dist)(module);

global.routes = {};
global.routes.navigation = require('./routes/navigation');
global.routes.user = require('./routes/user');

global.modules = {};
global.modules.http = require('http');
global.modules.path = require('path');
global.modules.bodyParser = require('body-parser');
global.modules.db = require('./db/mongo.js');
global.modules.passport = require('./utils/password') (global.modules.db.user.find);

global.utils = {};

var express = require('express');
global.app = express();


// app environments
global.app.set('port', global.config.server.port);
global.app.set('views', __dirname + '/views');
global.app.set('view engine', 'jade')


//app midleware
global.app.use(global.modules.bodyParser.json());
global.app.use(global.modules.bodyParser.urlencoded());
global.app.use(express.static(global.modules.path.join(__dirname, 'app')));
global.app.use(require('express-session')({ secret: 'keyboard cat' }));
global.app.use(global.modules.passport.initialize());
global.app.use(global.modules.passport.session());


/**
 * function sets all app routes
 */
!function () {
  "use strict";

  //app navigation routes
  global.app.get('/', global.routes.navigation.index);
  global.app.get('/test', global.routes.navigation.test);
  global.app.get('/login', global.routes.navigation.login);
  global.app.get('/register', global.routes.navigation.register);
  global.app.get('/lobby', global.routes.navigation.checkUserLogin, global.routes.navigation.lobby);
  global.app.get('/room', global.routes.navigation.checkUserLogin, global.routes.navigation.room);

  //app internal routes
  global.app.post('/user/login', global.routes.user.login);
  global.app.post('/user/register', global.routes.user.register);
  global.app.get('/user/logout', global.routes.user.logout);

  //listen to not registered routes and redirects to home page
  global.app.all('*', function (req, res) {
    res.redirect('/');
  });

} ();


//creating http server and setting to listen app port
global.modules.http.createServer(global.app).listen(global.app.get('port'), function(){
  logger.info('Express server listening on port ' + global.app.get('port'));
});