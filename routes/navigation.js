
var logger = require(global.config.logger.dist)(module);

module.exports.checkUserLogin = function (req, res, next)  {
  if (!req.user || !req.user.login) {
    res.redirect('/login');
  }
  else {
    next();
  }
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
    result.sort(function (f, s) {
      return f.timestamp - s.timestamp;
    });
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

  global.modules.db.room.find({ name: roomName }, function (result) {
    var room = result && result.length ? result[0] : null;

    if (room) {
      res.render('room', { title : 'Room', user: req.user, room: room });
    }
    else {
      res.redirect('/lobby');
    }
  });
};