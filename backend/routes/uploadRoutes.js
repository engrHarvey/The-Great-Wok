const express = require('express');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Initialize Google Cloud Storage with correct credentials
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Ensure the private key is correctly formatted
  },
});

// Specify the Google Cloud Storage bucket
const bucketName = process.env.GCS_BUCKET_NAME;

// Multer setup to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const blob = storage.bucket(bucketName).file(`${Date.now()}_${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err) => {
    console.error('Failed to upload to Google Cloud Storage', err);
    res.status(500).json({ error: 'Failed to upload image' });
  });

  blobStream.on('finish', () => {
    // Construct the public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
    res.status(200).json({ imageUrl: publicUrl });
  });

  blobStream.end(req.file.buffer);
});

module.exports = router;
