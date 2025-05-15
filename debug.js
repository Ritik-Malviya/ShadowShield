// Debug script to print out the directory structure on Render
const fs = require('fs');
const path = require('path');

// Function to recursively list directories
function listDirectoryContents(dir, depth = 0) {
  console.log(`${'  '.repeat(depth)}${path.basename(dir)}/`);
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        listDirectoryContents(filePath, depth + 1);
      } else {
        console.log(`${'  '.repeat(depth + 1)}${file}`);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Print environment information
console.log('=== ENVIRONMENT INFORMATION ===');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Platform: ${process.platform}`);
console.log('=== DIRECTORY STRUCTURE ===');

// List the contents of the current directory
listDirectoryContents(process.cwd());
