// This file serves as a redirection to the Backend server
// Render is looking for a root-level entry point, so we redirect to the correct file
const fs = require('fs');
const path = require('path');

console.log('Starting application from root index.js');
console.log('Current working directory:', process.cwd());

// Check for Backend directory
const backendPath = path.join(__dirname, 'Backend');
if (!fs.existsSync(backendPath)) {
    console.error('ERROR: Backend directory not found!');
    console.log('Listing current directory contents:');
    fs.readdirSync(__dirname).forEach(file => {
        console.log(' - ' + file);
    });
    process.exit(1);
}

// Check for server.js file
const serverPath = path.join(backendPath, 'server.js');
if (!fs.existsSync(serverPath)) {
    console.error('ERROR: server.js not found in Backend directory!');
    console.log('Listing Backend directory contents:');
    fs.readdirSync(backendPath).forEach(file => {
        console.log(' - ' + file);
    });
    process.exit(1);
}

console.log('Backend directory and server.js file found');
console.log('Redirecting to Backend server.js');

// Require and execute the Backend server
try {
    require('./Backend/server.js');
} catch (error) {
    console.error('Failed to start Backend server:', error);
    process.exit(1);
}
