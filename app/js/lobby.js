

$(function () {
  
  "use strict";

  var lobby = {};
  var socket = io('http://localhost');

  lobby.rebuildRoomList = function (newList) {
    var list = $('#room-list');

    list.empty();

    newList
      .sort(function (f, s) {
        return f.timestamp - s.timestamp;
      })
      .forEach(function (item) {
        list.append(global.templates.roomItem({
          name: item.name,
          encodedName: encodeURIComponent(item.name)
        }));
      });
  };

  /**
   * handler for room creation,
   * function gets room name - checks if its already created and creates or rejects creation
   */
  global.inputSubmiter.buildFrom({ button: $('#create-room'), field: $('#room-name') }).handle(function (customEvent) {
    var roomName = customEvent.field.val();
    customEvent.field.val('');

    socket.emit('room', {
      roomName: roomName,
      owner: global.user.login
    });
  });

  socket.on('room', function (result) {
    lobby.rebuildRoomList(result.data);
  });


});