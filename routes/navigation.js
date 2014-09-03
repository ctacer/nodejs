
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

module.exports.test = function (req, res) {
  global.modules.db.user.find({ login: 'user1' }, function (result) {
    res.render('test', { title : 'Test', user: req.user, data: result });
  });
};

module.exports.lobby = function(req, res) {
  res.render('lobby', { title : 'Lobby', user: req.user });
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