const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Check for MongoDB URI
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing in .env file');
  console.log('Creating sample .env file...');
  
  // Create sample .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  const sampleContent = `NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/shadowshield
JWT_SECRET=yourjwtsecretkey123456
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FILE_UPLOAD_PATH=${path.join(__dirname, 'public', 'uploads').replace(/\\/g, '/')}`;

  fs.writeFileSync(envPath, sampleContent);
  console.log('Created sample .env file at:', envPath);
  console.log('Please restart this test after updating the MongoDB URI if needed');
  process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected successfully!');
  
  // Test creating a document
  const TestSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  const Test = mongoose.model('Test', TestSchema);
  
  try {
    const testDoc = await Test.create({ name: 'Test Document' });
    console.log('Created test document:', testDoc);
    
    // Read the document back
    const foundDoc = await Test.findById(testDoc._id);
    console.log('Found test document:', foundDoc);
    
    // Delete the test document
    await Test.findByIdAndDelete(testDoc._id);
    console.log('Deleted test document');
    
    console.log('Database tests PASSED - Your MongoDB connection works!');
  } catch (err) {
    console.error('Error during database operations:', err);
    console.log('Database tests FAILED');
  }
  
  // Close connection
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Database tests FAILED - Check your MongoDB connection string');
});