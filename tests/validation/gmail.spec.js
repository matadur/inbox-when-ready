var config = require('../config.js');

var assert = require('assert');

describe('Gmail', function() {

  var selectors = {};
  selectors.inbox = '.aeF';
  selectors.firstMessageInInbox = '.aDP .ae4 table tr:first-child [role="link"]';
  selectors.singleMessageWrapper = '.aHU';

  selectors.buttonShowMyInbox = '#show_my_inbox';
  selectors.buttonHideMyInbox = '#hide_my_inbox';
  selectors.buttonBackToInbox = 'a[href="https://mail.google.com/mail/u/0/#inbox"]';
  selectors.buttonCompose = '.aic [role="button"]';
  selectors.buttonFlashMessageFollow = '#iwr_flash_button--follow';
  selectors.buttonFlashMessageSuppress = '#iwr_flash_button--suppress';
  selectors.buttonFlashMessageSuppressForever = '#iwr_flash_button--suppress_forever';
  selectors.buttonsPagination = '.ar5';
  selectors.buttonSaveSettings = '[guidedhelpid="save_changes_button"]';
  selectors.inboxToolbarButtons = '.aqL .G-Ni';
  selectors.flashMessage = '.iwr-flash-message';
  selectors.settingsTitle = 'h2.dt';
  selectors.inboxType = '.rtiTxf';
  selectors.categoryCheckboxWrapper = '.aJa';
  selectors.categoryCheckboxes = [
    {
      key: 'Social'
    },
    {
      key: 'Promotions'
    },
    {
      key: 'Updates'
    },
    {
      key: 'Forums'
    }
  ];

  selectors.mainArea = '[role="main"]';
  selectors.composeDialogHeading = '.aYF';

  // Gmail has several substantially different inbox UI modes, and
  // we need to run some of the tests for each mode.
  var inboxModes = [
    {
      key: 'importantFirst',
      label: 'Important first'
    },
    {
      key: 'unreadFirst',
      label: 'Unread first'
    },
    {
      key: 'starredFirst',
      label: 'Starred first'
    },
    {
      key: 'priorityInbox',
      label: 'Priority Inbox'
    },
    {
      key: 'defaultCategoriesDisabled',
      label: 'Default',
      categories: false
    },
    {
      key: 'defaultCategoriesEnabled',
      label: 'Default',
      categories: true
    },
  ];

  before(function() {
    var chai = require('chai');
    global.expect = chai.expect;
    chai.Should();

    this.timeout(20000);
    browser.url(config.gmail.url);
    browser.setValue('#Email', config.google.username);
    browser.click('#next');
    browser.waitForExist('#Passwd', 5000);
    browser.pause(500);
    browser.setValue('#Passwd', config.google.password);
    browser.waitForExist('#signIn', 5000);
    browser.click('#signIn');
  });

  beforeEach(function() {
    this.timeout(20000);
    // Go to inbox view
    browser.url(config.gmail.url + '#inbox');

    // Wait for the inbox wrapper to be present in the DOM.
    browser.waitForExist(selectors.inbox, 20000);

    // If the inbox is visible, hide it.
    if(browser.isVisible(selectors.inbox)) {
      browser.click(selectors.buttonHideMyInbox);
    }
  });

  describe('Inbox visibility', function() {

    // Inbox visibility tests must run several times to cover each
    // of Gmail's several inbox UI modes.

    inboxModes.forEach(function(inboxMode) {

      it('Should change the inbox type', function () {
        // This isn't really a test, but we need to run this so as to
        // switch Gmail into suitable UI mode for the following tests.
        //
        // (WDIO beforeEach() doesn't work for dynamically generated tests).

        browser.url(config.gmail.url + 'mail/u/0/#settings/inbox');
        browser.waitForExist(selectors.settingsTitle, 5000);
        browser.pause(1000);
        browser.selectByVisibleText(selectors.inboxType, inboxMode.label);

        if(inboxMode.categories === false) {
          // Uncheck all the checked categories
          selectors.categoryCheckboxes.forEach(function (categoryCheckbox) {
            var inputId = browser.getAttribute('label=' + categoryCheckbox.key, 'for');
            var inputSelector = 'input[id="'+ inputId[0] +'"]';
            var isSelected = browser.isSelected(inputSelector);

            if(isSelected) {
              browser.click('label=' + categoryCheckbox.key);
            }
          });
        }
        else if(inboxMode.categories === true) {
          // Check all the unchecked categories

          selectors.categoryCheckboxes.forEach(function (categoryCheckbox) {
            var inputId = browser.getAttribute('label=' + categoryCheckbox.key, 'for');
            var inputSelector = 'input[id="'+ inputId[0] +'"]';
            var isSelected = browser.isSelected(inputSelector);

            if(!isSelected) {
              browser.click('label=' + categoryCheckbox.key);
            }
          });
        }

        browser.pause(1000);

        browser.click(selectors.buttonSaveSettings);
        browser.pause(2000);

        browser.waitForExist(selectors.inbox, 20000);

        var inboxExists = browser.isExisting(selectors.inbox);
        assert.equal(inboxExists, true);

        console.log('\nTesting inbox type:');
        console.log(inboxMode.key + '\n');
      });

      it('Should hide the inbox by default', function () {
          var inboxIsVisible = browser.isVisible(selectors.inbox);
          assert.equal(inboxIsVisible, false);
      });

      it('Should show the inbox if "Show Inbox" button is clicked', function () {
          browser.click(selectors.buttonShowMyInbox);
          browser.pause(500);

          var inboxIsVisible = browser.isVisible(selectors.inbox);
          assert.equal(inboxIsVisible, true);
      });

      it('Should show single message view even if inbox is hidden', function () {
          browser.url(config.gmail.url + 'mail/u/0/#inbox/15110e66fb6fd617');
          browser.waitForExist(selectors.singleMessageWrapper, 5000);
          var singleMessageIsVisible = browser.isVisible(selectors.singleMessageWrapper);
          assert.equal(singleMessageIsVisible, true);
      });
    });
  });

  describe('Button visibility', function() {

    it('Should show the "Show Inbox" button when the inbox is hidden and the inbox view is active', function () {
        var buttonShowMyInboxIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
        assert.equal(buttonShowMyInboxIsVisible, true);
    });

    it('Should show the "Hide Inbox" button when the inbox is visible and the inbox view is active', function () {
      browser.click(selectors.buttonShowMyInbox);

      var hideInboxButtonIsVisible = browser.isVisible(selectors.buttonHideMyInbox);
      assert.equal(hideInboxButtonIsVisible, true);
    });

    it('Should hide inbox toolbar buttons when inbox is hidden and the inbox view is active', function () {
      var inboxToolbarButtonsVisibility = browser.isVisible(selectors.inboxToolbarButtons);
      var visibleInboxToolbarButtons = 0;

      inboxToolbarButtonsVisibility.forEach(function(visible) {
        if(visible) {
          visibleInboxToolbarButtons++;
        }
      });

      expect(visibleInboxToolbarButtons).to.be.below(3);
    });

    it('Should show inbox toolbar buttons when inbox is visible and the inbox view is active', function () {
      browser.click(selectors.buttonShowMyInbox);
      var inboxToolbarButtonsVisibility = browser.isVisible(selectors.inboxToolbarButtons);
      var visibleInboxToolbarButtons = 0;

      inboxToolbarButtonsVisibility.forEach(function(visible) {
        if(visible) {
          visibleInboxToolbarButtons++;
        }
      });

      expect(visibleInboxToolbarButtons).to.be.above(3);
    });
  });

  describe('Visibility of elements on non-inbox views', function() {

    it('Should show search results even if inbox is hidden', function () {
      browser.url(config.gmail.url + 'mail/u/0/#search/test');
      browser.pause(1000);
      browser.waitForExist(selectors.mainArea, 5000);

      var mainElementHeight = browser.getElementSize(selectors.mainArea, 'height');
      expect(mainElementHeight).to.be.above(10);
    });

    it('Should show sent messages even if inbox is hidden', function () {
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(1000);
      browser.waitForExist(selectors.mainArea, 5000);

      var mainElementHeight = browser.getElementSize(selectors.mainArea, 'height');
      expect(mainElementHeight).to.be.above(10);
    });

    it('Should show compose dialog even if inbox is hidden', function () {
      browser.click(selectors.buttonCompose);
      browser.pause(200);
      browser.waitForExist(selectors.composeDialogHeading, 5000);
      var composeDialogIsVisible = browser.isVisible(selectors.composeDialogHeading);
      assert.equal(composeDialogIsVisible, true);
    });

    it('Inbox should stay hidden when compose dialog is open', function () {
      browser.click(selectors.buttonCompose);
      browser.pause(200);
      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);
    });

    it('Inbox should stay visible when compose dialog is open', function () {
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(200);
      browser.click(selectors.buttonCompose);
      browser.pause(200);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, true);
    });

    it('Message count and pagination buttons should be visible on sent items view when inbox is visible', function () {
      browser.click(selectors.buttonShowMyInbox);
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(200);
      var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination)[1];
      assert.equal(paginationButtonsAreVisible, true);
    });

    it('Message count and pagination buttons should be visible on sent items view when inbox is hidden', function () {
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(200);
      var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination)[1];
      assert.equal(paginationButtonsAreVisible, true);
    });
  });

  describe('Functionality when Gmail is loaded on non-inbox views', function() {

    it('Should show sent messages if app is loaded on sent messages view', function () {
      this.timeout(20000); // We're gonna reload the app, so test might take longer than 10 secs.
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(300);
      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);

      var mainElementHeight = browser.getElementSize(selectors.mainArea, 'height');
      expect(mainElementHeight).to.be.above(10);
    });

    it('Should make the inbox hidden and the "show" button visible if app is loaded on sent messages view, then navigated back to inbox view.', function () {
      this.timeout(20000); // We're gonna reload the app, so test might take longer than 10 secs.
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(300);
      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      browser.click(selectors.buttonBackToInbox);
      browser.waitForExist(selectors.inbox, 10000);
      browser.pause(1000);

      var showButtonIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
      var inboxIsVisible = browser.isVisible(selectors.inbox);

      assert.equal(showButtonIsVisible, true);
      assert.equal(inboxIsVisible, false);
    });

    it('Should show label messages if app is loaded on label view', function () {
      this.timeout(20000); // We're gonna reload the app, so test might take longer than 10 secs.
      browser.url(config.gmail.url + 'mail/u/0/#label/Test');
      browser.pause(300);
      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);

      var mainElementHeight = browser.getElementSize(selectors.mainArea, 'height');
      expect(mainElementHeight).to.be.above(10);
    });

    it('Should make the inbox hidden and the "show" button visible if app is loaded on label view, then navigated back to inbox view.', function () {
      this.timeout(20000); // We're gonna reload the app, so test might take longer than 10 secs.
      browser.url(config.gmail.url + 'mail/u/0/#label/Test');
      browser.pause(300);
      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      browser.click(selectors.buttonBackToInbox);
      browser.waitForExist(selectors.inbox, 10000);
      browser.pause(2000);

      var showButtonIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
      var inboxIsVisible = browser.isVisible(selectors.inbox);

      assert.equal(showButtonIsVisible, true);
      assert.equal(inboxIsVisible, false);
    });

    it('Should keep inbox hidden and "show inbox" button visible when app is loaded on settings screen and then switches back to inbox', function () {
      browser.url(config.gmail.url + 'mail/u/0/#settings/general');
      browser.pause(300);
      browser.refresh();
      browser.waitForExist(selectors.buttonBackToInbox, 10000);
      browser.click(selectors.buttonBackToInbox);
      browser.pause(2000);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);

      var buttonShowMyInboxIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
      assert.equal(buttonShowMyInboxIsVisible, true);
    });

    it.skip('Single message should be visible in btop view', function () {
      // @TODO;
      /*
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(200);
      browser.keys('Command');
      browser.click(selectors.firstMessageInInbox); // Command + Click opens in new tab
      browser.pause(200);

      var tabIds = browser.getTabIds();
      var currentTabId = browser.getCurrentTabId();

      browser.pause(4000);

      console.log('current tab id');
      console.log(currentTabId);
      console.log('switching to tab');
      console.log(tabIds[1]);

      browser.switchTab(tabIds[1]);
      browser.pause(4000);
      */

      browser.pause(200);
      browser.newWindow(config.gmail.url + 'mail/u/0/?ui=2&view=btop&ver=1nnj51jn5rorm&search=inbox&th=155b0700f976403b&cvid=1');
      browser.pause(200);
      browser.waitForExist(selectors.mainArea, 30000);

      var mainElementHeight = browser.getElementSize(selectors.mainArea, 'height');
      expect(mainElementHeight).to.be.above(10);
    });
  });

  describe('Setting persistence when switching between views', function() {

    it('Should keep inbox hidden when switching from individual message view back to inbox', function () {
      browser.url(config.gmail.url + 'mail/u/0/#inbox/15110e66fb6fd617');
      browser.pause(200);
      browser.click(selectors.buttonBackToInbox);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);
    });

    it('Should keep inbox hidden when switching from sent messages view back to inbox', function () {
      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(500);
      browser.click(selectors.buttonBackToInbox);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);
    });

    it('Should keep inbox hidden and "show inbox" button visible when switching from settings back to inbox', function () {
      browser.url(config.gmail.url + 'mail/u/0/#settings/general');
      browser.waitForExist(selectors.settingsTitle, 5000);
      browser.click(selectors.buttonBackToInbox);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);

      var buttonShowMyInboxIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
      assert.equal(buttonShowMyInboxIsVisible, true);
    });

    it('Should keep inbox visible and "hide inbox" button visible when switching from settings back to inbox', function () {
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(200);
      browser.url(config.gmail.url + 'mail/u/0/#settings/general');
      browser.waitForExist(selectors.settingsTitle, 5000);
      browser.click(selectors.buttonBackToInbox);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, true);

      var buttonHideMyInboxIsVisible = browser.isVisible(selectors.buttonHideMyInbox);
      assert.equal(buttonHideMyInboxIsVisible, true);
    });
  });

  describe('Unread messages counts', function() {
    it('Inbox unread count should be removed from page title if inbox view is active and inbox is hidden', function () {
      browser.pause(200);
      var title = browser.getTitle();
      var expectedTitleStringFound = title.indexOf('Inbox - ') === 0;

      assert.equal(expectedTitleStringFound, true);
    });

    it('Inbox unread count should be removed from page title if user switches from sent messages view to inbox view and inbox is hidden', function () {

      browser.url(config.gmail.url + 'mail/u/0/#sent');
      browser.pause(500);
      browser.click(selectors.buttonBackToInbox);
      browser.pause(750);
      var title = browser.getTitle();
      var expectedTitleStringFound = title.indexOf('Inbox - ') === 0;

      assert.equal(expectedTitleStringFound, true);
    });

    it('Inbox unread count should be restored to page title if inbox view is active and inbox is visible', function () {
      browser.pause(200);
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(200);
      var title = browser.getTitle();
      var unreadCountRegex = / [(]\d+[)]/;
      var isUnreadCountPresent = title.search(unreadCountRegex) !== -1;

      assert.equal(isUnreadCountPresent, true);
    });

    it('Message count and pagination buttons should be visible on inbox view when inbox is visible', function () {
      browser.click(selectors.buttonShowMyInbox);
      var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination);
      assert.equal(paginationButtonsAreVisible, true);
    });

    it('Message count and pagination buttons should not be visible on inbox view when inbox is hidden', function () {
      var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination);
      assert.equal(paginationButtonsAreVisible, false);
    });
  });


/*
  it('Should not show flash message 1 if extension loaded count is less than 20, inbox view is active and inbox is hidden', function () {
      // TODO - show flash message

      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, false);
  });

  it('Should show flash message 1 if extension loaded count is greater than 20, inbox view is active and inbox is hidden', function () {
      // TODO - show flash message

      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, true);
  });

  it('Should not show flash message 1 if extension loaded count is greater than 20, inbox view is active and inbox is visible', function () {
      // TODO - show flash message

      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(200);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, false);
  });

  it('Should hide flash message if follow button is clicked', function () {
      // TODO - show flash message

      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, true);

      browser.click(selectors.buttonFlashMessageFollow);
      browser.pause(100);
      flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, false);
  });

  it('Should hide flash message if suppress button is clicked', function () {
      // TODO - show flash message

      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, true);

      browser.click(selectors.buttonFlashMessageSuppress);
      browser.pause(100);
      flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, false);
  });

  it('Should hide flash message if suppress forever button is clicked', function () {
      // TODO - show flash message
      browser.refresh();
      browser.waitForExist(selectors.mainArea, 10000);
      var flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, true);

      browser.click(selectors.buttonFlashMessageSuppressForever);
      browser.pause(100);
      flashMessageIsVisible = browser.isVisible(selectors.flashMessage);
      assert.equal(flashMessageIsVisible, false);
  });
*/
});
