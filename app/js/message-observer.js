

!function (exports) {
  
  /**
   * function constractor will build separate file uploading socket listener 
   * with `next` function as ticker
   */
  var ElementClosureFunction = function (props) {
    this.element = null;
    this.initCb = props.initCb;
    this.updateCb = props.updateCb;
    this.doneCb = props.doneCb;
  };

  /**
   * function calls at every event ticker
   */
  ElementClosureFunction.prototype.next = function (message) {
    if (!this.element && !message.done) {
      return this.element = this.initCb(message);
    }

    if (message.done) {      
      return this.doneCb(message, this.element);
    }

    this.updateCb(message, this.element);
  };

  exports.messageObserver = {};

  /**
   * function collects all message listeners as long as they are usefull
   */
  exports.messageObserver.getFunction = (function () {

    var messages = [];

    return function (message, props) {
      var id = message.text + message.author;

      if (messages.hasOwnProperty(id) && messages[id]) {
        messages[id].next(message);
      }
      else {
        messages[id] = new ElementClosureFunction({
          initCb: props.initCb,
          updateCb: props.updateCb,
          doneCb: function () {
            messages[id] = null;
            props.doneCb.apply({}, Array.prototype.slice.call(arguments, 0));
          }
        });

        messages[id].next(message);
      }
    };
  }) ();


} (global);