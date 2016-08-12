'use strict';

// via http://stackoverflow.com/a/20227975
function isDevelopmentEnvironment() {
  return !('update_url' in chrome.runtime.getManifest());
}

/* --- Google Analytics --- */

/* Set Google Analytics account ID according to environment */
var gaAccountId;

if(isDevelopmentEnvironment()) {
  // Development environment
  gaAccountId = 'UA-25161739-6';
}
else {
  // Production environment
  gaAccountId = 'UA-25161739-7';
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', gaAccountId]);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onInstalled.addListener( function ( details ) {

  if ( details.reason === "install" ) {

    chrome.tabs.create({
      url: 'https://inboxwhenready.org/welcome.html',
      active: true
    });
  }

});

chrome.tabs.query({ url: "https://mail.google.com/*" }, function ( tabs ) {

  tabs.forEach( function ( tab ) {
    chrome.tabs.reload( tab.id );
  });

});

chrome.runtime.onMessage.addListener(function( event, sender, sendResponse ) {
  _gaq.push(['_trackEvent', event.category, event.action, event.label, event.value]);

  sendResponse(event);
});
/* --- /Google Analytics --- */
