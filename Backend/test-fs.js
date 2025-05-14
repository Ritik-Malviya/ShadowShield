const fs = require('fs');
const path = require('path');

// Use absolute paths for reliability
const basePath = path.resolve(__dirname);
const uploadPath = path.join(basePath, 'public', 'uploads');

console.log('Base directory:', basePath);
console.log('Upload directory:', uploadPath);

// Test directory creation
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('Created upload directory successfully');
  } else {
    console.log('Upload directory already exists');
  }
  
  // Test file write
  const testFile = path.join(uploadPath, 'test.txt');
  fs.writeFileSync(testFile, 'Test content');
  console.log('Successfully wrote test file:', testFile);
  
  // Test file read
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('Read file content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('Successfully deleted test file');
  
  console.log('Filesystem tests PASSED - You can write files to this location');
} catch (err) {
  console.error('Error during filesystem test:', err.message);
  console.log('Filesystem tests FAILED - Fix permissions or paths');
}