

//room.js

var logger = require(global.config.logger.dist)(module);

module.exports = function (mongoose) {
  var exports = {};

  var RoomSchema = mongoose.Schema({
    name: String,
    owner: String,
    messages: [{ author: String, text: String, timestamp: Number }]
  });

  var Room = mongoose.model('Room', RoomSchema);

  /**
   * function finds room by name and adds new message to messages array
   */
  exports.saveMessage = function (roomName, message, cb) {
    cb = cb || function () {};

    this.findOne({ name: roomName }, function (room) {
      if (!room) { 
        logger.debug('no room "' + roomName + '" is found!');
        return cb();
      };

      room.messages.push({ author: message.author, text: message.text, timestamp: Date.now() });
      room.save(cb);
    });
  };

  /**
   * function finds room record by name and returns its message history
   */
  exports.getHistory = function (roomName, cb) {
    cb = cb || function () {};

    this.findOne({ name: roomName }, function (room) {
      if (!room) { 
        logger.debug('no room "' + roomName + '" is found!');
        return cb([]);
      };

      cb(room.messages);
    });
  };

  exports.__proto__ = require('./model-proto') (Room, logger);
  return exports;
};