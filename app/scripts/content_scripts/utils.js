'use strict';

var InboxWhenReady = InboxWhenReady || {};

InboxWhenReady.Utils = (function () {

  function publicGetDomElement(selector,match) {
    var matchedDomElements = document.querySelectorAll(selector);

    if(typeof match === 'undefined') {
      match = 0;
    }

    if(matchedDomElements.length !== 0) {
      if(typeof matchedDomElements[match] !== 'undefined') {
        return document.querySelectorAll(selector)[match];
      }
      else {
        console.info('InboxWhenReady: Selector "' + selector + '" matched one or more DOM elements, but less than the expected ' + (match + 1) + ' elements.');
        return false;
      }
    }
    else {
      console.info('InboxWhenReady: Selector "' + selector + '" did not match any DOM elements.');
      return false;
    }
  }

  var publicMethods = {
    getDomElement: publicGetDomElement
  };


  return publicMethods;

})();