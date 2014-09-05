

$(function () {
  
  "use strict";

  var lobby = {};

  lobby.rebuildRoomList = function (newList) {
    var list = $('#room-list');

    list.empty();
    newList.forEach(function (item) {
      list.append('<a class="list-group-item" href="/room?name=' + encodeURIComponent(item.name) + '">' + item.name + '</a>');
    });
  };

  /**
   * handler for room creation,
   * function gets room name - checks if its already created and creates or rejects creation
   */
  global.inputSubmiter.buildFrom({ button: $('#create-room'), field: $('#room-name') }).handle(function (customEvent) {
    var roomName = customEvent.field.val();
    customEvent.field.val('');

    var promise = $.ajax({
      url: '/room',
      type: 'PUT',
      data: { 'roomName' : roomName }
    });

    promise
      .success(function (result) {
        console.log(result);
        lobby.rebuildRoomList(result.data);
      })
      .error(function (error) {
        console.error(error);
        //show error message
      });
  });



});