/* global $, InboxSDK */

'use strict';

var InboxWhenReady = InboxWhenReady || {};

console.log('InboxWhenReady loading...');

InboxWhenReady.App = (function () {

  var Analytics = InboxWhenReady.Analytics;
  var AppState = InboxWhenReady.Models.AppState;
  var AppStateController = InboxWhenReady.Controllers.AppState;
  var ExtensionStateController = InboxWhenReady.Controllers.ExtensionState;
  var FlashMessagesController = InboxWhenReady.Controllers.FlashMessages;
  var Storage = InboxWhenReady.Models.Storage;
  var Utils = InboxWhenReady.Utils;

  function bindListeners() {
    $(document).on('InboxWhenReady:appLoaded', function(e, from, to){
      console.log('Initialising InboxWhenReady...');
      var appName = AppState.get('meta', 'name');
      AppStateController.getBodyElement();
      AppStateController.updateActiveView();

      Analytics.init();

      // Flash messages are only supported on Gmail for now.
      if(appName === 'Gmail') {
        FlashMessagesController.init();
      }

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