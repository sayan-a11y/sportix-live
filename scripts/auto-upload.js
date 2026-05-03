require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 🔹 R2 config
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'live';
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

// 🔹 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const WATCH_DIR = './media/live';

// Ensure the watch directory exists
if (!fs.existsSync(WATCH_DIR)) {
  fs.mkdirSync(WATCH_DIR, { recursive: true });
}

console.log(`🚀 Starting Sportix Auto-Upload System...`);
console.log(`📍 Bucket: ${BUCKET}`);
console.log(`👀 Watching folder: ${path.resolve(WATCH_DIR)}`);

// 👀 Watch recording folder
chokidar.watch(WATCH_DIR, {
  persistent: true,
  ignoreInitial: true, 
  awaitWriteFinish: {
    stabilityThreshold: 3000, // Wait 3 seconds after file is closed
    pollInterval: 100
  }
}).on('add', async (filePath) => {
  if (!filePath.endsWith('.mp4')) return;

  const startTime = Date.now();
  console.log(`\n🆕 New video detected: ${filePath}`);

  try {
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`📊 File Size: ${fileSizeMB} MB`);
    console.log(`📤 Uploading ${fileName} to Cloudflare R2...`);

    const fileStream = fs.createReadStream(filePath);

    // 🔹 Upload to R2
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET,
        Key: fileName,
        Body: fileStream,
        ContentType: 'video/mp4',
      },
    });

    upload.on("httpUploadProgress", (progress) => {
      const percentage = ((progress.loaded / progress.total) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${percentage}%`);
    });

    await upload.done();

    console.log("\n✅ Uploaded to R2 successfully!");

    // 🔹 Public URL (Ensure trailing slash handling)
    const baseUrl = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL;
    const videoUrl = `${baseUrl}/${fileName}`;

    console.log(`💾 Saving record to Supabase...`);

    // 🔹 Save to DB (Using Prisma model name 'Video')
    const { data, error } = await supabase.from('Video').insert([
      {
        id: `vid_${Date.now()}`, // Optional: Use custom ID or let DB handle it (Prisma uses cuid)
        title: fileName.replace('.mp4', '').replace(/[-_]/g, ' '),
        videoUrl: videoUrl,
        thumbnail: "", // Future improvement: Generate thumbnail
        category: "Replay",
        isFeatured: false,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]).select();

    if (error) {
      console.error("❌ Database Error:", error.message);
    } else {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`🎉 Success! Replay available in ${duration}s`);
      console.log(`🔗 URL: ${videoUrl}`);
    }

  } catch (err) {
    console.error("❌ Critical Error:", err);
  }
});
