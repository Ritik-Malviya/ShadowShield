const debugUpload = (req, res, next) => {
  console.log('== DEBUG UPLOAD MIDDLEWARE ==');
  console.log('Request URL:', req.originalUrl);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Files present:', req.files ? 'Yes' : 'No');
  if (req.files) {
    console.log('Files keys:', Object.keys(req.files));
    if (req.files.file) {
      console.log('File name:', req.files.file.name);
      console.log('File size:', req.files.file.size);
      console.log('File mime:', req.files.file.mimetype);
    }
  }
  console.log('== END DEBUG MIDDLEWARE ==');
  next();
};

module.exports = debugUpload;