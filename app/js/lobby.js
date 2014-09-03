

$(function () {
  
  "use strict";

  /**
   * handler for rocreation,
   * function gets room name - checks if its already created and creates or rejects creation
   */
  $('#create-room').off('click').on('click', function (event) {
    var roomName = $('#room-name').val();

    console.log(roomName);
  });

});