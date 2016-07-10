var config = require('../config.js');

var assert = require('assert');

describe('Gmail', function() {

  var selectors = {};
  selectors.inbox = '.aE3';
  selectors.firstMessageInInbox = '.aDP .ae4 table tr:first-child [role="link"]';
  selectors.singleMessageWrapper = '.aHU';

  selectors.buttonShowMyInbox = '#show_my_inbox';
  selectors.buttonHideMyInbox = '#hide_my_inbox';
  selectors.buttonBackToInbox = 'a[href="https://mail.google.com/mail/u/0/#inbox"]';
  selectors.buttonCompose = '.aic [role="button"]';
  selectors.buttonsPagination = '.ar5';
  selectors.settingsTitle = 'h2.dt';

  selectors.mainArea = '[role="main"]';
  selectors.composeDialogHeading = '.aYF';


  before(function() {
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

  it('Should hide the inbox by default', function () {
      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, false);
  });

  it('Should show the "Show Inbox" button when the inbox is hidden and the inbox view is active', function () {
      var buttonShowMyInboxIsVisible = browser.isVisible(selectors.buttonShowMyInbox);
      assert.equal(buttonShowMyInboxIsVisible, true);
  });

  it('Should show the inbox if "Show Inbox" button is clicked', function () {
      browser.click(selectors.buttonShowMyInbox);
      browser.pause(500);

      var inboxIsVisible = browser.isVisible(selectors.inbox);
      assert.equal(inboxIsVisible, true);
  });

  it('Should show the "Hide Inbox" button when the inbox is visible and the inbox view is active', function () {
    browser.click(selectors.buttonShowMyInbox);

    var hideInboxButtonIsVisible = browser.isVisible(selectors.buttonHideMyInbox);
    assert.equal(hideInboxButtonIsVisible, true);
  });

  it('Should show single message view even if inbox is hidden', function () {
      browser.url(config.gmail.url + 'mail/u/0/#inbox/15110e66fb6fd617');
      browser.waitForExist(selectors.singleMessageWrapper, 5000);
      var singleMessageIsVisible = browser.isVisible(selectors.singleMessageWrapper);
      assert.equal(singleMessageIsVisible, true);
  });

  it('Should show search results even if inbox is hidden', function () {
    browser.url(config.gmail.url + 'mail/u/0/#search/test');
    browser.pause(1000);
    browser.waitForExist(selectors.mainArea, 5000);
    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);
  });

  it('Should show sent messages even if inbox is hidden', function () {
    browser.url(config.gmail.url + 'mail/u/0/#sent');
    browser.pause(1000);
    browser.waitForExist(selectors.mainArea, 5000);
    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);
  });

  it('Should show sent messages if app is loaded on sent messages view', function () {
    this.timeout(20000); // We're gonna reload the app, so test might take longer than 10 secs.
    browser.url(config.gmail.url + 'mail/u/0/#sent');
    browser.pause(300);
    browser.refresh();
    browser.waitForExist(selectors.mainArea, 10000);
    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);
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
    this.timeout(30000);
    browser.pause(200);
    browser.newWindow(config.gmail.url + 'mail/u/0/?ui=2&view=btop&ver=1nnj51jn5rorm&search=inbox&th=155b0700f976403b&cvid=1');
    browser.pause(200);
    browser.waitForExist(selectors.mainArea, 30000);

    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);
  });

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

  it('Message count and pagination buttons should be visible on inbox view when inbox is visible', function () {
    browser.click(selectors.buttonShowMyInbox);
    var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination);
    assert.equal(paginationButtonsAreVisible, true);
  });

  it('Message count and pagination buttons should not be visible on inbox view when inbox is hidden', function () {
    var paginationButtonsAreVisible = browser.isVisible(selectors.buttonsPagination);
    assert.equal(paginationButtonsAreVisible, false);
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
