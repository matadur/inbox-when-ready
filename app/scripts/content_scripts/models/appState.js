'use strict';

/**
 * In which we model the state of Gmail / Inbox by Gmail.
 */

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Models = InboxWhenReady.Models || {};

InboxWhenReady.Models.AppState = (function () {

  var state = {};
  state.isLoaded = false;
  state.activeView = null;

  state.meta = {};
  state.meta.name = null; // InboxByGmail or Gmail

  state.dom = {};
  state.dom.$documentBody = null;
  state.dom.$inboxLink = null;
  state.dom.$inboxLinkWithoutUnreadCount = null;
  state.dom.$inbox = null;
  state.dom.$inboxCount = null;
  state.dom.$inboxWrapper = null;
  state.dom.$moreActionsMenu = null;

  state.domSelectors = {};

  state.labels = {};
  state.labels.inboxLink = null;
  state.labels.inboxViewPageTitle = null;


  function isGmailInboxViewActive() {
    var activeView = publicGet(null, 'activeView');

    var isGmailInboxViewActive = activeView === '#inbox' || activeView.indexOf('#inbox?compose=') !== -1;
    return isGmailInboxViewActive;
  }

  function isInboxByGmailInboxViewActive() {
    var activeView = publicGet(null, 'activeView');
    var isInboxByGmailInboxViewActive = activeView === '/';
    return isInboxByGmailInboxViewActive;
  }

  function publicIsInboxViewActive() {
    var isInboxViewActive = isGmailInboxViewActive() || isInboxByGmailInboxViewActive();
    return isInboxViewActive;
  }

  function publicGet(categoryKey, key) {
    var value = null;
    var isSet = null;

    if(categoryKey) {
      isSet = typeof state[categoryKey] !== 'undefined' && state[categoryKey][key] !== 'undefined';

      if(isSet) {
        value = state[categoryKey][key];
      }
    }
    else {
      isSet = typeof state[key] !== 'undefined';

      if(isSet) {
        value = state[key];
      }
    }

    if(!value) {
      console.warn('AppState.get("' + categoryKey + '", "' + key + '") returned a null value.')
    }

    return value;
  };

  function publicSet(categoryKey, key, value) {
    var categoryIsValid = null;

    if(categoryKey) {
      categoryIsValid = typeof state[categoryKey] !== 'undefined';

      if(categoryIsValid) {
        state[categoryKey][key] = value;
      }
      else {
        console.error('AppState.set() was given an invalid category key: ' + categoryKey);
      }
    }
    else {
      state[key] = value;
    }

    return value;
  };

  var publicMethods = {
    get : publicGet,
    set : publicSet,
    isInboxViewActive: publicIsInboxViewActive
  };

  return publicMethods;

}());