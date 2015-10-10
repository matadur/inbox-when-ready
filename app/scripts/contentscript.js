'use strict';

function InboxWhenReady() {
  this.state = {};
  this.state.inboxViewIsActive = false;
  this.state.inboxHidden = true;
  this.state.gmailIsLoaded = false;
  this.state.actionBarIsLoaded = false;
  this.state.inboxLabelChecker = false;
  this.state.mustReInit = false;

  this.dom = {};
  this.dom.$documentBody = null;
  this.dom.$inboxLink = null;
  this.dom.$inboxLinkWithoutUnreadCount = null;
  this.dom.$inbox = null;
  this.dom.$inboxCount = null;
  this.dom.$inboxContainer = null;
  this.dom.$moreActionsMenu = null;

  this.labels = {};
  this.labels.inboxLink = null;
}

InboxWhenReady.prototype.getDomElement = function(selector,match) {
  var matchedDomElements = document.querySelectorAll(selector);

  if(typeof match === 'undefined') {
    match = 0;
  }

  if(matchedDomElements.length !== 0) {
    if(typeof matchedDomElements[match] !== 'undefined') {
      return document.querySelectorAll(selector)[match];
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
};

InboxWhenReady.prototype.init = function() {

  this.state.gmailIsLoaded = setInterval(function() {
    // #todo This selector feels pretty fragile
    InboxWhenReady.dom.$inboxLink = InboxWhenReady.getDomElement('a[href$="#inbox"]', 1);

    if(InboxWhenReady.dom.$inboxLink !== false) {
      InboxWhenReady.dom.$documentBody = InboxWhenReady.getDomElement('body');
      InboxWhenReady.dom.$inbox = InboxWhenReady.getDomElement('.aE3');
      InboxWhenReady.dom.$inboxCount = InboxWhenReady.getDomElement('.Di');
      InboxWhenReady.dom.$inboxContainer = InboxWhenReady.getDomElement('.AO');
      InboxWhenReady.dom.$actionButtonsContainer = InboxWhenReady.getDomElement('.aqL').childNodes[0].childNodes[0];

      // Save the Inbox label with unread count before we do any DOM manipulation
      InboxWhenReady.labels.inboxLink = InboxWhenReady.dom.$inboxLink.innerHTML;
      console.log('inbox link:');
      console.log(InboxWhenReady.labels.inboxLink);

      clearInterval(InboxWhenReady.state.gmailIsLoaded);

      InboxWhenReady.addButtons();



      // Set default state.
      InboxWhenReady.hideInbox();

      InboxWhenReady.updateView();
      InboxWhenReady.bindListeners();

      InboxWhenReady.dom.$documentBody.classList.add('iwr-active');
    }
  }, 50);
};

InboxWhenReady.prototype.hideInbox = function() {
  this.hideEmailView();
  this.dom.$inboxLink.innerHTML = 'Inbox';
  this.state.inboxHidden = true;

  // #todo: Ugh ugh ugh. There must be a better way.
  this.state.inboxLabelChecker = setInterval(function() {
    if(InboxWhenReady.state.inboxHidden) {
      // #todo This selector feels pretty fragile
      var inboxLink = InboxWhenReady.getDomElement('a[href$="#inbox"]', 1);
      inboxLink.innerHTML = 'Inbox';
    }
    else {
      clearInterval(InboxWhenReady.state.inboxLabelChecker);
    }
  }, 500);
};

InboxWhenReady.prototype.showInbox = function() {
  this.showEmailView();
  this.dom.$inboxLink.innerHTML = this.labels.inboxLink;
  this.state.inboxHidden = false;
};

InboxWhenReady.prototype.hideEmailView = function() {
  this.dom.$documentBody.classList.add('iwr-hide-email-view');
};

InboxWhenReady.prototype.showEmailView = function() {
  this.dom.$documentBody.classList.remove('iwr-hide-email-view');
};

InboxWhenReady.prototype.toggleInbox = function() {
  if(this.state.inboxHidden) {
    this.showInbox();
  }
  else {
    this.hideInbox();
  }
};

InboxWhenReady.prototype.updateView = function() {
  if (location.hash.indexOf('#inbox') === 0) {
    InboxWhenReady.state.inboxViewIsActive = true;

    if(InboxWhenReady.state.inboxHidden === true) {
      InboxWhenReady.hideEmailView();
    }
  }
  else {
    InboxWhenReady.state.inboxViewIsActive = false;
  }

  if (location.hash.indexOf('#settings') === 0) {
    // If the user navigates to settings page, there's a major DOM update.
    // So, we'll need to initialise again once they return to an inbox view.
    InboxWhenReady.state.mustReInit = true;
  }
  else if(InboxWhenReady.state.mustReInit === true) {
    InboxWhenReady.state.actionBarIsLoaded = setInterval(function() {
      if(document.getElementsByClassName('G-atb').length === 1) {
        InboxWhenReady.init();
        InboxWhenReady.state.mustReInit = false;
        clearInterval(InboxWhenReady.state.actionBarIsLoaded);
      }
    }, 500);


  }
};

InboxWhenReady.prototype.bindListeners = function() {
  window.onhashchange = InboxWhenReady.updateView;
};

InboxWhenReady.prototype.addButtons = function() {
  // Show My Inbox button
  var showMyInboxButton = document.createElement('div');
  showMyInboxButton.id = 'show_my_inbox';
  showMyInboxButton.className = 'G-Ni J-J5-Ji';
  showMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Show Inbox</span></div>';
  this.dom.$actionButtonsContainer.insertBefore(showMyInboxButton, this.dom.$actionButtonsContainer.childNodes[0]);

  var showMyInbox = this.getDomElement('#show_my_inbox');
  showMyInbox.addEventListener('click', function() {
    InboxWhenReady.toggleInbox();
  });

  // Hide My Inbox button
  var HideMyInboxButton = document.createElement('div');
  HideMyInboxButton.id = 'hide_my_inbox';
  HideMyInboxButton.className = 'G-Ni J-J5-Ji';
  HideMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Hide Inbox</span></div>';
  this.dom.$actionButtonsContainer.insertBefore(HideMyInboxButton, this.dom.$actionButtonsContainer.childNodes[0]);

  var HideMyInbox = this.getDomElement('#hide_my_inbox');
  HideMyInbox.addEventListener('click', function() {
    InboxWhenReady.toggleInbox();
  });

  /*
  // Add a replacement "Inbox" link which does not show the unread count.
  var inboxLinkParent = this.dom.$inboxLink.parentNode.parentNode.parentNode.parentNode.parentNode; // <div class="aim ain">
  var inboxLinkContainer = inboxLinkParent.parentNode; // <div class="TK">
  inboxLinkContainer.id = 'inbox_when_ready_folder_selector';

  var inboxLinkClone = inboxLinkParent.cloneNode(true);
  var inboxLinkATag = inboxLinkClone.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0];
  inboxLinkATag.innerHTML = 'Inbox';
  inboxLinkATag.title = 'Inbox';
  inboxLinkClone.id = 'inbox_link_without_unread_count';
  inboxLinkContainer.insertBefore(inboxLinkClone, inboxLinkParent.nextSibling);
  */
};

var InboxWhenReady = new InboxWhenReady();
InboxWhenReady.init();
