# ShadowShield Deployment Guide

This guide provides detailed steps for deploying both the frontend and backend components of ShadowShield, along with troubleshooting steps for common deployment issues.

## 📋 Deployment Checklist

- [x] Backend API configured correctly with CORS
- [x] Frontend API service updated to use production URLs
- [x] Environment variables configured for production
- [x] Test tools created and deployed
- [x] API endpoint paths standardized with `/api` prefix

## 🚀 Backend Deployment (Render)

### Deployment Steps

1. **Create a new Web Service on Render**
   - Sign in to [Render](https://render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

2. **Configure Build Settings**
   - Name: `shadowshield-backend`
   - Root Directory: `Backend` (if using monorepo)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FILE_UPLOAD_PATH=./public/uploads
   FRONTEND_URL=https://frontend-ritiks-projects-9f564ec3.vercel.app
   ```

4. **Deploy and Monitor**
   - Click "Create Web Service"
   - Monitor the deployment logs for errors
   - Note the generated URL: `https://shadowshield-backend.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Deployment Steps

1. **Create a new Project on Vercel**
   - Sign in to [Vercel](https://vercel.com/)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository and branch

2. **Configure Build Settings**
   - Root Directory: `Frontend` (if using monorepo)
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://shadowshield-backend.onrender.com
   ```

4. **Deploy and Monitor**
   - Click "Deploy"
   - Monitor the deployment logs for errors
   - Note the generated URL: `https://frontend-ritiks-projects-9f564ec3.vercel.app`

## 🔄 Connecting Frontend to Backend

For successful connection between the frontend and backend:

1. **Frontend Configuration**
   - The frontend API service uses a hardcoded production URL as a fallback
   - All API requests include the `/api` prefix
   - Requests have a timeout to prevent hanging
   - Error handling is enhanced for connection issues

2. **Backend Configuration**
   - CORS is configured to allow requests from the frontend domain
   - The health endpoint provides detailed connection information
   - Error handling middleware is in place
   - File upload paths are correctly set

## 🧪 Testing the Deployment

Use the following tools to test your deployment:

### Test Tools

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

4. **Node.js Connection Test Script**:
   ```bash
   cd "C:\Users\ritik\Downloads\codecrew-main" && node api-connection-test.js
   ```

## ⚠️ Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors

**Symptoms**: 
- Requests fail with "Access to fetch... has been blocked by CORS policy"
- Browser console shows CORS error messages

**Solutions**:
- Verify backend CORS configuration includes your frontend domain
- Check the `/cors-test.html` page to diagnose issues
- Ensure OPTIONS preflight requests are handled correctly
- Verify that the frontend origin matches exactly what's allowed in the backend

#### 2. Connection Timeouts

**Symptoms**:
- Requests take a long time and eventually fail
- "Network Error" in console without specific error details

**Solutions**:
- Check if the backend service is running (cold starts on free tier)
- Use the Connection Monitor in the frontend to track response times
- Adjust the timeout settings in the API service if needed
- Consider upgrading from free tier for more reliable performance

#### 3. Authentication Issues

**Symptoms**:
- Login/Register works but sessions expire unexpectedly
- "Unauthorized" errors when accessing protected routes

**Solutions**:
- Verify JWT token is being stored correctly
- Check if token is being sent in the Authorization header
- Confirm the JWT secret is the same in development and production
- Ensure the token expiration is set appropriately

## 📊 Monitoring and Performance

### Health Monitoring

1. **Backend Health Check**:
   - Endpoint: `https://shadowshield-backend.onrender.com/health`
   - Provides detailed information about the backend status

2. **Frontend Connection Monitor**:
   - Built-in component that monitors API connectivity
   - Appears automatically when connection issues are detected

### Performance Optimization

For better performance:
- Consider upgrading from free tier hosting for both frontend and backend
- Implement caching for frequently accessed resources
- Optimize file uploads and processing
- Consider using a CDN for static assets

## 🔄 Updating the Deployment

When updating your application:

1. **Backend Updates**:
   - Push changes to your repository
   - Render will automatically redeploy

2. **Frontend Updates**:
   - Push changes to your repository
   - Vercel will automatically redeploy

3. **After Updates**:
   - Use the test tools to verify everything still works
   - Check for any new environment variables or configuration needs

## 📞 Support and Resources

If you encounter problems:
- Check Render or Vercel logs for specific error messages
- Use the test tools to isolate the issue
- Review the frontend console for error details
- Check MongoDB connection status if database-related issues occur
