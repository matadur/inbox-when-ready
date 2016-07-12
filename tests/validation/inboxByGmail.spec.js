var config = require('../config.js');

var assert = require('assert');

describe('Inbox by Gmail', function() {

  var selectors = {};
  selectors.inbox = '.tE';

  selectors.buttonShowMyInbox = '#show_my_inbox';
  selectors.buttonHideMyInbox = '#hide_my_inbox';

  selectors.buttonCompose = '.hC';
  selectors.buttonComposeClose = '.pr button[title="Close"]';
  selectors.buttonsPagination = '.ar5';

  selectors.mainArea = '[role="main"]';
  selectors.composeDialogHeading = '.pr';

  this.timeout(30000);


  before(function() {
    browser.url(config.inboxByGmail.url);
    browser.waitForExist('#Email', 5000);
    browser.pause(200);
    browser.setValue('#Email', config.google.username);
    browser.click('#next');
    browser.waitForExist('#Passwd', 5000);
    browser.pause(200);
    browser.setValue('#Passwd', config.google.password);
    browser.waitForExist('#signIn', 5000);
    browser.click('#signIn');
  });

  beforeEach(function() {
    // Go to inbox view
    // Disabled for now - causes a full reload for each test, which takes ages.
    //browser.url(config.inboxByGmail.url);

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

  it('Should show search results even if inbox is hidden', function () {
    browser.url(config.inboxByGmail.url + 'search/test');
    browser.pause(1000);
    browser.waitForExist(selectors.mainArea, 5000);
    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);

    // Go back to Inbox view
    browser.url(config.inboxByGmail.url);
  });

  it('Should show sent messages even if inbox is hidden', function () {
    browser.url(config.inboxByGmail.url + 'sent');
    browser.pause(1000);
    browser.waitForExist(selectors.mainArea, 5000);
    var mainIsVisible = browser.isVisible(selectors.mainArea);
    assert.equal(mainIsVisible, true);

    // Go back to Inbox view
    browser.url(config.inboxByGmail.url);
  });

  it('Should show compose dialog even if inbox is hidden', function () {
    browser.click(selectors.buttonCompose);
    browser.pause(200);
    browser.waitForExist(selectors.composeDialogHeading, 5000);
    var composeDialogIsVisible = browser.isVisible(selectors.composeDialogHeading);
    assert.equal(composeDialogIsVisible, true);

    // Close compose dialog again
    browser.click(selectors.buttonComposeClose);
  });

  it('Inbox should stay hidden when compose dialog is open', function () {
    browser.pause(200);
    browser.click(selectors.buttonCompose);
    browser.pause(200);
    var inboxIsVisible = browser.isVisible(selectors.inbox);
    assert.equal(inboxIsVisible, false);

    // Close compose dialog again
    browser.click(selectors.buttonComposeClose);
  });

  it('Inbox should stay visible when compose dialog is open', function () {
    browser.pause(200);
    browser.click(selectors.buttonShowMyInbox);
    browser.pause(200);
    browser.click(selectors.buttonCompose);
    browser.pause(200);

    var inboxIsVisible = browser.isVisible(selectors.inbox);
    assert.equal(inboxIsVisible, true);

    // Close compose dialog again
    browser.click(selectors.buttonComposeClose);
  });
});
