

$(function () {

  "use strict";

  var room = {};
  var socket = io('http://localhost');

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

    ss(socket).emit('file', stream, { size: file.size, name:file.name, author: global.user.login });
    ss.createBlobReadStream(file).pipe(stream);

    /*var reader = new FileReader();
    reader.onload = function(evt){

      socket.emit('userfile', { 
        link: evt.target.result,
        author: global.user.login,
        file: {
          name: file.name,
          type: file.type
        }
      });
    };

    reader.readAsDataURL(file); */
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
      room.addMessage({ message: message });
    });    
  });




  /**
   * experimental file uploader
   */
  socket.on('userfile', function (data) {
    var proceed = function (dataUrl) {
      room.addFileLink({
        message: {
          author: data.author,
          text: data.file.name,
          link: dataUrl
        }
      });
    };

    var reader = new FileReader();
    reader.onload = function(e) {
      proceed(e.target.result);
    };
    reader.readAsDataURL(data.link);
  });

  ss(socket).on('newfile', function (stream, opts) {
    var result = [];
    var parts = [];

    stream.on('data', function (buffer) {      
      // var reader = new FileReader();
      // reader.onload = function(e) {
      //   result.push(e.target.result);
      // };
      // var blob = new Blob([buffer]);
      parts.push(buffer);
      // reader.readAsText(blob);
    });

    stream.on('end', function () {
      // console.log(result.join(''));

      //
      // var link = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));

      var proceed = function (dataUrl) {
        room.addFileLink({
          message: {
            author: opts.author,
            text: opts.name,
            link: dataUrl
          }
        });
      };

      var reader = new FileReader();
      reader.onload = function(e) {
        proceed(e.target.result);
      };
      reader.readAsDataURL(new Blob(parts));

      // room.addFileLink({
      //   message: {
      //     author: opts.author,
      //     text: opts.name,
      //     link: link
      //   }
      // });


      /*global.fileManager.saveFile({
        name: opts.name,
        text: result.join(''),
        useBlob: true
      });*/
  });
    
  });

});