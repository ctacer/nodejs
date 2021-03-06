

(function (exports) {
  
  "use strict";

  /**
   * function builds array of { key, value } objects from given `obj` object
   */
  var buildPropsArray = function (obj) {
    obj = obj || {};

    var props = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        props.push({ key: key, value: obj[key] });
      }
    }

    return props;
  };

  /**
   * function replaces all found templates in given string using given template
   */
  String.prototype.replaceTemplate = function (prop) {
    var pattern = '%' + prop.key + '%';
    var index = this.indexOf(pattern);
    var newStr = this;

    while (index != -1) {
      newStr = this.substring(0, index) + prop.value + this.substring(index +pattern.length);
      index = newStr.indexOf(pattern);
    }

    return newStr;
  };

  /**
   * function creates closure for given template and returns 'render' function
   */
  var buildTemplate = function (template) {
    return function (opts) {
      var copy = template;
      var props = buildPropsArray(opts).forEach(function (prop) {
        copy = copy.replaceTemplate(prop);
      });

      return copy
    };
  };


  /**
   * array of available templates
   */
  var templates = {};

  templates['message'] = buildTemplate([
    '<span class="message"><span class="user" style="color: %color%">%author%</span>: %text%</span>'
  ].join(''));

  templates['fileMessage'] = buildTemplate([
    '<span class="file-message"><span class="user" style="color: %color%">%author%</span class="file-link">: <a download="%download%" href="%link%">%text%</a></span>'
  ].join(''));

  templates['roomItem'] = buildTemplate([
    '<a class="list-group-item" href="/room?name=%encodedName%">%name%</a>'
  ].join(''));

  templates['fileUpload'] = buildTemplate([
    '<span class="message"><span class="user" style="color: %color%">%author%</span>: ' +
      '<span>Uploading %text% in progress: <span class="upload-process">%progress%</span> %</span>' +
    '</span>'
  ].join(''));

  templates['fileWait'] = buildTemplate([
    '<span class="message"><span class="user" style="color: %color%">%author%</span>: ' +
      '<span>Wailting for %text% link: <span class="upload-process">%progress%</span> %</span>' + 
    '</span>'
  ].join(''));

  exports.templates = templates;

}) (global || window);