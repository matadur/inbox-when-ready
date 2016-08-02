describe('Common functions', function() {

  // It's really annoying if the welcome tab always opens during development.
  // So we disabled it - along with the test - when the extension is running
  // in development.
  //
  // @TODO This is not ideal: if there were a problem with this function, I'd
  // want to know about it.

  it.skip('Should open welcome page if extension is loaded for the first time', function () {
      var tabIds = browser.getTabIds();
      assert.equal(tabIds.length, 2);
      browser.switchTab(tabIds[1]);
      browser.close();
  });

  it('Should not open welcome page if extension is loaded for the second time', function () {
      var tabIds = browser.getTabIds();
      assert.equal(tabIds.length, 1);
  });

});