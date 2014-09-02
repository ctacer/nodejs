

//User.js

var logger = require(global.config.logger.dist)(module);

var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  login: String,
  password: String
});

/**
 * function will return a static user data 
 * without access to db functionality
 */
UserSchema.methods.map = function () {
  return {
    login: this.login,
    password: this.password
  };
};

var User = mongoose.model('User', UserSchema);



module.exports.find = function (user, cb) {
  var args = [];
  if (user && typeof user == 'object' && user.login) {
    args.push(user);
  }
  else if (typeof user == 'function') {
    cb = user;
  }
  if (!cb || typeof cb != 'function') {
    cb = function () {};
  }

  var callback = function (error, users) {
    if (error) { 
      logger.error(error);
      return cb();
    }

    cb(users);
  };

  args.push(callback);
  User.find.apply(User, args);
};

module.exports.save = function (userData, cb) {
  var user = new User(userData);
  user.save(cb);
};