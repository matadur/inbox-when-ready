/* global $ */

'use strict';

var InboxWhenReady = InboxWhenReady || {};

console.log('InboxWhenReady loading...');

InboxWhenReady.App = (function () {

  var Analytics = InboxWhenReady.Analytics;
  var AppStateController = InboxWhenReady.Controllers.AppState;
  var ExtensionStateController = InboxWhenReady.Controllers.ExtensionState;
  var FlashMessagesController = InboxWhenReady.Controllers.FlashMessages;
  var Storage = InboxWhenReady.Models.Storage;
  var Utils = InboxWhenReady.Utils;

  function bindListeners() {
    $(document).on('InboxWhenReady:appLoaded', function(e, from, to){
      console.log('Initialising InboxWhenReady...');
      AppStateController.getBodyElement();
      AppStateController.updateActiveView();

      Analytics.init();
      FlashMessagesController.init();
      ExtensionStateController.init();
    });
  }

  function publicInit() {
    AppStateController.init();
    bindListeners();
  }

  var publicMethods = {
    init: publicInit
  };

  return publicMethods;

})();

InboxWhenReady.App.init();