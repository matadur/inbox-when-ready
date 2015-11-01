'use strict';

function InboxWhenReady() {
  this.state = {};
  this.state.app = null; // InboxByGmail or Gmail
  this.state.appIsLoaded = false;
  this.state.inboxViewIsActive = false;
  this.state.inboxHidden = true;
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

  this.domSelectors = {};

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
  // Are we using Gmail or InboxByGmail?
  this.setApp();

  // Load selectors for relevant parts of the DOM. These vary, of course,
  // depending on whether we're using Gmail or Inbox by Gmail
  this.setDomSelectors();

  this.state.appIsLoaded = setInterval(function() {

    InboxWhenReady.dom.$inboxLink = InboxWhenReady.getDomElement(InboxWhenReady.domSelectors.inboxLink, InboxWhenReady.domSelectors.inboxLinkMatch);

    // If we found the DOM element we were looking for, we know the app has loaded.
    if(InboxWhenReady.dom.$inboxLink !== false) {

      clearInterval(InboxWhenReady.state.appIsLoaded);

      // Select the other DOM elements we need to manipulate.
      InboxWhenReady.selectDomElements();

      // Add show / hide inbox buttons to the DOM
      InboxWhenReady.addButtons();

      // Set inbox status to hidden (that's the intended default state).
      InboxWhenReady.hideInbox();

      // Update the view. This is necessary on initilisation because we may need
      // to show the view, even if inbox status is hidden. That's because we may
      // be initialising on a view that isn't the inbox.
      // (e.g. https://mail.google.com/mail/u/0/#sent)
      InboxWhenReady.updateView();

      // Listen for changes in app state.
      InboxWhenReady.bindListeners();

      // This class indicates that Inbox When Ready has loaded.
      InboxWhenReady.dom.$documentBody.classList.add('iwr-active');
    }
  }, 50);
};

InboxWhenReady.prototype.setApp = function() {
  if(window.location.host === 'inbox.google.com') {
    this.state.app = 'InboxByGmail';
  }
  else if(window.location.host === 'mail.google.com') {
    this.state.app = 'Gmail';
  }
};

InboxWhenReady.prototype.setDomSelectors = function() {
  if(this.state.app === 'InboxByGmail') {
    this.domSelectors.inbox = '.tE';
    this.domSelectors.inboxLink = '.tE';
    this.domSelectors.inboxLinkMatch = 0;
  }
  else if(this.state.app === 'Gmail') {
    this.domSelectors.inbox = '.aE3';
    // #todo This selector feels pretty fragile
    this.domSelectors.inboxLink = 'a[href$="#inbox"]';
    this.domSelectors.inboxLinkMatch = 1;
  }
};

InboxWhenReady.prototype.selectDomElements = function() {
  InboxWhenReady.dom.$documentBody = InboxWhenReady.getDomElement('body');
  InboxWhenReady.dom.$inbox = InboxWhenReady.getDomElement(InboxWhenReady.domSelectors.inbox);

  if(InboxWhenReady.state.app === 'InboxByGmail') {
    InboxWhenReady.dom.$actionButtonsContainer = InboxWhenReady.getDomElement('#nP');
  }
  else if(InboxWhenReady.state.app === 'Gmail') {
    InboxWhenReady.dom.$inboxCount = InboxWhenReady.getDomElement('.Di');
    InboxWhenReady.dom.$inboxContainer = InboxWhenReady.getDomElement('.AO');
    InboxWhenReady.dom.$actionButtonsContainer = InboxWhenReady.getDomElement('.aqL').childNodes[0].childNodes[0];

    // Save the Inbox label with unread count before we do any DOM manipulation
    InboxWhenReady.labels.inboxLink = InboxWhenReady.dom.$inboxLink.innerHTML;
  }
};

InboxWhenReady.prototype.hideInbox = function() {
  this.hideEmailView();

  this.state.inboxHidden = true;

  if(this.state.app === 'Gmail') {
    this.dom.$inboxLink.innerHTML = 'Inbox';

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
  }
};

InboxWhenReady.prototype.showInbox = function() {
  this.showEmailView();

  if (this.state.app === 'Gmail') {
    this.dom.$inboxLink.innerHTML = this.labels.inboxLink;
  }

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
  if(this.state.app === 'InboxByGmail') {
    this.updateInboxByGmailView();
  }
  else if (this.state.app === 'Gmail') {
    this.updateGmailView();
  }
};

InboxWhenReady.prototype.updateInboxByGmailView = function() {

  if(window.location.pathname.length === 5) {
    InboxWhenReady.state.inboxViewIsActive = true;
    this.dom.$documentBody.classList.add('iwr-inbox-view-active');

    if(InboxWhenReady.state.inboxHidden === true) {
      InboxWhenReady.hideEmailView();
    }
  }
  else {
    InboxWhenReady.state.inboxViewIsActive = false;

    if(InboxWhenReady.state.inboxHidden === true) {
      InboxWhenReady.showEmailView();
    }
  }
};

InboxWhenReady.prototype.updateGmailView = function() {
  if (location.hash.indexOf('#inbox') === 0) {
    InboxWhenReady.state.inboxViewIsActive = true;

    if(InboxWhenReady.state.inboxHidden === true) {
      InboxWhenReady.hideEmailView();
    }
  }
  else {
    InboxWhenReady.state.inboxViewIsActive = false;

    if(InboxWhenReady.state.inboxHidden === true) {
      InboxWhenReady.showEmailView();
    }
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
  if(this.state.app === 'InboxByGmail') {
    // We have to inject the script into the DOM, otherwise we can't
    // detect the pushstate change, due to Chrome Extension isolated
    // world policy.
    // C.f. https://developer.chrome.com/extensions/content_scripts#execution-environment

    /* jshint ignore:start */
    var html = "var pushState = history.pushState; \
    history.pushState = function () { \
      pushState.apply(history, arguments); \
      var $body = document.querySelectorAll('body')[0]; \
      if(window.location.pathname.length === 5) { \
        $body.classList.add('iwr-inbox-view-active');  \
      } \
      else { \
        $body.classList.remove('iwr-inbox-view-active'); \
      } \
    };";

    var domHead = InboxWhenReady.getDomElement('head');
    var scriptToInject = document.createElement('script');
    scriptToInject.type = 'text/javascript';
    scriptToInject.innerHTML = html;
    domHead.appendChild(scriptToInject);
    /* jshint ignore:end */
  }
  else if(this.state.app === 'Gmail') {
    window.onhashchange = InboxWhenReady.updateView;
  }
};

InboxWhenReady.prototype.addButtons = function() {
  // Show My Inbox button
  var showMyInboxButton = document.createElement('div');
  showMyInboxButton.id = 'show_my_inbox';

  if(this.state.app === 'InboxByGmail') {
    showMyInboxButton.className = 'sY dy qj';
    showMyInboxButton.innerHTML = '<div>Show Inbox</div>';
  }
  else if(this.state.app === 'Gmail') {
    showMyInboxButton.className = 'G-Ni J-J5-Ji';
    showMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Show Inbox</span></div>';
  }
  this.dom.$actionButtonsContainer.insertBefore(showMyInboxButton, this.dom.$actionButtonsContainer.childNodes[0]);

  var showMyInbox = this.getDomElement('#show_my_inbox');
  showMyInbox.addEventListener('click', function() {
    InboxWhenReady.toggleInbox();
  });

  // Hide My Inbox button
  var hideMyInboxButton = document.createElement('div');
  hideMyInboxButton.id = 'hide_my_inbox';

  if(this.state.app === 'InboxByGmail') {
    hideMyInboxButton.className = 'cN hA';
    hideMyInboxButton.innerHTML = '<div>Hide Inbox</div>';
  }
  else if(this.state.app === 'Gmail') {
    hideMyInboxButton.className = 'G-Ni J-J5-Ji';
    hideMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Hide Inbox</span></div>';
  }

  this.dom.$actionButtonsContainer.insertBefore(hideMyInboxButton, this.dom.$actionButtonsContainer.childNodes[0]);

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