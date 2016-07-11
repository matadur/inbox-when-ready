'use strict';

var InboxWhenReady = InboxWhenReady || {};
InboxWhenReady.Controllers = InboxWhenReady.Controllers || {};

InboxWhenReady.Controllers.AppState = (function () {

  var AppState = InboxWhenReady.Models.AppState;
  var Utils = InboxWhenReady.Utils;

  function setAppName() {
    var appName = getAppName();
    AppState.set('meta', 'name', appName);
  }

  function getAppName() {
    var app = null;
    if(window.location.host === 'inbox.google.com') {
      app = 'InboxByGmail';
    }
    else if(window.location.host === 'mail.google.com') {
      app = 'Gmail';
    }

    return app;
  }

  function publicGetBodyElement() {
    var $documentBody = InboxWhenReady.Utils.getDomElement('body');
    AppState.set('dom', '$documentBody', $documentBody);

    return $documentBody;
  }

  function setDomSelectors() {
    if(AppState.get('meta', 'name') === 'InboxByGmail') {
      AppState.set('domSelectors', 'inbox', { selector : '.tE' });
      // Deliberately null until we enable flash messages on InboxByGmail
      AppState.set('domSelectors', 'inboxWrapper', { selector: null });
      AppState.set('domSelectors', 'inboxLink', { selector : '.tE' });
      AppState.set('domSelectors', 'actionButtonsContainer', { selector : '.c4'});
    }
    else if(AppState.get('meta', 'name') === 'Gmail') {
      AppState.set('domSelectors', 'inboxWrapper', { selector : '.aeF' });
      AppState.set('domSelectors', 'inboxLink', { selector : 'a[href$="#inbox"]', match : 1 });
      AppState.set('domSelectors', 'actionButtonsContainer', { selector : '.aqL' });
      AppState.set('domSelectors', 'actionButtonsWrapper', { selector : '.G-atb' });
      AppState.set('domSelectors', 'inboxCount', { selector : '.Di' });

    }
  }

  function waitForAppToLoad() {
    var appName = InboxWhenReady.Models.AppState.get('meta', 'name');
    var inboxLink = InboxWhenReady.Models.AppState.get('domSelectors', 'inboxLink');
    var $inboxLink = null;

    var appIsLoaded = setInterval(function() {
      // @TODO;
      console.log('Waiting for ' + appName + ' to load...');

      $inboxLink = InboxWhenReady.Utils.getDomElement(inboxLink.selector, inboxLink.match);

      if($inboxLink !== false) {
        console.log(appName + ' has loaded.');
        clearInterval(appIsLoaded);
        InboxWhenReady.Models.AppState.set(null, 'isLoaded', true);
        $(document.body).trigger('InboxWhenReady:appLoaded');
      }
    }, 50);
  }

  function publicUpdateActiveView() {
    var appName = AppState.get('meta', 'name');
    var activeView = null;

    removeActiveViewClass();

    if(appName === 'InboxByGmail') {
      activeView = getPathname();
    }
    else if(appName === 'Gmail') {
      activeView = location.hash;
    }

    console.log('activeview');
    console.log(activeView);

    AppState.set(null, 'activeView', activeView);

    addActiveViewClass();
  }

  function removeActiveViewClass() {
    var activeView = AppState.get(null, 'activeView');
    var activeViewSlug;
    var $documentBody = AppState.get('dom', '$documentBody');

    if(activeView) {
      activeViewSlug = getActiveViewSlug();
      $documentBody.classList.remove('iwr-active-view--' + activeViewSlug);
    }
  }

  // If user has multiple Google accounts and has the account switcher
  // enabled, then all the Gmail / Inbox by Google pathnames will be
  // prefxied by something of the form:
  //
  //   /u/0/
  //   /u/1/
  //   etc...
  //
  // This functions strips off these prefixes.
  function getPathnameWithoutAccountSwitcherPrefix(pathname) {
    var pathnameWithoutAccountSwitcherPrefix;
    var regex = /\/u\/\d+/g;
    pathnameWithoutAccountSwitcherPrefix = pathname.replace(regex, '');
    return pathnameWithoutAccountSwitcherPrefix;
  }

  function getPathname() {
    var pathname = window.location.pathname;
    pathname = getPathnameWithoutAccountSwitcherPrefix(pathname);
    return pathname;
  }

  function addActiveViewClass() {
    var activeViewSlug = getActiveViewSlug();
    var $documentBody = AppState.get('dom', '$documentBody');

    $documentBody.classList.add('iwr-active-view--' + activeViewSlug);
  }

  function getActiveViewSlug() {
    var activeView = AppState.get(null, 'activeView');
    var activeViewSlug = activeView.replace('#', '');

    if(activeViewSlug.indexOf('?') !== -1) {
      activeViewSlug = activeViewSlug.substring(0, activeViewSlug.indexOf('?'));
    }

    activeViewSlug = activeViewSlug.replace('/', '');

    if(activeViewSlug === '') {
      activeViewSlug = 'inbox';
    }

    return activeViewSlug;
  };

  function publicSelectDomElements() {
    var appName = AppState.get('meta', 'name');
    var domSelectors = AppState.get(null, 'domSelectors');
    var domElements = AppState.get(null, 'dom');

    $.each(domSelectors, function(key, element) {
      domElements['$' + key] = InboxWhenReady.Utils.getDomElement(element.selector, element.match);
    });

    console.log('Found these DOM elements:');
    console.log(domElements);

    AppState.set(null, 'dom', domElements);

    if(appName === 'Gmail') {
      selectGmailSpecificDomElements();
    }
  }

  function selectGmailSpecificDomElements() {
    // @TODO WTF
    var foundTheVisibleButtonWrapper = false;
    var visibleContainerMatch = 0;
    var actionButtonsContainerSelector = AppState.get('domSelectors', 'actionButtonsContainer');
    var actionButtonsWrapperSelector = AppState.get('domSelectors', 'actionButtonsWrapper');
    var $actionButtonsWrapper;
    var $actionButtonsContainer;

    while(!foundTheVisibleButtonWrapper) {
      $actionButtonsWrapper = InboxWhenReady.Utils.getDomElement(actionButtonsWrapperSelector.selector, visibleContainerMatch);

      if($actionButtonsWrapper.style.display === 'none') {
        visibleContainerMatch++;
      }
      else {
        foundTheVisibleButtonWrapper = true;
      }
    }

    $actionButtonsContainer = InboxWhenReady.Utils.getDomElement(actionButtonsContainerSelector.selector, visibleContainerMatch).childNodes[0].childNodes[0];

    AppState.set('dom', '$actionButtonsContainer', $actionButtonsContainer);
  }

  function publicSaveInboxLinkLabel() {
    // Save the Inbox label with unread count before we do any DOM manipulation
    var $inboxLink = AppState.get('dom', '$inboxLink');
    var inboxLinkLabel = $inboxLink.innerHTML;
    AppState.set('labels', 'inboxLink', inboxLinkLabel);
    console.log(inboxLinkLabel);
  }

  function publicInit() {
    setAppName();
    setDomSelectors();
    waitForAppToLoad();
  }

  var publicMethods = {
    init: publicInit,
    getBodyElement: publicGetBodyElement,
    saveInboxLinkLabel: publicSaveInboxLinkLabel,
    selectDomElements: publicSelectDomElements,
    updateActiveView: publicUpdateActiveView
  };
  return publicMethods;
}());
