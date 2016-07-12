'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Models = InboxWhenReady.Models || {};

InboxWhenReady.Models.FlashMessages = (function () {

  var messages = [];

  function publicAdd(flashMessage) {
    messages.push(flashMessage);
  }

  function publicGet(categoryKey, key) {
    return messages;
  };

  function publicSet(categoryKey, key, value) {
    return state[categoryKey][key] = value;
  };

  var publicMethods = {
    add : publicAdd,
    get : publicGet,
    set : publicSet
  };

  return publicMethods;

}());