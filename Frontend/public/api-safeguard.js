// This script patches the fetch and XMLHttpRequest APIs to ensure all
// requests to localhost are redirected to the production server
// It should be loaded as early as possible in the app

(function() {
  // Production API URL
  const PRODUCTION_API_URL = 'https://shadowshield-backend.onrender.com';
  
  console.log('[API Safeguard] Initializing API safeguard to prevent localhost connections');
  
  // Store original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch to redirect localhost URLs
  window.fetch = function(input, init) {
    // If input is a Request object, we need to handle it differently
    let url = input instanceof Request ? input.url : input;
    let modifiedInput = input;
    
    if (typeof url === 'string' && url.includes('localhost')) {
      console.warn(`[API Safeguard] Intercepted localhost URL in fetch: ${url}`);
      
      // Replace localhost with production URL
      const modifiedUrl = url.replace(/https?:\/\/localhost:[0-9]+/g, PRODUCTION_API_URL);
      console.log(`[API Safeguard] Redirecting to: ${modifiedUrl}`);
      
      // If input is a Request object, we need to create a new Request
      if (input instanceof Request) {
        modifiedInput = new Request(modifiedUrl, input);
      } else {
        modifiedInput = modifiedUrl;
      }
    }
    
    return originalFetch.call(this, modifiedInput, init);
  };
  
  // Store original XMLHttpRequest open method
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  
  // Override XMLHttpRequest open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    let modifiedUrl = url;
    
    if (typeof url === 'string' && url.includes('localhost')) {
      console.warn(`[API Safeguard] Intercepted localhost URL in XMLHttpRequest: ${url}`);
      
      // Replace localhost with production URL
      modifiedUrl = url.replace(/https?:\/\/localhost:[0-9]+/g, PRODUCTION_API_URL);
      console.log(`[API Safeguard] Redirecting to: ${modifiedUrl}`);
    }
    
    return originalXhrOpen.call(this, method, modifiedUrl, async, user, password);
  };
  
  console.log('[API Safeguard] Network API safeguards successfully installed');
})();
