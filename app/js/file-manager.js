
(function (exports) {

  "use strict";

  var config = {
    'saveFileId' : 'room-file-link',
    'saveFileName' : 'new file.txt'
  };

  //<a hidden id=​"savelink" download=​"i.txt">​</a>​

  var saveFile = function (savingOptions) {
    savingOptions = savingOptions || {};

    var buildSimpleFileLink = function (text) {
      return 'data:text/plain,' + encodeURIComponent(text);
    };

    var saveFileByLink = function (href) {
      link.attr('href', href);
      link.get(0).click();
    }

    var link = jQuery("#" + config.saveFileId);
    link.attr('download', savingOptions.name || 'new file');
    var plainText = savingOptions.text || "";

    var blob, blobException, generalException, fileHref;

    try {
      if(savingOptions.useBlob) {
        try {
          blob = new Blob([plainText]);
          blob.type = 'text/plain';
        } catch(exception) {
          blobException = exception;
          console.log(exception);
          blob = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
          blob.append(plainText);
          blob = blob.getBlob('text/plain');
        }
        fileHref = (window.URL || window.webkitURL).createObjectURL(blob);
        if(fileHref !== fileHref + '') {
          console.log('createObjectURL returned ' + fileHref);
          saveFileByLink(buildSimpleFileLink(plainText));
        }
        else {          
          saveFileByLink(fileHref);
        }       
      } else {
        saveFileByLink(buildSimpleFileLink(plainText));
      }     
    } 
    catch(exception) {
      console.log(blobException || exception);
      saveFileByLink(buildSimpleFileLink(plainText));
    }
  }

  exports.fileManager = {};
  exports.fileManager.saveFile = saveFile;

}) (global);