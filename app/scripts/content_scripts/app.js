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
    // Gmail users can open email messages in a new window. The loads a special view
    // called btop. The URL looks something like this:
    //
    //   https://mail.google.com/mail/u/0/?ui=2&view=btop&ver=1nnj51jn5rorm&search=inbox&th=1566105b2f12efcb&cvid=3
    //
    // There is no need to initialise Inbox When Ready on the btop view.

    var isBtopView = window.location.search.indexOf('view=btop') !== -1;

    if(!isBtopView) {
      AppStateController.init();
      bindListeners();
    }
  }

  var publicMethods = {
    init: publicInit
  };

  return publicMethods;

})();

InboxWhenReady.App.init();