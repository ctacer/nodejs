
module.exports.index = function(req, res) {
  res.render('index', { title : 'Home' });
};

module.exports.lobby = function(req, res) {
  res.render('lobby', { title : 'Lobby' });
};

module.exports.login = function(req, res) {
  res.render('login', { title : 'Login' });
};

module.exports.register = function(req, res) {
  res.render('register', { title : 'Register' });
};

module.exports.room = function(req, res) {
  res.render('room', { title : 'Room' });
};