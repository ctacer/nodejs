
var logger = require(global.config.logger.dist)(module);

module.exports.checkUserLogin = function (req, res, next)  {
  if (!req.user || !req.user.login) {
    res.redirect('/login');
  }
  else {
    next();
  }
};

module.exports.removeRooms = function (req, res) {
  global.modules.db.room.find(function (result) {
    for (var i = 0; i < result.length; i++) {
      result[i].remove();
    };
    res.redirect('/test/room');
  });
};

module.exports.testRoom = function (req, res) {
  global.modules.db.room.find(function (result) {
    res.render('test', { title : 'Test Rooms', user: req.user, data: result });
  });
};


module.exports.index = function(req, res) {
  if (req.user) {
    res.redirect('/lobby');
  }
  else {
    res.redirect('/login');
  }  
};

module.exports.lobby = function(req, res) {
  global.modules.db.room.find(function (result) {
    res.render('lobby', { title : 'Lobby', user: req.user, rooms: result });
  });
};

module.exports.login = function(req, res) {
  res.render('login', { title : 'Login' });
};

module.exports.register = function(req, res) {
  res.render('register', { title : 'Register' });
};

module.exports.room = function(req, res) {
  var roomName = req.query.name;

  var roomObject = {
    owner: 'user #1',
    name: roomName
  };
  var messages = [
    { author: 'user #2', text: 'Hi All' },
    { author: 'user #1', text: 'Hi man' },
    { author: 'user #2', text: 'Fuck off!' }
  ];

  global.modules.db.room.find({ name: roomName }, function (result) {
    var debugRoom = result && result.length ? result[0] : {};

    res.render('room', { title : 'Room', user: req.user, room: roomObject, messages: [], debugRoom: debugRoom });
  });
};