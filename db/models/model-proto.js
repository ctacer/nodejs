

//model-proto.js

/**
 * function builds find arguments depending on given arguments
 */
var buildFindArgs = function (condition, cb) {
  var args = [];
  if (condition && typeof condition == 'object') {
    args.push(condition);
  }
  else if (typeof condition == 'function') {
    cb = condition;
  }
  if (!cb || typeof cb != 'function') {
    cb = function () {};
  }

  args.push(buildFindCallback(cb));
  return args;
};

/**
 * function handls find errors and returns all found records
 */
var buildFindCallback = function (cb) {
  cb = cb || function () {};

  return function (error, result) {
    if (error) { 
      logger.error(error);
      return cb();
    }

    cb(result);
  };
};

module.exports = function (Model, logger) {
  return {

    'model' : Model,

    /**
     * function finds all records that matches condition, 
     * or just all records if none condition is specified
     */
    'find': function () {
      var args = buildFindArgs.apply(null, Array.prototype.slice.call(arguments, 0));      
      Model.find.apply(Model, args);
    },

    /**
     * function finds only one - first record that matches condition
     */
    'findOne': function (condition, cb) {
      var args = buildFindArgs.apply(null, Array.prototype.slice.call(arguments, 0));      
      Model.findOne.apply(Model, args);

      // var findCallback = function (records) {
      //   cb(records && records.length ? records[0] : null);
      // };

      // if (typeof condition == 'function') {
      //   cb = condition;
      //   this.find(findCallback);
      // }
      // else if (typeof cb == 'function') {
      //   this.find(condition, findCallback);
      // }
    },

    /**
     * function saves new record to the model
     */
    'save': function (data, cb) {
      var obj = new Model(data);
      obj.save(cb);
    }


  };
};