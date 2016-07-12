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
    $(document).on('InboxWhenReady:extensionLoaded', function(){
      InboxWhenReady.Analytics.sendExtensionLoadedEvent();
    });

    $(document).on('InboxWhenReady:extensionFirstLoaded', function(){
      InboxWhenReady.Analytics.sendExtensionFirstLoadEvent();
    });

    $(document).on('InboxWhenReady:flashMessageSeen', function(e, flashMessageId){
      var appName = AppState.get('meta', 'name');

      // Send tracking event
      var event = {
        'category' : appName,
        'action' : 'Saw flash message',
        'label' : flashMessageId
      };

      InboxWhenReady.Analytics.sendEvent(event);
    });


    $(document).on('InboxWhenReady:flashMessageFollow', function(e, flashMessageId){
      var appName = AppState.get('meta', 'name');

      // Send tracking event
      var event = {
        'category' : appName,
        'action' : 'Followed flash message',
        'label' : flashMessageId
      };

      InboxWhenReady.Analytics.sendEvent(event);
    });

    $(document).on('InboxWhenReady:flashMessageSuppress', function(e, flashMessageId){
      var appName = AppState.get('meta', 'name');

      // Send tracking event
      var event = {
        'category' : appName,
        'action' : 'Suppressed flash message',
        'label' : flashMessageId
      };

      InboxWhenReady.Analytics.sendEvent(event);
    });

    $(document).on('InboxWhenReady:flashMessageSuppressForever', function(e, flashMessageId){
      var appName = AppState.get('meta', 'name');

      // Send tracking event
      var event = {
        'category' : appName,
        'action' : 'Suppressed flash message forever',
        'label' : flashMessageId
      };

      InboxWhenReady.Analytics.sendEvent(event);
    });
  }

  function publicInit() {
    bindListeners();
  }

  function publicSendEvent(event) {
    // Event label must be a string, otherwise Google Analytics will reject the event.
    if(!isNaN(event.label)) {
      event.label = event.label.toString();
    }

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