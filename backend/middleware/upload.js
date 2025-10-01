// middleware/upload.js
import dotenv from "dotenv";   // ✅ load first
dotenv.config();

import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

// ✅ Validate env early
if (!process.env.MINIO_ROOT_USER || !process.env.MINIO_ROOT_PASSWORD) {
  throw new Error("❌ Missing MinIO credentials in .env");
}
if (!process.env.MINIO_ENDPOINT) {
  console.warn("⚠️ MINIO_ENDPOINT not set, using default localhost endpoint");
}

// ✅ Shared allowed MIME types
const ALLOWED_MIME = {
  avatars: ["image/jpeg", "image/png", "image/gif", "image/jpg", "image/pjpeg"],
  portfolio: ["image/jpeg", "image/png", "image/gif", "image/jpg", "video/mp4", "image/pjpeg"],
  docs: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/pjpeg"
  ],
  attachments: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "image/pjpeg",
    "video/mp4",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const ALL_ALLOWED_MIME = [
  ...ALLOWED_MIME.avatars,
  ...ALLOWED_MIME.docs,
  ...ALLOWED_MIME.portfolio,
  ...ALLOWED_MIME.attachments,
];

// ✅ S3 client factory
const createS3 = () => {
  const s3 = new S3Client({
    region: "us-east-1",
    endpoint:
      process.env.MINIO_ENDPOINT ||
      "http://serviceconnect-minio-1cdb67-94-72-105-181.traefik.me",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ROOT_USER,
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
    },
  });

  console.log("🟢 MinIO creds at runtime:", {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ? "***hidden***" : null,
  });

  return s3;
};

// ✅ Reusable uploader generator
export const getUploader = (bucketName, folderName = "") => {
  const s3 = createS3();

  const fileFilter = (req, file, cb) => {
    const mimes = ALLOWED_MIME[folderName] || [];
    if (!mimes.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.originalname} (${file.mimetype})`
        ),
        false
      );
    }
    cb(null, true);
  };

  return multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const filename = `${folderName}/${Date.now()}-${file.originalname}`;
        cb(null, filename);
      },
    }),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

// ✅ Helper: generate file URL after upload
export const getFileUrl = (bucket, key) =>
  `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`;

// ✅ Ready-made uploaders
const bucket = process.env.MINIO_BUCKET || "serviceconnect-files";
const baseUploader = getUploader(bucket);

export const multiUpload = multer({
  storage: multerS3({
    s3: createS3(),
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = `${file.fieldname}/${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    const mimes = ALLOWED_MIME[file.fieldname] || [];
    if (!ALL_ALLOWED_MIME.includes(file.mimetype)) {
      return cb(
        new Error(`Invalid file type: ${file.originalname} (${file.mimetype})`),
        false
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).any();

export const upload = getUploader(bucket, "avatars");
export const portfolioUpload = getUploader(bucket, "portfolio");
export const docUpload = getUploader(bucket, "docs");
export const attachmentUpload = getUploader(bucket, "attachments");
export default multiUpload;