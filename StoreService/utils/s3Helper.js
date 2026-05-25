// const AWS = require('aws-sdk');
// const { Buffer } = require('buffer');
// const multer = require('multer');
// // Configure AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const upload = multer({ storage: multer.memoryStorage() });

// const uploadToS3 = async (base64String, folder) => {
//   try {
//     // Extract metadata from Base64 string
//     const matches = base64String.match(/^data:(.*?);base64,(.+)$/);
//     if (!matches || matches.length !== 3) {
//       throw new Error('Invalid Base64 string');
//     }

//     const mimeType = matches[1];
//     const base64Data = matches[2];
//     const buffer = Buffer.from(base64Data, 'base64');

//     // Generate a unique file name
//     const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${mimeType.split('/')[1]}`;

//     // S3 upload parameters
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: fileName,
//       Body: buffer,
//       ContentType: mimeType,
//     };

//     // Upload to S3
//     const data = await s3.upload(params).promise();
//     return data.Location; // Return the file URL
//   } catch (error) {
//     throw new Error(`Failed to upload to S3: ${error.message}`);
//   }
// };

// module.exports = { uploadToS3, upload };

const { BlobServiceClient } = require("@azure/storage-blob");
const { Buffer } = require("buffer");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const upload = multer({ storage: multer.memoryStorage() });

// Azure config
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

// Utility: Sanitize folder and file names
const sanitizeName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[:?#%&+\/\\]/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "");
};

const uploadToAzure = async (base64String, folder = "uploads") => {
  try {
    if (!base64String || typeof base64String !== "string") {
      throw new Error("Image data is missing or invalid");
    }

    const matches = base64String.match(/^data:(.*?);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error(
        "Invalid Base64 string format — expected 'data:image/...;base64,...'"
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const buffer = Buffer.from(base64Data, "base64");
    const extension = mimeType.split("/")[1] || "jpg";

    const safeFolder = sanitizeName(folder);
    const fileName = `${safeFolder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}.${extension}`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
      },
    });
    return blockBlobClient.url;
  } catch (error) {
    throw new Error(`Failed to upload to Azure: ${error.message}`);
  }
};

module.exports = { uploadToAzure, upload };
