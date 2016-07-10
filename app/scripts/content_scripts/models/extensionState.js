'use strict';

/**
 * In which we model the state of Inbox When Ready extension.
 */

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Models = InboxWhenReady.Models || {};

InboxWhenReady.Models.ExtensionState = (function () {

  var state = {};
  state.isInboxHidden = true;
  state.actionBarInterval = false;
  state.inboxLabelChecker = false;
  state.mustReInit = false;

  state.meta = {};
  state.meta.extensionVersion = null;

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

    if(value === null) {
      console.warn('ExtensionState.get("' + categoryKey + '", "' + key + '") returned null value.')
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
    set : publicSet
  };

  return publicMethods;

}());