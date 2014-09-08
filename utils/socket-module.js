
var logger = require(global.config.logger.dist)(module);

var ChatRooms = function () {
  this.privates = {
    rooms: {},
    idChars: "qwertyuiopasdfghjklzxcvbnm1234567890"
  };
};

/**
 * function generates user id
 */
ChatRooms.prototype.getId = function (socket) {
  var str = "";
  var source = this.privates.idChars;

  var getChar = function () {
    return source[Math.round(Math.random() * (source.length - 1))];
  };

  for (var i = 0; i < 8; i++) {
    str += getChar();
  };
  return socket.userName + '-' + str + '-' + Date.now();
};

/**
 * function emits event on every member of chat room
 * @param  {[type]} socket [scoket that throws event]
 * @param  {[type]} args [array that will be passed as arguments to emit method]
 */
ChatRooms.prototype.emit = function (socket, args, socketWrapper) {
  if (this.privates.rooms.hasOwnProperty(socket.roomName)) {
    this.privates.rooms[socket.roomName].forEach(function (member) {      
      if (member.userId != socket.userId) {
        socketWrapper && typeof socketWrapper == 'function' ? socketWrapper(member, args) : member.emit.apply(member, args);
      }
    });
  }
};

/**
 * function adds user to chat room
 */
ChatRooms.prototype.connect = function (connectionData, socket) {
  socket.userName = connectionData.name;
  socket.roomName = connectionData.room;
  socket.userId = this.getId(socket);

  if (!this.privates.rooms[connectionData.room]) this.privates.rooms[connectionData.room] = [];

  this.privates.rooms[connectionData.room].push(socket);
};

/**
 * function removes socket from its chat room
 */
ChatRooms.prototype.disconnect = function (socket) {
  if (!this.privates.rooms[socket.roomName]) return;

  this.privates.rooms[socket.roomName] = this.privates.rooms[socket.roomName].filter(function (member) {
    return member.userId !== socket.userId;
  });
};

/**
 * function saves new message to the room model at db
 */
ChatRooms.prototype.saveMessage = function (socket, messageData) {
  global.modules.db.room.saveMessage(socket.roomName, messageData, function () {
    // logger.debug('saveMessage');
  });
};

/**
 * function will return all messages for given socket
 */
ChatRooms.prototype.getHistory = function (socket, cb) {
  global.modules.db.room.getHistory(socket.roomName, cb);
};


module.exports = function (server) {

  var io = require('socket.io') (server);  
  var ss = require('socket.io-stream');
  var path = require('path');
  var fs = require('fs');

  var chatRooms = new ChatRooms();
  
  io.on('connection', function (socket) {

    /**
     * listener for new message - 
     * function saves message data to the db and broadcast to other room's users
     */
    socket.on('newmessage', function (data) {
      chatRooms.emit(socket, ['newmessage', data]);
      chatRooms.saveMessage(socket, data.message);
    });

    /**
     * listener will register new user, collect all history for selected room
     * and sends to all room's users 'new user connected' message, and history data to connceted user
     */
    socket.on('newuser', function (connectionData) {
      chatRooms.connect(connectionData, socket);

      chatRooms.emit(socket, ['userconnected', { user: socket.userName }]);
      chatRooms.getHistory(socket, function (history) {
        socket.emit('history', history);
      });
    });

    /**
     * listener for disconnection of the user - 
     * broadcasts to all room's users user disconnected message,
     * and removes user from chat room instance
     */
    socket.on('disconnect', function () {
      chatRooms.emit(socket, ['userdisconnected', { user: socket.userName }]);
      chatRooms.disconnect(socket);
    });

    /**
     * experimental file streaming
     */
    ss(socket).on('file', function(stream, data) {
      var filename = path.basename(data.name);
      logger.debug('stream file ' + filename);
      var newStream = ss.createStream();      

      chatRooms.emit(socket, ['newfile', { user: socket.userName }], function (member, args) {
        logger.debug(member.userName);
        ss(member).emit('newfile', newStream, data);
      });
      stream.pipe(newStream);
    });
    
  });

};