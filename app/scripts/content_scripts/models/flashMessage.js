'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Models = InboxWhenReady.Models || {};

InboxWhenReady.Models.FlashMessage = (function () {

  var state = {};
  state.app = null; // InboxByGmail or Gmail
  state.appIsLoaded = false;
  state.activeView = null;
  state.inboxHidden = true;
  state.actionBarInterval = false;
  state.inboxLabelChecker = false;
  state.mustReInit = false;

  return state;

  function publicGet(categoryKey, key) {
    return state[categoryKey][key];
  };

  function publicSet(categoryKey, key, value) {
    return state[categoryKey][key] = value;
  };

  var publicMethods = {
    get : publicGet,
    set : publicSet
  };

  return publicMethods;

}());