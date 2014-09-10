

$(function () {

  "use strict";

  var room = {};
  var socket = io('http://localhost');

  var MessageTypes = {
    plain: 'plain/text',
    file: 'file/text'
  };

  room.colorHandler = new global.ColorHandler({
    colorMap: {
      white: '#ffffff',
      admin: '#dddddd'
    }
  });  

  /**
   * function builds new message template and appends it to chat list
   * @param {[type]} data [description]
   */
  room.addMessage = function (data) {
    $('#message-container').append(global.templates.message({ 
      color: room.colorHandler.colorizeMessage(data.message.author),
      author: data.message.author,
      text: data.message.text
    }));
  };

  /**
   * function builds new file message template and appends it to the chat list
   */
  room.addFileLink = function (data) {
    console.log(data.message);

    $('#message-container').append(global.templates.fileMessage({
      color: room.colorHandler.colorizeMessage(data.message.author),
      author: data.message.author,
      text: data.message.text,
      download: data.message.text,
      link: data.message.link
    }));
  };

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

  /**
   * handler for file uploading
   */
  global.fileDropper.buildFrom({ input: $('#message-file'), drop: $('#message-drop') }).handle(function (event) {
    var file = event.target.files[0];
    var stream = ss.createStream();

    ss(socket).emit('file', stream, { type: file.type, size: file.size, name: file.name, author: global.user.login });
    ss.createBlobReadStream(file).pipe(stream);
  });

  socket.on('connect', function (data) {
    socket.emit('newuser', { name: global.user.login, room: global.room.name });
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
      if (message.itype == MessageTypes.plain) {
        room.addMessage({ message: message });
      }
      else if (message.itype == MessageTypes.file) {
        message.link = '/upload/' + message.text;
        room.addFileLink({ message: message });
      }
    });
  });

  /**
   * experimental file uploader
   */
  socket.on('newfilelink', function (data) {
    room.addFileLink({
      message: {
        author: data.user,
        text: data.filename,
        link: data.link
      }
    });
  });

  socket.on('newfileprogress', function (data) {
    console.log(data.progress);
  });

});