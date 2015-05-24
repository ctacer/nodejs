
var logger = require(global.config.logger.dist)(module);
var fs = require('fs');
var async = require('async');

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

ChatRooms.prototype.emitSocket = function (socket, args, socketWrapper) {
  socketWrapper && typeof socketWrapper == 'function' ? socketWrapper(socket, args) : socket.emit.apply(socket, args);
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

ChatRooms.prototype.getMembersCount = function (socket) {
  if (!this.privates.rooms[socket.roomName]) return 0;
  return this.privates.rooms[socket.roomName].length;
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
  global.modules.db.room.saveMessage(socket.roomName, messageData, function () { });
};

/**
 * function saves link to sent files as a message
 */
ChatRooms.prototype.saveFileLink = function (socket, messageData) {
  global.modules.db.room.saveFileLink(socket.roomName, messageData, function () { });
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

    socket.on('message', function (data) {
      chatRooms.emit(socket, ['message', data]);
    });

    socket.on('initiateCall', function (data) {
      chatRooms.emit(socket, ['watingForAnswer', data]);
    });

    /**
     * listener will register new user, collect all history for selected room
     * and sends to all room's users 'new user connected' message, and history data to connceted user
     */
    socket.on('newuser', function (connectionData) {
      chatRooms.connect(connectionData, socket);

      chatRooms.emitSocket(socket, ['roomMembers', { membersCount: chatRooms.getMembersCount(socket) }]);
      chatRooms.emit(socket, ['userconnected', { user: socket.userName, membersCount: chatRooms.getMembersCount(socket) }]);
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
      chatRooms.emit(socket, ['userdisconnected', { user: socket.userName, membersCount: chatRooms.getMembersCount(socket) }]);
      chatRooms.disconnect(socket);
    });

    /**
     * listener for new room creation
     * function will save new room if it does not exists already 
     * and broadcast new room list to all users
     */
    socket.on('room', function (data) {
      var roomName = data.roomName;

      async.waterfall([
        /**
         * function checks if room already exists
         * and call next cb with boolean result
         */
        function (callback) {
          global.modules.db.room.find({ name: roomName }, function (data) {
            callback(null, data && data.length);
          });
        },

        /**
         * function calls new cb if room already exists, 
         * otherwise creates new room instance and procceds
         */
        function (exists, callback) {
          if (exists) {
            callback(null, { ok: false, error: new Error('room ' + roomName + 'already exists') });
          }
          else {
            global.modules.db.room.save({ name: roomName, timestamp: Date.now(), owner: data.owner }, function (error) {
              callback(null, { ok: !error, error: error });
            });
          }
        },

        /**
         * function retrieves all existed rooms and ands 'wateflow'
         */
        function (saveResult, callback) {
          global.modules.db.room.find(function (data) {
            saveResult.data = data;
            callback(null, saveResult);
          });
        }
      ], 

      /**
       * main callback will be called with error if at any steps we had some errors
       * otherwise we will have response object to send to the users
       */
      function (err, response) {
        io.emit('room', response);
      });
    });

    /**
     * listener for file stream:
     * whenever user starts uploading a file, listener will capture event, creates path on server, creates file and starts write steaming
     * that server listens to write ticker to send progress to uploader and other room members
     * when file is fully uploaded similat events with flag `done` will be sent to all room members, so they can have link to the file
     */
    ss(socket).on('file', function(stream, data) {
      var filename = path.basename(data.name);
      var size = 0;
      var timeCreation = Date.now();
      var writer;

      createPath(global.__dirname + '/upload/' + socket.userName);

      writer = fs.createWriteStream(global.__dirname + '/upload/' + socket.userName + '/' + filename);
      stream.pipe(writer);      

      stream.on && stream.on('data', function (chunk) {
        size += chunk.length;
        var progress = Math.floor(size / data.size * 100);

        var message = { author: socket.userName, text: filename, progress: progress };

        chatRooms.emit(socket, ['newfileprogress', message ]);
        chatRooms.emitSocket(socket, ['fileuploadprogress', message ]);
      });

      writer.on('finish', function() {
        var message = { done: true, author: socket.userName, text: filename, link: '/upload/' + stream.userName + '/' + filename };

        chatRooms.emit(socket, ['newfileprogress', message ]);
        chatRooms.emitSocket(socket, ['fileuploadprogress', message ]);
        chatRooms.saveFileLink(socket, { author: socket.userName, text: filename, timestamp: timeCreation });
      });
    });

    /**
     * function check if path exists and if do not - creates
     */
    function createPath (path) {
      var exists = fs.existsSync(path);
      if (!exists) {
        fs.mkdirSync(path);
      }
    }
    
  });

};