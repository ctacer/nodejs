
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

module.exports.testUser = function (req, res) {
  global.modules.db.user.find(function (result) {
    res.render('test', { title : 'Test Users', user: req.user, data: result });
  });
};

module.exports.testRoom = function (req, res) {
  global.modules.db.room.find(function (result) {
    res.render('test', { title : 'Test Rooms', user: req.user, data: result });
  });
};

module.exports.removeRooms = function (req, res) {
  global.modules.db.room.find(function (result) {
    for (var i = 0; i < result.length; i++) {
      result[i].remove();
    };
    res.redirect('/test/room');
  });
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
  res.render('room', { title : 'Room', user: req.user });
};