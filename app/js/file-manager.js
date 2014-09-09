
(function (exports) {

  "use strict";

  var fileManager = {};

  fileManager.getFileLink = function (opts) {
    opts = opts || {};

    var blob, blobException, generalException, fileHref;

    /**
     * set of different strategies for building file url by its buffer meta-data
     */
    var strategies = [

      function () {
        blob = new Blob([buffer]);
        blob.type = opts.type;
        return (window.URL || window.webkitURL).createObjectURL(blob);
      },

      function () {
        blob = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
        blob.append(opts.buffer);
        blob = blob.getBlob(opts.type);
        return (window.URL || window.webkitURL).createObjectURL(blob);
      },

      function () {
        return 'data:' + opts.type + ',' + encodeURIComponent(opts.buffer);
      }

    ];

    var url;
    for (var i = 0; i < strategies.length; i++) {      
      try {
        url = strategies[i] ();
      }
      catch (ex) {
        continue;
      }

      if (url) {
        return url;
      }
    };
  }

  exports.fileManager = fileManager;

}) (global || window);