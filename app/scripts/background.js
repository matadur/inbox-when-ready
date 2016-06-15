'use strict';

/* --- Google Analytics --- */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25161739-6']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onMessage.addListener(function( event, sender, sendResponse ) {
  event.label = event.label.toString();
  _gaq.push(['_trackEvent', event.category, event.action, event.label]);
  sendResponse(event);
});
/* --- /Google Analytics --- */