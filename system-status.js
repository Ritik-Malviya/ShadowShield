/**
 * ShadowShield System Status Check
 * 
 * This script performs a comprehensive check of the ShadowShield system,
 * testing connectivity between frontend and backend, verifying API endpoints,
 * and checking CORS configuration.
 */

const axios = require('axios');
const colors = require('colors/safe');
const readline = require('readline');

// Configuration
const BACKEND_URL = 'https://shadowshield-backend.onrender.com';
const FRONTEND_URL = 'https://frontend-ritiks-projects-9f564ec3.vercel.app';

// Terminal colors for better readability
colors.setTheme({
  info: 'cyan',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  highlight: 'magenta',
  header: ['bold', 'blue'],
  important: ['bold', 'yellow']
});

/**
 * Format response time in a human-readable form with appropriate color
 */
function formatResponseTime(ms) {
  if (ms < 500) {
    return colors.success(`${ms}ms (good)`);
  } else if (ms < 2000) {
    return colors.warning(`${ms}ms (acceptable)`);
  } else {
    return colors.error(`${ms}ms (slow)`);
  }
}

/**
 * Display header for a section
 */
function displayHeader(title) {
  console.log('\n' + colors.header('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(colors.header(`📊 ${title}`));
  console.log(colors.header('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

/**
 * Test the health endpoint
 */
async function testHealthEndpoint() {
  displayHeader('TESTING BACKEND HEALTH');
  
  console.log(colors.info(`Connecting to: ${BACKEND_URL}/health`));
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response.status === 200 && response.data.success) {
      console.log(colors.success(`✓ Backend is healthy`));
      console.log(colors.info(`Response time: ${formatResponseTime(duration)}`));
      console.log(colors.info(`Environment: ${response.data.environment}`));
      console.log(colors.info(`Timestamp: ${response.data.timestamp}`));
      
      // CORS configuration info
      if (response.data.cors) {
        console.log(colors.info(`CORS configured for: ${response.data.cors.allowedOrigins.join(', ')}`));
      }
      
      return { success: true, responseTime: duration };
    } else {
      console.log(colors.error(`✗ Backend returned unexpected response`));
      console.log(colors.info(`Response: ${JSON.stringify(response.data)}`));
      return { success: false, error: 'Unexpected response' };
    }
  } catch (error) {
    console.log(colors.error(`✗ Failed to connect to backend health endpoint`));
    console.log(colors.error(`Error: ${error.message}`));
    
    if (error.code === 'ECONNREFUSED') {
      console.log(colors.warning(`The backend server appears to be down or unreachable.`));
    } else if (error.code === 'ECONNABORTED') {
      console.log(colors.warning(`Connection timed out. The server might be under heavy load or experiencing issues.`));
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Test authentication endpoints
 */
async function testAuthEndpoints() {
  displayHeader('TESTING AUTHENTICATION ENDPOINTS');
  
  // Test data
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@shadowshield.test`,
    password: 'TestPassword123!'
  };
  
  // Test login - expecting 401 for invalid credentials
  console.log(colors.info(`Testing login endpoint (expecting 401 for invalid credentials)...`));
  try {
    const startTime = Date.now();
    await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'nonexistent@shadowshield.test',
      password: 'invalidpassword'
    });
    const endTime = Date.now();
    
    console.log(colors.warning(`Unexpected success on login with invalid credentials!`));
    return { success: false, error: 'Login succeeded with invalid credentials' };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(colors.success(`✓ Login endpoint correctly returns 401 for invalid credentials`));
    } else {
      console.log(colors.error(`✗ Login endpoint returned unexpected error: ${error.message}`));
      if (error.response) {
        console.log(colors.error(`Status: ${error.response.status}`));
        console.log(colors.error(`Data: ${JSON.stringify(error.response.data)}`));
      }
      return { success: false, error: error.message };
    }
  }
  
  // Test registration with random user
  console.log(colors.info(`\nTesting registration endpoint with a test user...`));
  console.log(colors.info(`Email: ${testUser.email}`));
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, testUser);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response.status === 201 || response.status === 200) {
      console.log(colors.success(`✓ Registration endpoint works correctly`));
      console.log(colors.info(`Response time: ${formatResponseTime(duration)}`));
      
      // Try logging in with the new user
      console.log(colors.info(`\nTesting login with newly created user...`));
      try {
        const loginStartTime = Date.now();
        const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        const loginEndTime = Date.now();
        const loginDuration = loginEndTime - loginStartTime;
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
          console.log(colors.success(`✓ Login endpoint works correctly with new user`));
          console.log(colors.info(`Response time: ${formatResponseTime(loginDuration)}`));
          console.log(colors.success(`✓ JWT token received successfully`));
          
          return { success: true, registrationTime: duration, loginTime: loginDuration };
        } else {
          console.log(colors.warning(`Login endpoint response unexpected: ${JSON.stringify(loginResponse.data)}`));
          return { success: false, error: 'Unexpected login response' };
        }
      } catch (loginError) {
        console.log(colors.error(`✗ Login with new user failed: ${loginError.message}`));
        if (loginError.response) {
          console.log(colors.error(`Status: ${loginError.response.status}`));
          console.log(colors.error(`Data: ${JSON.stringify(loginError.response.data)}`));
        }
        return { success: false, error: loginError.message };
      }
    } else {
      console.log(colors.warning(`Registration endpoint returned unexpected status: ${response.status}`));
      return { success: false, error: `Unexpected status: ${response.status}` };
    }
  } catch (error) {
    console.log(colors.error(`✗ Registration endpoint error: ${error.message}`));
    if (error.response) {
      console.log(colors.error(`Status: ${error.response.status}`));
      console.log(colors.error(`Data: ${JSON.stringify(error.response.data)}`));
    }
    return { success: false, error: error.message };
  }
}

/**
 * Test CORS configuration
 */
async function testCorsConfiguration() {
  displayHeader('TESTING CORS CONFIGURATION');
  
  console.log(colors.info(`Testing CORS with origin: ${FRONTEND_URL}`));
  
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    
    // Check if CORS headers are present
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (corsHeader) {
      console.log(colors.success(`✓ CORS is properly configured`));
      console.log(colors.info(`Access-Control-Allow-Origin: ${corsHeader}`));
      
      // Check if frontend origin is allowed
      if (corsHeader === '*' || corsHeader === FRONTEND_URL || corsHeader.includes(FRONTEND_URL)) {
        console.log(colors.success(`✓ Frontend origin is allowed by CORS configuration`));
      } else {
        console.log(colors.warning(`! Frontend origin might not be explicitly allowed`));
        console.log(colors.warning(`  Expected: ${FRONTEND_URL}`));
        console.log(colors.warning(`  Actual: ${corsHeader}`));
      }
      
      // Check other CORS headers
      const allowCredentials = response.headers['access-control-allow-credentials'];
      if (allowCredentials === 'true') {
        console.log(colors.success(`✓ Credentials are allowed (access-control-allow-credentials: true)`));
      } else {
        console.log(colors.info(`Credentials policy: ${allowCredentials || 'Not specified'}`));
      }
      
      return { success: true, corsHeader };
    } else {
      console.log(colors.error(`✗ CORS headers not found in response`));
      console.log(colors.error(`This might cause issues with frontend requests`));
      console.log(colors.info(`Available headers: ${Object.keys(response.headers).join(', ')}`));
      return { success: false, error: 'No CORS headers' };
    }
  } catch (error) {
    console.log(colors.error(`✗ CORS test failed: ${error.message}`));
    if (error.response) {
      console.log(colors.error(`Status: ${error.response.status}`));
    }
    return { success: false, error: error.message };
  }
}

/**
 * Generate system status report
 */
async function generateSystemReport() {
  displayHeader('SHADOWSHIELD SYSTEM STATUS REPORT');
  
  console.log(colors.info(`Backend URL: ${BACKEND_URL}`));
  console.log(colors.info(`Frontend URL: ${FRONTEND_URL}`));
  console.log(colors.info(`Test Time: ${new Date().toISOString()}`));
  
  // Run all tests
  const healthResult = await testHealthEndpoint();
  const corsResult = await testCorsConfiguration();
  const authResult = await testAuthEndpoints();
  
  // Generate summary
  displayHeader('SUMMARY');
  
  console.log(colors.highlight('Backend Health:'), healthResult.success ? colors.success('OPERATIONAL') : colors.error('ISSUES DETECTED'));
  console.log(colors.highlight('CORS Configuration:'), corsResult.success ? colors.success('CORRECTLY CONFIGURED') : colors.error('MISCONFIGURED'));
  console.log(colors.highlight('Authentication System:'), authResult.success ? colors.success('WORKING PROPERLY') : colors.error('ISSUES DETECTED'));
  
  console.log('\n' + colors.important('Testing Tools URLs:'));
  console.log(colors.info(`Direct Login Test: ${FRONTEND_URL}/direct-login-test.html`));
  console.log(colors.info(`API Tester: ${FRONTEND_URL}/api-tester.html`));
  console.log(colors.info(`CORS Test: ${FRONTEND_URL}/cors-test.html`));
  
  // Overall assessment
  const allSuccessful = healthResult.success && corsResult.success && authResult.success;
  
  console.log('\n' + colors.header('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  if (allSuccessful) {
    console.log(colors.success('✓ ALL SYSTEMS OPERATIONAL'));
    console.log(colors.success('The ShadowShield system is properly configured and working as expected.'));
  } else {
    console.log(colors.error('✗ ISSUES DETECTED'));
    console.log(colors.error('The ShadowShield system has configuration or connectivity issues.'));
    console.log(colors.info('Please check the details above and refer to DEPLOYMENT_COMPLETE.md for troubleshooting.'));
  }
  console.log(colors.header('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

// Run the report
generateSystemReport().catch(error => {
  console.error(colors.error(`Fatal error running system check: ${error.message}`));
});
