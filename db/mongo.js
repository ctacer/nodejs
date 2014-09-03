
var logger = require(global.config.logger.dist)(module);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', function (err) {
    logger.error('connection error:', err.message);
});
db.once('open', function callback () {
    logger.info("Connected to DB!");
});


module.exports.user = require('./models/user.js') (mongoose);
module.exports.room = require('./models/room.js') (mongoose);