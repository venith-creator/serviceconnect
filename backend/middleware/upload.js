// middleware/upload.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const getUploader = (folderName = '') => {
    const fullPath = path.join('uploads', folderName)

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }


    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fullPath) 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
    })

    const fileFilter = (req, file, cb) => {
    let allowed;
    switch (folderName) {
      case "avatars":
        allowed = [".jpg", ".jpeg", ".png"];
        break;
      case "portfolio":
        allowed = [".jpg", ".jpeg", ".png"];
        break;
      case "docs":
        allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
        break;
      default:
        allowed = [];
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error(`Invalid file type: ${ext}`), false);
    }
    cb(null, true);
  };


return multer({ storage, fileFilter ,
  limits: { fileSize: 5 * 1024 * 1024 } })
}