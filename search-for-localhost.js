const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// Directories to exclude
const excludeDirs = ['node_modules', 'dist', '.git', 'public/uploads'];

// File extensions to include
const includeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.json', '.env'];

async function searchFiles(dir, searchTerm) {
  let results = [];
  
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const nestedResults = await searchFiles(filePath, searchTerm);
          results = results.concat(nestedResults);
        }
      } else {
        const ext = path.extname(filePath);
        if (includeExtensions.includes(ext)) {
          try {
            const content = await readFile(filePath, 'utf8');
            if (content.includes(searchTerm)) {
              results.push({
                file: filePath,
                content,
                searchTerm
              });
            }
          } catch (err) {
            console.error(`Error reading file ${filePath}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return results;
}

async function searchLocalhostReferences() {
  console.log('Searching for localhost references...');
  
  const searchTerms = [
    'localhost:5000',
    'localhost',
    '127.0.0.1'
  ];
  
  const rootDir = process.cwd();
  
  for (const term of searchTerms) {
    console.log(`\nSearching for "${term}":`);
    const results = await searchFiles(rootDir, term);
    
    if (results.length === 0) {
      console.log(`No matches found for "${term}"`);
    } else {
      console.log(`Found ${results.length} matches for "${term}":`);
      
      for (const result of results) {
        console.log(`\nFile: ${result.file}`);
        
        // Extract the lines containing the search term
        const lines = result.content.split('\n');
        let found = false;
        
        lines.forEach((line, index) => {
          if (line.includes(result.searchTerm)) {
            found = true;
            console.log(`Line ${index + 1}: ${line.trim()}`);
          }
        });
        
        if (!found) {
          console.log('(Term found in file but not in any single line - might be across lines)');
        }
      }
    }
  }
}

searchLocalhostReferences().catch(err => {
  console.error('Error:', err);
});