# ShadowShield API Connection Testing

This directory contains tools for testing the connection between the frontend and backend.

## Direct Login Test Page

Open the direct login test page to test authentication with the backend:

[Direct Login Test Page](/direct-login-test.html)

This simplified page allows you to:
- Test login directly with the backend API
- Test registration directly with the backend API
- Bypasses the React application to isolate connection issues

## API Connection Test Page

Open the API tester page to check connectivity with the backend:

[API Tester Page](/api-tester.html)

This page allows you to:
- Test the health endpoint
- Test the login endpoint
- Test the register endpoint
- Check CORS configuration

## CORS Configuration Test

Use this tool to diagnose CORS-related issues:

[CORS Test Page](/cors-test.html)

This specialized tool helps you:
- Test if your current origin is allowed by the backend's CORS configuration
- Analyze CORS headers returned by the backend
- Troubleshoot common CORS issues

## Connection Test Script

You can also use the JavaScript connection tester in your browser console:

```javascript
// In your browser console, run:
fetch('/connection-test.js')
  .then(response => response.text())
  .then(text => eval(text))
  .then(() => window.testAPI.runAllTests());
```

## If You're Having Connection Issues

1. Check if the backend is accessible by opening:
   https://shadowshield-backend.onrender.com/health

2. Verify that CORS is properly configured for your frontend domain

3. Try clearing your browser's local storage and cache

4. Check the browser console for detailed error messages
