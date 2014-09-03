

//model-proto.js

module.exports = function (Model, logger) {
  return {


    'find': function (data, cb) {
      var args = [];
      if (data && typeof data == 'object') {
        args.push(data);
      }
      else if (typeof data == 'function') {
        cb = data;
      }
      if (!cb || typeof cb != 'function') {
        cb = function () {};
      }

      var callback = function (error, result) {
        if (error) { 
          logger.error(error);
          return cb();
        }

        cb(result);
      };

      args.push(callback);
      Model.find.apply(Model, args);
    },

    'save': function (data, cb) {
      var obj = new Model(data);
      obj.save(cb);
    }


  };
};