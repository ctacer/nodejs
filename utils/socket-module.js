
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
ChatRooms.prototype.emit = function (socket, args) {
  if (this.privates.rooms.hasOwnProperty(socket.roomName)) {
    this.privates.rooms[socket.roomName].forEach(function (member) {      
      if (member.userId != socket.userId) {
        member.emit.apply(member, args);
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


module.exports = function (server) {

  var io = require('socket.io') (server);  

  var chatRooms = new ChatRooms();
  
  io.on('connection', function (socket) {

    socket.on('newmessage', function (data) {
      chatRooms.emit(socket, ['newmessage', data]);
    });

    socket.on('newuser', function (connectionData) {
      chatRooms.connect(connectionData, socket);      
      //broadcast new user
    });

    socket.on('disconnect', function () {

      // broadcast user disconnect
      // socket.userName;
      // socket.roomName;
      
      chatRooms.disconnect(socket);
    });
    
  });

};