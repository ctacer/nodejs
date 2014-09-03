

//user.js

var logger = require(global.config.logger.dist)(module);

module.exports = function (mongoose) {

  var exports = {};

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

  exports.mea = function () {
    logger.log('mea');
  };

  exports.__proto__ = require('./model-proto') (User, logger);
  return exports;
};