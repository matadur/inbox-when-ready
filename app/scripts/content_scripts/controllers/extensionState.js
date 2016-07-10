'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Controllers = InboxWhenReady.Controllers || {};

InboxWhenReady.Controllers.ExtensionState = (function () {

  var Analytics = InboxWhenReady.Analytics;
  var AppState = InboxWhenReady.Models.AppState;
  var AppStateController = InboxWhenReady.Controllers.AppState;
  var ExtensionState = InboxWhenReady.Models.ExtensionState;
  var Storage = InboxWhenReady.Models.Storage;
  var Utils = InboxWhenReady.Utils;

  function publicInit() {
    var $documentBody = AppState.get('dom', '$documentBody');

    setExtensionVersion();
    publicAddButtonsToDom();

    // Set inbox status to hidden (that's the intended default state).
    hideInbox();

    // Update the view. This is necessary on initilisation because we may need
    // to show the view, even if inbox status is hidden. That's because we may
    // be initialising on a view that isn't the inbox.
    // (e.g. https://mail.google.com/mail/u/0/#sent)
    publicUpdateView();

    // Update extension loaded count
    updateExtensionLoadedCount();

    $(document.body).trigger('InboxWhenReady:extensionLoaded');

    // Listen for changes in app state.
    // @TODO maybe this should go to AppState controller
    bindListeners();

    // This class indicates that Inbox When Ready has loaded.
    $documentBody.classList.add('iwr-active');
  }

  function publicAddButtonsToDom() {
    // Select the other DOM elements we need to manipulate.
    AppStateController.selectDomElements();

    // Is the inbox view active?
    if (AppState.isInboxViewActive()) {

      // Add show / hide inbox buttons to the DOM
      addButtons();
    }
    else {
      // Inbox view is not active. We'll have to call selectDomElements and addButtons() again when
      // the user returns to this view.
      ExtensionState.set(null, 'mustReInit', true);

      //if(InboxWhenReady.state.app === 'InboxByGmail') {
        // @TODO we can't bind to html5history, so for Inbox by Gmail we must poll
        // location and reinitialise when it changes
      //}
    }
  }

  function setExtensionVersion() {
    var manifest = getManifest();
    InboxWhenReady.Models.ExtensionState.set('meta', 'extensionVersion', manifest.version);
  }

  function getManifest() {
    var manifest = chrome.runtime.getManifest();
    return manifest;
  }

  function addButtons() {
    var appName = AppState.get('meta', 'name');
    var $actionButtonsContainer = AppState.get('dom', '$actionButtonsContainer');

    // Show My Inbox button
    var showMyInboxButton = document.createElement('div');
    showMyInboxButton.id = 'show_my_inbox';

    if(appName === 'InboxByGmail') {
      showMyInboxButton.className = 'sY dy qj';
      showMyInboxButton.innerHTML = '<div>Show Inbox</div>';
    }
    else if(appName === 'Gmail') {
      showMyInboxButton.className = 'G-Ni J-J5-Ji';
      showMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Show Inbox</span></div>';
    }

    // Hide My Inbox button
    var hideMyInboxButton = document.createElement('div');
    hideMyInboxButton.id = 'hide_my_inbox';

    if(appName === 'InboxByGmail') {
      hideMyInboxButton.className = 'cN hA';
      hideMyInboxButton.innerHTML = '<div>Hide Inbox</div>';
    }
    else if(appName === 'Gmail') {
      hideMyInboxButton.className = 'G-Ni J-J5-Ji';
      hideMyInboxButton.innerHTML = '<div class="T-I J-J5-Ji T-I-ax7" role="button" tabindex="0" style="-webkit-user-select: none;"><span class="">Hide Inbox</span></div>';
    }

    $actionButtonsContainer.insertBefore(showMyInboxButton, $actionButtonsContainer.childNodes[0]);
    $actionButtonsContainer.insertBefore(hideMyInboxButton, $actionButtonsContainer.childNodes[0]);

    var showMyInbox = InboxWhenReady.Utils.getDomElement('#show_my_inbox');
    showMyInbox.addEventListener('click', function() {
      InboxWhenReady.Controllers.ExtensionState.toggleInbox();
    });

    var HideMyInbox = InboxWhenReady.Utils.getDomElement('#hide_my_inbox');
    HideMyInbox.addEventListener('click', function() {
      InboxWhenReady.Controllers.ExtensionState.toggleInbox();
    });
  }

  function publicToggleInbox() {
    var isInboxHidden = ExtensionState.get(null, 'isInboxHidden');

    if(isInboxHidden) {
      showInbox();
    }
    else {
      hideInbox();
    }
  }

  function hideInbox() {
    var appName = AppState.get('meta', 'name');
    var extensionVersion = ExtensionState.get('meta', 'extensionVersion');

    hideEmailView();

    ExtensionState.set(null, 'isInboxHidden', true);

    // Send tracking event
    var event = {
      'category' : appName,
      'action' : 'Hide inbox',
      'label' : extensionVersion
    };

    InboxWhenReady.Analytics.sendEvent(event);

    if(appName === 'Gmail') {
      hideInboxUnreadCount();
    }
  }

  function hideInboxUnreadCount() {
    var inboxLabelChecker = false;
    var $inboxLink = AppState.get('dom', '$inboxLink');
    $inboxLink.innerHTML = 'Inbox';

    // #todo: Ugh ugh ugh. There must be a better way.
    inboxLabelChecker = setInterval(function() {
      var isInboxHidden = InboxWhenReady.Models.ExtensionState.get(null, 'isInboxHidden');
      if(isInboxHidden) {
        var $inboxLink = InboxWhenReady.Models.AppState.get('dom', '$inboxLink');
        $inboxLink.innerHTML = 'Inbox';
      }
      else {
        var inboxLabelChecker = InboxWhenReady.Models.ExtensionState.get(null, 'inboxLabelChecker');
        clearInterval(inboxLabelChecker);
      }
    }, 500);

    ExtensionState.set(null, 'inboxLabelChecker', inboxLabelChecker);
  }

  function showInbox() {
    var appName = AppState.get('meta', 'name');
    var extensionVersion = ExtensionState.get('meta', 'extensionVersion');
    var $inboxLink = AppState.get('dom', '$inboxLink');
    var inboxLinkLabel = AppState.get('labels', 'inboxLink');

    showEmailView();

    if (appName === 'Gmail') {
      $inboxLink.innerHTML = inboxLinkLabel;
    }

    ExtensionState.set(null, 'isInboxHidden', false);

    // Send tracking event
    var event = {
      'category' : appName,
      'action' : 'Show inbox',
      'label' : extensionVersion
    };

    InboxWhenReady.Analytics.sendEvent(event);
  }

  function hideEmailView() {
    var $documentBody = AppState.get('dom', '$documentBody');
    $documentBody.classList.add('iwr-hide-email-view');
    $documentBody.classList.remove('iwr-show-email-view');
  }

  function showEmailView() {
    var $documentBody = AppState.get('dom', '$documentBody');
    $documentBody.classList.add('iwr-show-email-view');
    $documentBody.classList.remove('iwr-hide-email-view');
  }

  function updateExtensionLoadedCount() {
    var extensionLoadedCount = Storage.get('extensionLoadedCount');

    if(extensionLoadedCount !== null) {
      // Increment the loaded count
      extensionLoadedCount = extensionLoadedCount + 1;
    }
    else {
      // Loading extension for the first time
      extensionLoadedCount = 1;

      // Record first load timestamp
      Storage.set('extensionFirstLoadTimestamp', Date.now());

      $(document.body).trigger('InboxWhenReady:extensionFirstLoaded');
    }

    // Save updated count to storage.
    Storage.set('extensionLoadedCount', extensionLoadedCount);
  }

  function publicUpdateView() {
    AppStateController.updateActiveView();
    var appName = AppState.get('meta', 'name');
    var isInboxHidden = ExtensionState.get(null, 'isInboxHidden');
    var isInboxViewActive = AppState.isInboxViewActive();
    var mustReInit = ExtensionState.get(null, 'mustReInit');
    var actionBarInterval = ExtensionState.get(null, 'actionBarInterval');
    var actionButtonsWrapperSelector = AppState.get('domSelectors', 'actionButtonsWrapper');

    if(isInboxViewActive && mustReInit) {

      // Without this condition, the interval could get set more than
      // once, because updateView() may get called more than once, e.g.
      // if a user loads https://mail.google.com/mail/u/0/ and then is
      // redirected to https://mail.google.com/mail/u/0/#inbox.
      if(actionBarInterval === false) {

        // Check for the presence of the element with class 'G-atb',
        // then add InboxWhenReady buttons to the DOM.
        actionBarInterval = setInterval(function() {

          if(InboxWhenReady.Utils.getDomElement(actionButtonsWrapperSelector.selector).length !== 0) {
            var ExtensionState = InboxWhenReady.Models.ExtensionState;
            var ExtensionStateController = InboxWhenReady.Controllers.ExtensionState;
            var actionBarInterval = ExtensionState.get(null, 'actionBarInterval');

            ExtensionStateController.addButtonsToDom();
            clearInterval(actionBarInterval);

            ExtensionState.set(null, 'mustReInit', false);
            ExtensionState.set(null, 'actionBarInterval', false);
          }
        }, 500);

        ExtensionState.set(null, 'actionBarInterval', actionBarInterval);
      }
    }

    if(isInboxViewActive) {
      if(isInboxHidden === true) {
        hideEmailView();
      }
    }
    else {
      if(isInboxHidden === true) {
        showEmailView(); //@TODO is this necessary?
      }
    }

    if(appName === 'Gmail') {
      if(location.hash.indexOf('#settings') === 0) {
        // If the user navigates to settings page, there's a major DOM update.
        // So, we'll need to initialise again once they return to an inbox view.
        ExtensionState.set(null, 'mustReInit', true);
      }
    }
  };


  function bindListeners() {
    var appName = AppState.get('meta', 'name');

    if(appName === 'InboxByGmail') {
      var port = chrome.runtime.connect();

      // We have to inject a message relay into the DOM, otherwise we can't
      // detect the pushstate change, due to Chrome Extension isolated
      // world policy.
      // C.f. https://developer.chrome.com/extensions/content_scripts#execution-environment

      /* jshint ignore:start */
      var html = "var pushState = history.pushState; \
      history.pushState = function () { \
        pushState.apply(history, arguments); \
        window.postMessage({ type: 'INBOX_BY_GMAIL', text: 'View change' }, '*'); \
      };";

      var domHead = InboxWhenReady.Utils.getDomElement('head');
      var scriptToInject = document.createElement('script');
      scriptToInject.type = 'text/javascript';
      scriptToInject.innerHTML = html;
      domHead.appendChild(scriptToInject);
      /* jshint ignore:end */

      // Following code snippet adapted from
      // https://developer.chrome.com/extensions/content_scripts#host-page-communication
      window.addEventListener('message', function(event) {
        // We only accept messages from ourselves
        if (event.source != window)
          return;

        if (event.data.type && (event.data.type == 'INBOX_BY_GMAIL')) {
          console.log(event.data.text);
          InboxWhenReady.Controllers.ExtensionState.updateView();
        }
      }, false);
    }
    else if(appName === 'Gmail') {
      window.onhashchange = InboxWhenReady.Controllers.ExtensionState.updateView;
    }
  }

  var publicMethods = {
    init: publicInit,
    toggleInbox: publicToggleInbox,
    updateView: publicUpdateView,
    addButtonsToDom: publicAddButtonsToDom
  };
  return publicMethods;
}(chrome));
