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

### File Upload Issues
- Check file upload paths and permissions on the server
- Ensure upload directory exists and has write permissions

### Authentication Issues
- Verify cookies and tokens are properly set and transmitted
- Check CORS credentials settings
