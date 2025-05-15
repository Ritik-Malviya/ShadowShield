# ShadowShield Deployment Guide

This guide explains how to deploy ShadowShield to Vercel (frontend) and Render (backend).

## Frontend Deployment (Vercel)

1. Make sure your `.env.production` file has the correct backend URL:
   ```
   VITE_API_URL=https://shadowshield-backend.onrender.com
   ```

2. Push your code to GitHub.

3. Connect your repository to Vercel.

4. Deploy with the following settings:
   - Framework: Vite
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Backend Deployment (Render)

1. Make sure your CORS configuration in `Backend/server.js` allows your frontend domain:
   ```javascript
   app.use(cors({
     origin: function(origin, callback) {
       // Allow requests with no origin (like mobile apps, curl, Postman)
       if(!origin) return callback(null, true);
       
       const allowedOrigins = [
         'https://frontend-ritiks-projects-9f564ec3.vercel.app',
         'https://shadowshield.vercel.app',
         'https://shadowshield-frontend.vercel.app'
       ];
       
       // Check if the origin is allowed
       if(allowedOrigins.indexOf(origin) !== -1 || origin.match(/\.vercel\.app$/)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```

2. Push your code to GitHub.

3. Connect your repository to Render.

4. Deploy with the following settings:
   - Type: Web Service
   - Name: shadowshield-backend
   - Build Command: `npm install && cd Backend && npm install`
   - Start Command: `node index.js`
   - Environment Variables:
     - NODE_ENV: production
     - (Add any other required environment variables)

## Troubleshooting

### API Connection Issues
- Ensure all API calls in the frontend include `/api` prefix
- Check CORS settings in the backend
- Verify environment variables are correctly set
- If you're getting `ERR_CONNECTION_REFUSED` errors:
  1. Check the browser console for the actual URL being requested
  2. Make sure the frontend is using the correct API URL (`https://shadowshield-backend.onrender.com`)
  3. Try clearing browser cache and local storage
  4. Ensure Vite is correctly loading environment variables (check for console logs showing "API URL from environment")
  5. Try the direct fallback login mechanism that's built in

### Common Error Types & Solutions

#### "Network Error" with ERR_CONNECTION_REFUSED
This typically means:
- The backend server at the URL being accessed is not running
- There's a CORS issue preventing the connection
- A firewall is blocking the request

Solutions:
```
# Check if the backend endpoint responds directly in the browser
# Open https://shadowshield-backend.onrender.com/api/auth/login in browser

# Verify environment variables in the frontend build
# Look for "API URL from environment:" log in the browser console

# Try the application in incognito mode or a different browser
```

#### 401 Unauthorized Errors
This means authentication failed due to:
- Incorrect credentials
- Invalid token format
- Token expired

Solutions:
```
# Check the credentials being sent
# Clear local storage and tokens
# Verify the token format in localStorage
```

### File Upload Issues
- Check file upload paths and permissions on the server
- Ensure upload directory exists and has write permissions

### Connection Testing
You can use the health check endpoint to verify if your connection to the backend is working properly:

```
# Open in browser or use curl/Postman:
https://shadowshield-backend.onrender.com/health
```

#### Test Tools

1. **Direct Login Test**:
   - Included at `/direct-login-test.html` in the frontend deployment
   - Example: https://frontend-ritiks-projects-9f564ec3.vercel.app/direct-login-test.html
   - Simple standalone form to test login and registration directly with the backend
   - Bypasses React to isolate connection issues

2. **API Tester Page**:
   - Included at `/api-tester.html` in the frontend deployment
   - Example: https://frontend-ritiks-projects-9f564ec3.vercel.app/api-tester.html
   - Provides interactive testing of all API endpoints

3. **CORS Test Tool**:
   - Included at `/cors-test.html` in the frontend deployment
   - Example: https://frontend-ritiks-projects-9f564ec3.vercel.app/cors-test.html
   - Specialized tool for diagnosing CORS configuration issues
   - Tests preflight requests and analyzes CORS headers

2. **Server-side test script**:
```bash
# Install axios if not already installed
npm install axios

# Run the test script
node api-connection-test.js

# To test against a different backend URL:
API_URL=https://your-backend-url.com node api-connection-test.js
```

3. **Browser-side test script**:
```javascript
// In your browser console, navigate to the app and run:
fetch('/connection-test.js')
  .then(response => response.text())
  .then(text => eval(text))
  .then(() => window.testAPI.runAllTests());
```

These tests check:
1. Basic connectivity to the /health endpoint
2. Connectivity to the login endpoint
3. Connectivity to the register endpoint
4. CORS configuration

If you can access these endpoints but login/registration fails in the app, it's likely an issue with:
1. API endpoint paths (missing `/api` prefix)
2. Authentication credentials
3. Token handling

### Authentication Issues
- Verify cookies and tokens are properly set and transmitted
- Check CORS credentials settings 
- Try clearing your browser storage and cache:
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
```

### Frontend Environment Debugging
If you need to verify what environment variables your application is using:
```javascript
// Run in browser console
console.log(import.meta.env.VITE_API_URL);
```
