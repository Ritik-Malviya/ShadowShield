// Create a new connection diagnostic tool for debugging API connectivity issues
console.log('API Connection Diagnostic Tool initializing...');

// IMPORTANT: The production URL that should be used for all requests
const PRODUCTION_API_URL = 'https://shadowshield-backend.onrender.com';

// Initialize diagnostic info
let diagnosticInfo = {
  apiRequests: [],
  failedRequests: [],
  redirectedRequests: 0,
  lastCheck: null,
  connectionStatus: 'unknown'
};

// Function to make a diagnostic request
async function checkEndpoint(url) {
  console.log(`Testing connection to: ${url}`);
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      },
      mode: 'cors'
    });
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    return {
      url,
      status: response.status,
      ok: response.ok,
      latency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run diagnostics
async function runDiagnostics() {
  console.log('Running API connection diagnostics...');
  
  // Check both localhost and production URLs to verify redirection is working
  const results = await Promise.all([
    checkEndpoint(`${PRODUCTION_API_URL}/health`),
    checkEndpoint(`${PRODUCTION_API_URL}/api/auth/health`),
    checkEndpoint('http://localhost:5000/api/auth/health') // Should be redirected
  ]);
  
  // Store results
  diagnosticInfo.apiRequests = results;
  diagnosticInfo.failedRequests = results.filter(r => !r.ok);
  diagnosticInfo.lastCheck = new Date().toISOString();
  
  // Determine overall connection status
  if (results[0].ok || results[1].ok) {
    diagnosticInfo.connectionStatus = 'connected';
  } else {
    diagnosticInfo.connectionStatus = 'failed';
  }
  
  // Check if redirection is working
  if (results[2].ok) {
    diagnosticInfo.redirectedRequests++;
    console.log('Localhost redirection working correctly!');
  }
  
  // Update diagnostics in localStorage for the debugging UI
  localStorage.setItem('api_diagnostics', JSON.stringify(diagnosticInfo));
  
  console.log('API diagnostics completed:', diagnosticInfo);
  
  return diagnosticInfo;
}

// Run initial diagnostics
runDiagnostics().then(results => {
  console.log('Initial API diagnostics completed:', results);
});

// Set up periodic checks
setInterval(runDiagnostics, 60000); // Check every minute

// Export diagnostics for other modules
window.apiDiagnostics = {
  getDiagnostics: () => diagnosticInfo,
  runDiagnostics,
  PRODUCTION_API_URL
};