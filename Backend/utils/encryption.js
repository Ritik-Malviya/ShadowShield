const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a random encryption key
exports.generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Encrypt a file
exports.encryptFile = (inputPath, outputPath, key) => {
  return new Promise((resolve, reject) => {
    try {
      const iv = crypto.randomBytes(16);
      const keyBuffer = Buffer.from(key, 'hex');
      const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
      
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);
      
      // Write the IV at the beginning of the file
      output.write(iv);
      
      input.pipe(cipher).pipe(output);
      
      output.on('finish', () => {
        resolve();
      });
      
      output.on('error', err => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Decrypt a file
exports.decryptFile = (inputPath, outputPath, key) => {
  return new Promise((resolve, reject) => {
    try {
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);
      
      // Read the IV from the beginning of the file
      let iv;
      let decipher;
      let isFirstChunk = true;
      
      input.on('data', chunk => {
        if (isFirstChunk) {
          iv = chunk.slice(0, 16);
          const restOfChunk = chunk.slice(16);
          isFirstChunk = false;
          
          try {
            const keyBuffer = Buffer.from(key, 'hex');
            decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
            
            // Process the rest of the first chunk
            if (restOfChunk.length > 0) {
              output.write(decipher.update(restOfChunk));
            }
          } catch (err) {
            input.destroy();
            output.destroy();
            reject(err);
          }
        } else {
          // Process subsequent chunks
          output.write(decipher.update(chunk));
        }
      });
      
      input.on('end', () => {
        try {
          if (decipher) {
            output.write(decipher.final());
          }
          output.end();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      
      input.on('error', err => {
        reject(err);
      });
      
      output.on('error', err => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
