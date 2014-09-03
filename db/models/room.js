

//room.js

var logger = require(global.config.logger.dist)(module);

module.exports = function (mongoose) {
  var exports = {};

  var RoomSchema = mongoose.Schema({
    name: String,
    owner: String,
    messages: Array
  });

  var Room = mongoose.model('Room', RoomSchema);


  exports.__proto__ = require('./model-proto') (Room, logger);
  return exports;
};