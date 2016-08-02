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


InboxSDK.load('1.0', 'sdk_inboxwhenready_a2ecee1991').then(function(sdk){

  sdk.Router.handleListRoute(sdk.Router.NativeListRouteIDs.ANY_LIST, function(inboxView) {

    var currentRoute = sdk.Router.getCurrentRouteView();
    var currentRouteId = currentRoute.getRouteID();

    if(currentRouteId.indexOf('inbox') !== -1) {
      console.log('Inbox view is active');
      $('body').addClass('iwr-active-view--inbox');
    }
    else {
      console.log('Inbox view is inactive');
      $('body').removeClass('iwr-active-view--inbox');
    }

  });
});