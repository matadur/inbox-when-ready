'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Models = InboxWhenReady.Models || {};

InboxWhenReady.Models.Storage = (function () {

  var storage = {};
  storage.flashMessageLog = [];

  function publicSet(key, value) {
    var userData = {};
    userData[key] = value;
    chrome.storage.sync.set( userData, function() {
      // Do nothing.
    });

    // Also save locally, so it's immediately available
    storage[key] = value;
  }

  function publicGet(key) {
    var value = null;

    if(storage.hasOwnProperty(key)) {
      value = storage[key];
    }
    else {
      console.warn('Could not get data for key "' + key + '" from storage.');
    }

    return value;
  }

  function publicInit() {
    chrome.storage.sync.get(null, function(items) {
      if (!chrome.runtime.error) {
        // We loaded the user data from storage succesfully.
        // Make it all available locally.
        storage = items;
      }
      else {
        console.error('Could not get data for key "' + key + '" from storage.');
      }
    });
  }

  var publicMethods = {
    init: publicInit,
    get: publicGet,
    set: publicSet
  }

  return publicMethods;
}());

InboxWhenReady.Models.Storage.init();