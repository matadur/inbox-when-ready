'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Controllers = InboxWhenReady.Controllers || {};

InboxWhenReady.Controllers.FlashMessages = (function () {
    var Analytics = InboxWhenReady.Analytics;
    var AppState = InboxWhenReady.Models.AppState;
    var FlashMessages = InboxWhenReady.Models.FlashMessages;
    var Storage = InboxWhenReady.Models.Storage;
    var Utils = InboxWhenReady.Utils;

    function addFlashMessage(id, title, content) {
      var flashMessage = {
        'id' : id,
        'title' : title,
        'content' : content
      };

      FlashMessages.add(flashMessage);
    }

    function showFlashMessages() {
      var flashMessages = FlashMessages.get();
      var flashMessageToShow = null;

      // Deliberately show one at most.
      flashMessages.forEach(function(flashMessage, index) {
        if(publicCanShowFlashMessage(flashMessage.id)) {
          flashMessageToShow = flashMessage;
        }
      });

      if(flashMessageToShow) {
        addFlashMessageToDom(flashMessageToShow);
      }
    }

    function addFlashMessageToDom(flashMessage) {
      var Utils = InboxWhenReady.Utils;
      var $inboxWrapper = AppState.get('dom', '$inboxWrapper');

      // Add the message to the DOM
      var flashMessageNode = document.createElement('div');
      flashMessageNode.className = 'iwr-flash-message';
      flashMessageNode.id = 'iwr_flash_message_' + flashMessage.id;

      var heading = document.createElement('h2');
      var headingText = document.createTextNode(flashMessage.title);
      heading.appendChild(headingText);

      var message = document.createElement('div');

      message.innerHTML = flashMessage.content;

      flashMessageNode.appendChild(heading);
      flashMessageNode.appendChild(message);

      $inboxWrapper.insertBefore(flashMessageNode, $inboxWrapper.firstChild);

      $(document.body).trigger('InboxWhenReady:flashMessageSeen', [ flashMessage.id ]);

      // Bind actions to the flash message buttons
      var buttonFollow = Utils.getDomElement('#iwr_flash_button--follow');
      if(buttonFollow) {
        buttonFollow.addEventListener('click', function() {
          $(document.body).trigger('InboxWhenReady:flashMessageFollow', [ flashMessage.id ]);
        });
      }

      var buttonSuppress = Utils.getDomElement('#iwr_flash_button--suppress');
      if(buttonSuppress) {
        buttonSuppress.addEventListener('click', function() {
          $(document.body).trigger('InboxWhenReady:flashMessageSuppress', [ flashMessage.id ]);
        });
      }

      var buttonSuppressForever = Utils.getDomElement('#iwr_flash_button--suppress_forever');
      if(buttonSuppressForever) {
        buttonSuppressForever.addEventListener('click', function() {
          $(document.body).trigger('InboxWhenReady:flashMessageSuppressForever', [ flashMessage.id ]);
        });
      }
    }

    function hideFlashMessage (flashMessageId) {
      var $flashMessage = InboxWhenReady.Utils.getDomElement('#iwr_flash_message_' + flashMessageId);

      if($flashMessage) {
        $flashMessage.parentNode.removeChild($flashMessage);
      }
    }

    //  [
    //    { id: 1,
    //      actions: [
    //        {
    //          action: 'suppress',
    //          timestamp: 124214512412
    //        }
    //      ]
    //    }
    //  ]
    //

    function logFlashMessageAction(flashMessageId, action) {
      var flashMessageLog = Storage.get('flashMessageLog');

      if(flashMessageLog === null) {
        flashMessageLog = [];
      }

      var logAction = {
        action: action,
        timestamp: Date.now()
      };

      // Find the right log entry and add the action to it.
      var logEntryIndex = null;

      flashMessageLog.forEach(function(logEntry, index) {
        if(logEntry.id === flashMessageId) {
          logEntryIndex = index;
        }
      });

      if(logEntryIndex === null) {
        // Make a new log entry
        var logEntry = {
          id: flashMessageId,
          actions: []
        };

        var flashMessageLogLength = flashMessageLog.push(logEntry);
        logEntryIndex = flashMessageLogLength - 1;
      }

      flashMessageLog[logEntryIndex].actions.push(logAction);

      Storage.set('flashMessageLog', flashMessageLog);
  }

  function publicCanShowFlashMessage(flashMessageId) {
    var canShowFlashMessage = true;
    var flashMessageLogEntry = getFlashMessageLogEntry(flashMessageId);

    if(wasFollowedRecently(flashMessageLogEntry)) {
      canShowFlashMessage = false;
    }

    if(canShowFlashMessage && wasSuppressedRecently(flashMessageLogEntry)) {
      canShowFlashMessage = false;
    }

    if(canShowFlashMessage && wasSuppressedForever(flashMessageLogEntry)) {
      canShowFlashMessage = false;
    }

    return canShowFlashMessage;
  }

  function wasFollowedRecently(flashMessageLogEntry) {
    var wasFollowedRecently = false;

    var date = new Date();
    date.setDate(date.getDate() - 365);
    var timeStamp365daysAgo = date.getTime();

    if(flashMessageLogEntry) {
      $.each(flashMessageLogEntry.actions, function(index, action) {
        if(action.action === 'follow') {
          if(wasTime1BeforeTime2(timeStamp365daysAgo, action.timestamp)) {
            wasFollowedRecently = true;
          }
        }
      });
    }

    return wasFollowedRecently;
  }

  function wasSuppressedForever(flashMessageLogEntry) {
    var wasSuppressedForever = false;

    if(flashMessageLogEntry) {
      $.each(flashMessageLogEntry.actions, function(index, action) {
        if(action.action === 'suppress_forever') {
          wasSuppressedForever = true;
        }
      });
    }

    return wasSuppressedForever;
  }

  function wasSuppressedRecently(flashMessageLogEntry) {
    var wasSuppressedRecently = false;

    var date = new Date();
    date.setDate(date.getDate() - 14);
    var timeStamp14daysAgo = date.getTime();

    if(flashMessageLogEntry) {
      $.each(flashMessageLogEntry.actions, function(index, action) {
        if(action.action === 'suppress') {
          if(wasTime1BeforeTime2(timeStamp14daysAgo, action.timestamp)) {
            wasSuppressedRecently = true;
          }
        }
      });
    }

    return wasSuppressedRecently;
  }

  function wasTime1BeforeTime2(time1, time2) {
    return time1 < time2;
  }

  function getFlashMessageLogEntry(flashMessageId) {

    var flashMessageLogEntry = null;
    var flashMessageLog = Storage.get('flashMessageLog');

    if(flashMessageLog) {
      $.each(flashMessageLog, function(index, logEntry) {
        if(logEntry.id === flashMessageId) {
          // bingo
          flashMessageLogEntry = logEntry;
        }
      });
    }

    return flashMessageLogEntry;
  }

  // Testing flash messages in development?
  // This console command might come in handy:
  //
  //   chrome.storage.local.clear()
  function registerFlashMessages() {
    registerFlashMessageSharePrompt();

    $(document.body).trigger('InboxWhenReady:flashMessagesRegistered');
  }

  function registerFlashMessageSharePrompt() {
    var extensionLoadedCount = Storage.get('extensionLoadedCount');

    var shouldFlashMessageBeRegistered = extensionLoadedCount > 20;

    if(shouldFlashMessageBeRegistered) {
      var flashMessageId = 1;
      var flashMessageTitle = 'Thanks for using Inbox When Ready.';
      var flashMessageContent = "<p>I hope it's helping you protect your focus. If you have a moment, please support this extension:</p>\
      <ol>\
        <li><strong>Invite a friend to give it a try.</strong><br>You could <a href='https://www.facebook.com/sharer/sharer.php?u=https://inboxwhenready.org' target='_blank'>share on Facebook</a>, <a href='https://twitter.com/home?status=My%20new%20favourite%20%23chrome%20%23extension%3A%0Ahttps%3A//inboxwhenready.org' target='_blank'>send a tweet</a> or <a href='mailto:?mailto:?Subject=Inbox%20When%20Ready&Body=Dear%20friend%2C%0AInbox%20When%20Ready%20is%20my%20new%20favourite%20Chrome%20extension%20for%20Gmail.%20It%20protects%20your%20focus%20by%20making%20your%20inbox%20hidden%20by%20default.%0A%0AGive%20it%20a%20try%3A%0Ahttps%3A//inboxwhenready.org%0A%0ALots%20of%20love%2C'>share by email</a>. Your friends will love you even more :)</li>\
        <li style='margin-top: 1em;'><strong>Rate the extension on the Chrome Web Store.</strong><br>You can do that <a href='https://chrome.google.com/webstore/detail/inbox-when-ready/cdedhgmbfjhobfnphaoihdfmnjidcpim/reviews?hl=en' target='_blank'>here</a>.</li>\
        <li style='margin-top: 1em;'><strong>Send me feedback.</strong><br>I'd love to hear your thoughts. You can reach me on <a href='mailto:peter@inboxwhenready.org?subject=Inbox+When+Ready'>peter@inboxwhenready.org</a>.</li>\
      </ol>\
      <p>With love,<br>Peter</p>\
      <div class='T-I J-J5-Ji T-I-KE' role='button' tabindex='0' style='-webkit-user-select: none;' id='iwr_flash_button--follow'><span class=''>I did it</span></div>\
      <div class='T-I J-J5-Ji T-I-ax7' role='button' tabindex='0' style='-webkit-user-select: none;' id='iwr_flash_button--suppress'><span class=''>Maybe later</span></div>\
      <div class='T-I J-J5-Ji T-I-ax7' role='button' tabindex='0' style='-webkit-user-select: none;' id='iwr_flash_button--suppress_forever'><span class=''>Never ask me again</span></div>\
      ";
      addFlashMessage(flashMessageId, flashMessageTitle, flashMessageContent);
    }
  }

  function bindListeners() {

    $(document).on('InboxWhenReady:extensionLoaded', function(e, from, to){
      registerFlashMessages();
    });

    $(document).on('InboxWhenReady:flashMessagesRegistered', function(){
      showFlashMessages();
    });

    $(document).on('InboxWhenReady:flashMessageFollow', function(e, flashMessageId){
      logFlashMessageAction(flashMessageId, 'follow');
      hideFlashMessage(flashMessageId);
    });

    $(document).on('InboxWhenReady:flashMessageSuppress', function(e, flashMessageId){
      logFlashMessageAction(flashMessageId, 'suppress');
      hideFlashMessage(flashMessageId);
    });

    $(document).on('InboxWhenReady:flashMessageSuppressForever', function(e, flashMessageId){
      logFlashMessageAction(flashMessageId, 'suppress_forever');
      hideFlashMessage(flashMessageId);
    });
  }

  function publicInit() {
    bindListeners();
  }

  var publicMethods = {
    init: publicInit,
    canShowFlashMessage: publicCanShowFlashMessage
  };

  return publicMethods;
}());