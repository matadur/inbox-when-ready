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
      AppState.set('domSelectors', 'inboxLink', { selector : 'a[href$="#inbox"][target="_top"]' });
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

    var $actionButtonsWrapper = InboxWhenReady.Utils.getDomElement(actionButtonsContainerSelector.selector, visibleContainerMatch);

    if($actionButtonsWrapper) {
      $actionButtonsContainer = $actionButtonsWrapper.childNodes[0].childNodes[0];
    }

    AppState.set('dom', '$actionButtonsContainer', $actionButtonsContainer);
  }

  function startInboxSdkListener() {
    // We'll integrate more closely with InboxSDK in the near future.
    //
    // For now, let's just use it's super helpful view change listener.
    // This let's us add a class to the body before the view change has
    // visible effects. That makes our show/hide inbox CSS much simpler.

    var appName = AppState.get('meta', 'name');

    if(appName === 'Gmail') {
      InboxSDK.load('1.0', 'sdk_inboxwhenready_a2ecee1991').then(function(sdk){

        sdk.Router.handleListRoute(sdk.Router.NativeListRouteIDs.ANY_LIST, function(inboxView) {

          var currentRoute = sdk.Router.getCurrentRouteView();
          var currentRouteId = currentRoute.getRouteID();

          if(currentRouteId.indexOf('inbox') !== -1) {
            $('body').addClass('iwr-active-view--inbox');
          }
          else {
            $('body').removeClass('iwr-active-view--inbox');
          }

        });
      });
    }
  }

  function publicSaveInboxLinkLabel() {
    // Save the Inbox label with unread count before we do any DOM manipulation
    var inboxLinkSelector = AppState.get('domSelectors', 'inboxLink');
    var $inboxLink = InboxWhenReady.Utils.getDomElement(inboxLinkSelector.selector, inboxLinkSelector.match);
    // Update our DOM model seeing as we just fetched the element again.
    AppState.set('dom', '$inboxLink', $inboxLink);
    var inboxLinkLabel = $inboxLink.innerHTML;
    AppState.set('labels', 'inboxLink', inboxLinkLabel);
  }

  function publicInit() {
    setAppName();
    startInboxSdkListener();
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
