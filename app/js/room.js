

$(function () {
  
  "use strict";

  var room = {};

  room.addMessage = function (data) {
    $('#message-container').append(
      '<span class="message"><span class="user" style="color: #0A6">' + data.message.author + '</span>: ' + data.message.text + '</span>'
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
  $('#create-message').off('click').on('click', function (event) {
    var messageText = $('#message-text').val();
    $('#message-text').val('');

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

});