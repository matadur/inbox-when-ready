/* global $ */

'use strict';

var InboxWhenReady = InboxWhenReady || {};

console.log('InboxWhenReady loading...');

InboxWhenReady.App = (function () {

  var Analytics = InboxWhenReady.Analytics;
  var AppStateController = InboxWhenReady.Controllers.AppState;
  var ExtensionStateController = InboxWhenReady.Controllers.ExtensionState;
  var Storage = InboxWhenReady.Models.Storage;
  var Utils = InboxWhenReady.Utils;

  function bindListeners() {
    $(document).on('InboxWhenReady:appLoaded', function(e, from, to){
      console.log('Initialising InboxWhenReady...');
      AppStateController.getBodyElement();
      AppStateController.updateActiveView();

      Analytics.init();
      ExtensionStateController.init();
    });

    $(document).on('InboxWhenReady:extensionLoaded', function(e, from, to){
      console.log('InboxWhenReady has loaded.');
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