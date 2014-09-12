

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

  room.fillColor = function (message) {
    message.color = room.colorHandler.colorizeMessage(message.author);
  };

  /**
   * function builds new message template and appends it to chat list
   */
  room.addMessage = function (message) {
    room.fillColor(message);

    $('#message-container').append(global.templates.message(message));
  };

  /**
   * function builds new file message template and appends it to the chat list
   */
  room.addFileLink = function (message, element) {
    room.fillColor(message);
    message.download = message.text;

    if (!element) {
      $('#message-container').append(global.templates.fileMessage(message));
    }
    else {
      element.empty();
      element.append(global.templates.fileMessage(message));
    }
  };

  room.addFileUpload = function (message) {
    room.fillColor(message);
    message.progress = message.progress || 0;

    var element = $('<div class="file-upload-container"></div>');
    $('#message-container').append(element);
    element.append(global.templates.fileUpload(message));
    return element;
  };

  room.updateFileUpload = function (message, element) {
    room.fillColor(message);
    message.progress = message.progress || 0;

    element.empty();
    element.append(global.templates.fileUpload(message));
    return element;
  };

  room.addFileWaitingLink = function (message) {
    room.fillColor(message);
    message.progress = message.progress || 0;

    var element = $('<div class="file-wait-container">gg</div>');
    $('#message-container').append(element);
    element.append(global.templates.fileWait(message));    
    return element;
  };

  room.updateFileWaitingLink = function (message, element) {
    room.fillColor(message);
    message.progress = message.progress || 0;

    element.empty();
    element.append(global.templates.fileWait(message));
    return element;
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
    room.addMessage(message);

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

  /**
   * listeners for socket events
   */
  socket.on('connect', function (data) {
    socket.emit('newuser', { name: global.user.login, room: global.room.name });
  });

  socket.on('newmessage', function (data) {
    room.addMessage(data.message);
  });

  socket.on('userdisconnected', function (data) {
    // room.addMessage({ author: 'admin', text: 'user ' + data.user + ' just left chat room' });
  });

  socket.on('userconnected', function (data) {
    // room.addMessage({ author: 'admin', text: 'user ' + data.user + ' just joined chat room' });
  });

  /**
   * loads all room history
   */
  socket.on('history', function (data) {
    data
    .sort(function (f, s) {
      return f.timestamp - s.timestamp;
    })
    .forEach(function (message) {
      if (message.itype == MessageTypes.plain) {
        room.addMessage(message);
      }
      else if (message.itype == MessageTypes.file) {
        message.link = '/upload/' + message.author + '/' + message.text;
        room.addFileLink(message);
      }
    });
  });
  

  /**
   * listener for file progress event (when other user uploads file to the server)
   */
  socket.on('newfileprogress', function (message) {
    global.messageObserver.getFunction(message, {
      initCb: room.addFileWaitingLink,
      updateCb: room.updateFileWaitingLink,
      doneCb: room.addFileLink
    });    
  });

  /**
   * listener for file upload event (when current user choose file to upload on the server)
   */
  socket.on('fileuploadprogress', function (message) {
    global.messageObserver.getFunction(message, {
      initCb: room.addFileUpload,
      updateCb: room.updateFileUpload,
      doneCb: room.addFileLink
    });
  });

});