'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Controllers = InboxWhenReady.Controllers || {};

InboxWhenReady.Controllers.FlashMessage = (function () {
  var actions = {
    addFlashMessage : function(id, title, content) {
      var flashMessage = {
        'id' : id,
        'title' : title,
        'content' : content
      };

      this.flashMessages.push(flashMessage);
    },

    addFlashMessagesToDom : function() {
      this.flashMessages.forEach(function(flashMessage, index) {

        // Add the message to the DOM
        var flashMessageNode = document.createElement('div');
        flashMessageNode.className = 'iwr-flash-message';
        flashMessageNode.id = 'iwr_flash_message_' + flashMessage.id;

        var heading = document.createElement('h2');
        var headingText = document.createTextNode(flashMessage.title);
        heading.appendChild(headingText);

        var message = document.createElement('div');


        // Make ID attributes on the flash message buttons unique
        flashMessage.content = flashMessage.content.replace('button_follow', 'button_follow_' + flashMessage.id);
        flashMessage.content = flashMessage.content.replace('button_suppress', 'button_suppress_' + flashMessage.id);
        flashMessage.content = flashMessage.content.replace('button_suppress_forever', 'button_suppress_forever_' + flashMessage.id);

        message.innerHTML = flashMessage.content;

        flashMessageNode.appendChild(heading);
        flashMessageNode.appendChild(message);

        InboxWhenReady.dom.$inboxWrapper.insertBefore(flashMessageNode, InboxWhenReady.dom.$inboxWrapper.firstChild);

        // Bind actions to the flash message buttons
        var buttonFollow = this.getDomElement('#button_follow_' + flashMessage.id);
        buttonFollow.addEventListener('click', function() {
          InboxWhenReady.handleFlashMessageFollow(flashMessage.id);
        });

        var buttonSuppress = this.getDomElement('#button_suppress_' + flashMessage.id);
        buttonFollow.addEventListener('click', function() {
          InboxWhenReady.handleFlashMessageSuppress(flashMessage.id);
        });

        var buttonSuppressForever = this.getDomElement('#button_suppress_forever_' + flashMessage.id);
        buttonFollow.addEventListener('click', function() {
          InboxWhenReady.handleFlashMessageSuppressForever(flashMessage.id);
        });

      });
    },

    handleFlashMessageFollow : function(flashMessageId) {
      // Send tracking event
      var event = {
        'category' : this.state.app,
        'action' : 'Followed flash message',
        'label' : flashMessageId
      };

      this.sendEvent(event);

      this.hideFlashMessage(flashMessageId);
    },

    handleFlashMessageSuppress : function(flashMessageId) {
      // Send tracking event
      var event = {
        'category' : this.state.app,
        'action' : 'Suppressed flash message',
        'label' : flashMessageId
      };

      this.sendEvent(event);

      this.hideFlashMessage(flashMessageId);
    },

    handleFlashMessageSuppressForever : function(flashMessageId) {
      // Send tracking event
      var event = {
        'category' : this.state.app,
        'action' : 'Suppressed flash message forever',
        'label' : flashMessageId
      };

      this.sendEvent(event);

      this.hideFlashMessage(flashMessageId);
    },

    hideFlashMessage : function(flashMessageId) {
      var $flashMessage = this.getDomElement('#iwr_flash_message_' + flashMessageId);

      if($flashMessage) {
        $flashMessage.parentNode.removeChild($flashMessage);
      }
    },

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

    logFlashMessageAction : function(flashMessageId, action) {
      var flashMessageLog = this.getUserData('flashMessageLog');

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

      this.saveUserData('flashMessageLog', flashMessageLog);
    },

    updateFlashMessageLog : function(flashMessageId) {

    },

    canShowFlashMessage : function(flashMessageId) {

    }
  };

  return actions;
}());