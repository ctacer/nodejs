
var logger = require(global.config.logger.dist)(module);
var async = require('async');

module.exports.createRoom = function (req, res) {
  var roomName = req.body.roomName;
  logger.debug(roomName);

  async.waterfall([
    function (callback) {
      global.modules.db.room.find({ name: roomName }, function (data) {
        callback(null, data && data.length);
      });
    },
    function (exists, callback) {
      if (exists) {
        callback(null, { ok: false, error: new Error('room ' + roomName + 'already exists') });
      }
      else {
        global.modules.db.room.save({ name: roomName }, function (error) {
          callback(null, { ok: !error, error: error });
        });
      }
    },
    function (saveResult, callback) {
      global.modules.db.room.find(function (data) {
        saveResult.data = data;
        callback(null, saveResult);
      });
    }
  ], function (err, response) {
    res.send(response);
  });

};