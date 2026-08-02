const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const OCR_SERVICE_TOKEN = process.env.OCR_SERVICE_TOKEN;

if (!OCR_SERVICE_TOKEN) {
  console.error("FATAL ERROR: OCR_SERVICE_TOKEN is not defined.");
  process.exit(1);
}

// --- Security Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }
  const token = authHeader.split(' ')[1];

  // Use timing-safe comparison to prevent timing attacks
  try {
    const tokenMatch = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(OCR_SERVICE_TOKEN));
    if (!tokenMatch) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
  } catch (e) {
    // Handle cases where tokens have different lengths
    return res.status(401).json({ error: 'Unauthorized: Invalid token format.' });
  }

  next();
};

// --- File Upload Configuration ---
const upload = multer({
  dest: '/tmp/', // Use a temporary directory
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only JPEG, PNG, and WEBP are allowed.'), false);
    }
  },
});

// --- API Endpoints ---

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// OCR processing endpoint
app.post('/ocr', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const tempFilePath = req.file.path;
  const startTime = Date.now();

  try {
    const supportedLangs = ['eng', 'hin', 'spa'];
    const requestedLang = req.body.language || 'eng';
    const language = supportedLangs.includes(requestedLang) ? requestedLang : 'eng';

    const config = {
      lang: language,
      oem: 1,
      psm: 3,
    };

    console.log(`[OCR] Processing file: ${req.file.originalname}, lang: ${language}`);
    const text = await tesseract.recognize(tempFilePath, config);
    const duration = Date.now() - startTime;
    console.log(`[OCR] Success for file: ${req.file.originalname}, duration: ${duration}ms`);

    res.status(200).json({
      text: text.trim(),
      language: language,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[OCR] Error processing file: ${req.file.originalname}, duration: ${duration}ms`, {
      errorMessage: error.message,
    });
    res.status(500).json({ error: 'Failed to process image with OCR.' });
  } finally {
    // --- Temporary File Cleanup ---
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        console.error(`[Cleanup] Failed to delete temporary file: ${tempFilePath}`, err);
      }
    });
  }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`OCR microservice listening on port ${PORT}`);
});