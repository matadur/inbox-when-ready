/* global $ */

'use strict';

var InboxWhenReady = InboxWhenReady || {};

InboxWhenReady.Analytics = (function () {

  var AppState = InboxWhenReady.Models.AppState;
  var ExtensionState = InboxWhenReady.Models.ExtensionState;
  var Storage = InboxWhenReady.Models.Storage;

  function publicSendExtensionFirstLoadEvent() {
    var appName = AppState.get('meta', 'name');
    var extensionVersion = ExtensionState.get('meta', 'extensionVersion');

    var event = {
      'category' : appName,
      'action' : 'Extension loaded for the first time',
      'label' : extensionVersion
    };

    publicSendEvent(event);
  }

  function publicSendExtensionLoadedEvent() {
    var appName = AppState.get('meta', 'name');
    var extensionVersion = ExtensionState.get('meta', 'extensionVersion');
    var extensionLoadedCount = Storage.get('extensionLoadedCount');

    var event = {
      'category' : appName,
      'action' : 'Extension loaded',
      'label' : extensionVersion,
      'value' : extensionLoadedCount
    };

    publicSendEvent(event);
  }

  function bindListeners() {
    $(document).on('InboxWhenReady:extensionLoaded', function(e, from, to){
      InboxWhenReady.Analytics.sendExtensionLoadedEvent();
    });

    $(document).on('InboxWhenReady:extensionFirstLoaded', function(e, from, to){
      InboxWhenReady.Analytics.sendExtensionFirstLoadEvent();
    });
  }

  function publicInit() {
    bindListeners();
  }

  function publicSendEvent(event) {
    // Send to Google Analytics
    chrome.runtime.sendMessage(event, function() {
      // Do nothing.
    });
  }

  var publicMethods = {
    sendEvent: publicSendEvent,
    sendExtensionLoadedEvent: publicSendExtensionLoadedEvent,
    sendExtensionFirstLoadEvent: publicSendExtensionFirstLoadEvent,
    init: publicInit
  };


  return publicMethods;

})();