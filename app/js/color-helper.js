

!function (exports) {
  
  "use strict";

  var ColorHandler = function (props) {
    props = props || {};

    this.privates = {};
    this.privates.colorMap = props.colorMap || {};
  };  

  /**
   * function returns new random color
   */
  ColorHandler.prototype.random = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return Math.random() > 0.5 ? color : '#dddddd';
  };

  /**
   * function returns true if given color is already in use
   */
  ColorHandler.prototype.exists = function (color) {
    for (var key in this.privates.colorMap) {
      if (!this.privates.colorMap.hasOwnProperty(key)) continue;

      if (this.privates.colorMap[key] === color) return true;
    }

    return false;
  };

  /**
   * function generates new color
   */
  ColorHandler.prototype.generate = function () {
    var randColor = this.getRandomColor();

    while (this.exists(randColor)) {
      randColor = this.getRandomColor();
    }

    return randColor;
  };

  /**
   * function returns color assosiated with given key
   * if key does not have any assosiated color - function generates new assosiation anr returns it
   */
  ColorHandler.prototype.colorizeMessage = function (author) {    
    if (this.privates.colorMap.hasOwnProperty(author)) {
      return this.privates.colorMap[author];
    }
    else {
      return this.privates.colorMap[author] = this.generateNewColor();
    }
  };

  exports.ColorHandler = ColorHandler;

}) (global || window);