

$(function () {
  
  "use strict";

  var room = {};

  room.messageColors = {
    'white': '#ffffff',
    'admin': '#dddddd'
  };

  room.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return Math.random() > 0.5 ? color : '#dddddd';
  };

  room.colorExists = function (color) {
    for (var key in this.messageColors) {
      if (!this.messageColors.hasOwnProperty(key)) continue;

      if (this.messageColors[key] === color) return true;
    }

    return false;
  };

  room.generateNewColor = function () {
    var randColor = this.getRandomColor();

    while (this.colorExists(randColor)) {
      randColor = this.getRandomColor();
    }

    return randColor;
  };

  room.getMessageColor = function (author) {    
    if (this.messageColors.hasOwnProperty(author)) {
      return this.messageColors[author];
    }
    else {
      return this.messageColors[author] = this.generateNewColor();
    }
  };

  room.addMessage = function (data) {
    $('#message-container').append(
      '<span class="message"><span class="user" style="color: ' + room.getMessageColor(data.message.author) + '">' + data.message.author + '</span>: ' + data.message.text + '</span>'
    );
  };

  // var socket = io.connect('http://localhost');
  
  var socket = io('http://localhost');

  socket.on('connect', function (data) {
    socket.emit('newuser', { name: global.user.login, room: global.room.name });
  });

  /**
   * handler for message creation
   */
 global.inputSubmiter.buildFrom({ button: $('#create-message'), field: $('#message-text') }).handle(function (customEvent) {

    var messageText = customEvent.field.val();
    customEvent.field.val('');

    var message = { author: global.user.login, text: messageText };
    var reqData = {
      room: global.room.name,
      message: message
    };

    socket.emit('newmessage', reqData);
    room.addMessage(reqData);

  });


  socket.on('newmessage', function (data) {
    room.addMessage(data);
  });

  socket.on('userdisconnected', function (data) {
    room.addMessage({ message: { author: 'admin', text: 'user ' + data.user + ' just left chat room' } });
  });

  socket.on('userconnected', function (data) {
    room.addMessage({ message: { author: 'admin', text: 'user ' + data.user + ' just joined chat room' } });
  });

  socket.on('history', function (data) {
    data
      .sort(function (f, s) {
        return f.timestamp - s.timestamp;
      })
      .forEach(function (message) {
        room.addMessage({ message: message });
      });    
  });

});