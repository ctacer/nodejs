

//room.js

var logger = require(global.config.logger.dist)(module);

module.exports = function (mongoose) {
  var exports = {};

  var MessageSchema = mongoose.Schema({
    author: String,
    text: String,
    timestamp: Number
  });

  var Message = mongoose.model('Message', MessageSchema);


  exports.__proto__ = require('./model-proto') (Message, logger);
  return exports;
};