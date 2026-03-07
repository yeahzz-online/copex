const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

function getBucketName() {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }
  return process.env.AWS_S3_BUCKET;
}

async function createPresignedUploadUrl({ key, contentType }) {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType
  });
  return getSignedUrl(s3Client, command, { expiresIn: 600 });
}

async function createPresignedDownloadUrl({ key }) {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key
  });
  return getSignedUrl(s3Client, command, { expiresIn: 600 });
}

function buildPublicFileUrl(key) {
  if (process.env.CLOUDFRONT_URL) {
    return `${process.env.CLOUDFRONT_URL.replace(/\/$/, "")}/${key}`;
  }
  return `https://${getBucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = {
  buildPublicFileUrl,
  createPresignedDownloadUrl,
  createPresignedUploadUrl
};
