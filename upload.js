require('dotenv').config();
const AWS = require('aws-sdk');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

// Configuration - Loaded from .env file
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID; 
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'live';
const RECORDING_PATH = process.env.RECORDING_PATH || './media/live'; 

const s3 = new AWS.S3({
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

console.log('🚀 Sportix Auto-Uploader started...');
console.log(`👀 Watching for recordings in: ${RECORDING_PATH}`);

// Initialize watcher
const watcher = chokidar.watch(RECORDING_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher.on('add', async (filePath) => {
  if (!filePath.endsWith('.mp4')) return;

  const fileName = path.basename(filePath);
  console.log(`📦 New recording detected: ${fileName}`);
  console.log('⏳ Starting upload to R2...');

  try {
    const fileStream = fs.createReadStream(filePath);
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: `recordings/${fileName}`,
      Body: fileStream,
      ContentType: 'video/mp4'
    };

    await s3.upload(params).promise();
    
    console.log(`✅ Upload successful: ${fileName}`);
    console.log(`🔗 Public URL: recordings/${fileName}`);
    
    // Optional: Delete local file after upload to save space
    // fs.unlinkSync(filePath);
    // console.log(`🗑️ Local file deleted: ${fileName}`);

  } catch (error) {
    console.error(`❌ Upload failed for ${fileName}:`, error.message);
  }
});

watcher.on('error', error => console.error(`Watcher error: ${error}`));
