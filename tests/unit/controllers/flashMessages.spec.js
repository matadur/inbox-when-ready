/* global describe, it */

(function () {
  'use strict';

  before(function() {
  });

  describe('FlashMessages Controller', function () {
    var Storage = InboxWhenReady.Models.Storage;
    var FlashMessagesController = InboxWhenReady.Controllers.FlashMessages;

    var d = new Date();
    d.setDate(d.getDate() - 1);
    var timeStamp1dayAgo = d.getTime();

    var d = new Date();
    d.setDate(d.getDate() - 15);
    var timeStamp15daysAgo = d.getTime();

    var d = new Date();
    d.setDate(d.getDate() - 370);
    var timeStamp370daysAgo = d.getTime();

    // Return an example flashMessageLog object from storage.
    Storage.get = function() {
      var returnValue = [
        {
            id: 2,
            actions: [
                {
                    action: 'follow',
                    timestamp: timeStamp1dayAgo
                }
            ]
        },
        {
            id: 3,
            actions: [
                {
                    action: 'suppress',
                    timestamp: timeStamp1dayAgo
                }
            ]
        },
        {
            id: 4,
            actions: [
                {
                    action: 'suppress_forever',
                    timestamp: timeStamp1dayAgo
                }
            ]
        },
        {
            id: 5,
            actions: [
                {
                    action: 'suppress',
                    timestamp: timeStamp15daysAgo
                }
            ]
        },
        {
            id: 6,
            actions: [
                {
                    action: 'follow',
                    timestamp: timeStamp370daysAgo
                }
            ]
        }
      ];

      return returnValue;
    }

    it('Should show an appeal that has not previously been followed or suppressed.', function () {
      var flashMessageId = 1;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, true);
    });

    it('Should not show an appeal that has been followed within the last year.', function () {

      var flashMessageId = 2;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, false);
    });

    it('Should not show an appeal that has been suppressed within the last 14 days.', function () {
      var flashMessageId = 3;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, false);
    });

    it('Should not show an appeal that has been suppressed forever.', function () {

      var flashMessageId = 4;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, false);
    });

    it('Should show an appeal that has been followed more than 1 year ago.', function () {

      var flashMessageId = 6;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, true);
    });

    it('Should show an appeal that has been suppressed more than 14 days ago.', function () {

      var flashMessageId = 5;
      var canShowFlashMessage = FlashMessagesController.canShowFlashMessage(flashMessageId);
      assert.equal(canShowFlashMessage, true);
    });
  });
})();
