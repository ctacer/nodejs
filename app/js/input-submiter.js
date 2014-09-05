

!function (exports) {
  
  "use strict";

  exports.inputSubmiter = {};

  exports.inputSubmiter.buildFrom = function (props) {

    var buildArgs = function () {
      return props;
    };

    var handler = function () {};

    props.button && props.button.off('click').on('click', function () {
      handler(buildArgs());
    });
    props.field && props.field.off('keyup').on('keyup', function (event) {
      if (event.keyCode == 13) {
        handler(buildArgs());
      }
    });

    return {
      'handle' : function (cb) {
        if (typeof cb == 'function') {
          handler = cb;
        }
      }
    };
  };

} (global);