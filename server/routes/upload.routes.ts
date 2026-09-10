import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { rateLimiter } from '../middleware/rateLimiter.js';

export const uploadRouter = Router();

// Rate limiter for uploads: 60 uploads per minute per client
const uploadLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Upload limit reached. Please wait a moment before uploading more files.'
});

// Ensure upload directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed extensions for print commercial production
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif',
  '.pdf',
  '.zip', '.rar', '.7z', '.tar',
  '.ai', '.cdr', '.eps', '.psd', '.tif', '.tiff'
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const cleanBase = path.basename(file.originalname, rawExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${cleanExt}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} is not supported. Please upload PDF, AI, CDR, PSD, ZIP, or Images.`));
    }
  }
});

// POST /api/upload - Upload single print file or image
uploadRouter.post('/', uploadLimiter, (req: Request, res: Response) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'File size exceeds 50MB limit. Please compress or optimize your artwork.'
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext) || req.file.mimetype.startsWith('image/');
    const isZip = ['.zip', '.rar', '.7z', '.tar'].includes(ext);
    const isPdf = ext === '.pdf';
    const isVector = ['.ai', '.cdr', '.eps', '.psd', '.tif', '.tiff'].includes(ext);

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      file: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        extension: ext,
        isImage,
        isZip,
        isPdf,
        isVector
      }
    });
  });
});
