

!function (exports) {
  
  "use strict";

  exports.inputSubmiter = {};

  /**
   * function binds submit events to submit button 
   * and enter hit on input field
   */
  exports.inputSubmiter.buildFrom = function (props) {

    var handler = function () {};

    props.button && props.button.off('click').on('click', function () {
      handler(props);
    });
    props.field && props.field.off('keyup').on('keyup', function (event) {
      if (event.keyCode == 13) {
        handler(props);
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

  exports.fileDropper = {};

  /**
   * function binds file selecting event to input[type=file] element 
   * and droppable element
   */
  exports.fileDropper.buildFrom = function (props) {

    var handler = function () {};

    props.input && props.input.off('change').on('change', function (event) {
      handler(event);
    });

    props.drop && props.drop.off('dragover').on('dragover', function handleDragOver(event) {
      event.stopPropagation && event.stopPropagation();
      event.preventDefault && event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });

    props.drop && props.drop.off('drop').on('drop', function (event) {
      event.stopPropagation && event.stopPropagation();
      event.preventDefault && event.preventDefault();

      handler({ 'target': { 'files': event.dataTransfer.files } });
    });

    return {
      'handle' : function (cb) {
        if (typeof cb == 'function') {
          handler = cb;
        }
      }
    };
  };

}) (global || window);