const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const fs = require('fs');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Ensure upload directory exists with proper permissions
const uploadDir = process.env.FILE_UPLOAD_PATH || './public/uploads';
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  } catch (err) {
    console.error(`Error creating upload directory: ${err.message}`);
    // Don't exit, continue trying to start the server
  }
}

// Connect to database
connectDB();

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shadowshield')
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//   });

// Route files
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const messageRoutes = require('./routes/messageRoutes');
const securityRoutes = require('./routes/securityRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading - make sure this appears before your route definitions
app.use(fileupload({
  useTempFiles: false, // Set to true if you want to use temp files
  createParentPath: true, // Automatically creates upload directories
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
  abortOnLimit: true, // Return 413 when limit is reached
  responseOnLimit: "File size limit has been reached"
}));

// Enable CORS with appropriate origins for deployment
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

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ShadowShield API',
    environment: process.env.NODE_ENV,
    status: 'operational'
  });
});

// Health check route for connection testing
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API health check',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin || 'Not provided',
      allowedOrigins: [
        'https://frontend-ritiks-projects-9f564ec3.vercel.app',
        'https://shadowshield.vercel.app'
      ]
    },
    environment: process.env.NODE_ENV,
    info: 'If you see this message, CORS is properly configured for your origin'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
  });
}

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});