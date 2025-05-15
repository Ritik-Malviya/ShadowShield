/**
 * Connection Test Utility for ShadowShield
 * 
 * This file contains browser-compatible code to test API connections.
 * You can either include this as a script or copy-paste sections into your browser console.
 */

// PRODUCTION URL
const PRODUCTION_API_URL = 'https://shadowshield-backend.onrender.com';

// Test functions
const testHealthEndpoint = async () => {
  console.log(`Testing health endpoint at ${PRODUCTION_API_URL}/health`);
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/health`);
    const data = await response.json();
    console.log('✅ Health endpoint is working!', data);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint test failed:', error);
    return false;
  }
};

const testLoginEndpoint = async (email = 'test@example.com', password = 'password123') => {
  console.log(`Testing login endpoint at ${PRODUCTION_API_URL}/api/auth/login`);
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.status === 401) {
      console.log('✅ Login endpoint is reachable (returned 401 Unauthorized, which is expected for invalid credentials)');
      return true;
    } else if (response.ok) {
      console.log('✅ Login endpoint is working and authorized the test credentials!');
      return true;
    } else {
      console.error('❌ Login endpoint returned unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Login endpoint test failed:', error);
    return false;
  }
};

const testRegisterEndpoint = async () => {
  console.log(`Testing register endpoint at ${PRODUCTION_API_URL}/api/auth/register`);
  
  const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: randomEmail,
        password: 'password123'
      })
    });
    
    if (response.ok) {
      console.log('✅ Register endpoint is working!');
      return true;
    } else {
      console.error('❌ Register endpoint returned unexpected status:', response.status);
      const data = await response.json();
      console.error('Response data:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Register endpoint test failed:', error);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('=== ShadowShield API Connection Tests ===');
  console.log('');
  
  const healthResult = await testHealthEndpoint();
  console.log('');
  
  const loginResult = await testLoginEndpoint();
  console.log('');
  
  const registerResult = await testRegisterEndpoint();
  console.log('');
  
  console.log('=== Test Results Summary ===');
  console.log(`Health Endpoint: ${healthResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login Endpoint: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Register Endpoint: ${registerResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthResult && loginResult && registerResult) {
    console.log('\n✅ ALL TESTS PASSED! API connection is working correctly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please check the errors above.');
  }
};

// Export for browsers
if (typeof window !== 'undefined') {
  window.testAPI = {
    runAllTests,
    testHealthEndpoint,
    testLoginEndpoint,
    testRegisterEndpoint,
    PRODUCTION_API_URL
  };
  console.log('API testing functions loaded. Run window.testAPI.runAllTests() to test all endpoints.');
}

// Export for Node.js
if (typeof module !== 'undefined') {
  module.exports = {
    runAllTests,
    testHealthEndpoint,
    testLoginEndpoint,
    testRegisterEndpoint,
    PRODUCTION_API_URL
  };
}

// Automatically run tests if in Node environment with direct execution
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}
