

//room.js

var logger = require(global.config.logger.dist)(module);

module.exports = function (mongoose) {
  var exports = {};

  var MessageTypes = {
    plain: 'plain/text',
    file: 'file/text'
  };

  var RoomSchema = mongoose.Schema({
    name: String,
    owner: String,
    timestamp: Number,
    messages: [{ itype: String, author: String, text: String, timestamp: Number }]
  });

  var Room = mongoose.model('Room', RoomSchema);

  /**
   * function finds room by name and adds new message to messages array
   */
  var saveMessage = function (roomName, message, cb) {
    this.findOne({ name: roomName }, function (room) {
      if (!room) { 
        logger.debug('no room "' + roomName + '" is found!');
        return cb();
      };

      room.messages.push({ author: message.author, itype: message.itype, text: message.text, timestamp: Date.now() });
      room.save(cb);
    });
  };

  exports.saveMessage = function (roomName, message, cb) {
    cb = cb || function () {};
    saveMessage.apply(this, [roomName, { author: message.author, itype: MessageTypes.plain, text: message.text, timestamp: Date.now() }, cb]);
  };

  exports.saveFileLink = function (roomName, message, cb) {
    cb = cb || function () {};
    saveMessage.apply(this, [roomName, { author: message.author, itype: MessageTypes.file, text: message.text, timestamp: message.timestamp || Date.now() }, cb]);
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