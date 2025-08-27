/**
 * Image Processing Utilities
 * Handles image validation, conversion, and optimization for AI analysis
 */

const { createError } = require('../middleware/errorHandler');

// Allowed image formats
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSIONS = { width: 100, height: 100 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
const validateImage = (file) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    throw createError('No image file provided', 400);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file format
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  const mimeTypeFormat = file.mimetype.split('/')[1]?.toLowerCase();
  
  if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
    errors.push(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
  }

  if (!file.mimetype.startsWith('image/')) {
    errors.push('File must be an image');
  }

  if (errors.length > 0) {
    throw createError(errors.join('. '), 400);
  }

  return {
    valid: true,
    format: fileExtension,
    size: file.size,
    mimeType: file.mimetype
  };
};

/**
 * Convert image buffer to base64 with data URL prefix
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - Image MIME type
 * @returns {string} Base64 data URL
 */
const convertToBase64 = (buffer, mimeType) => {
  if (!buffer) {
    throw createError('No image buffer provided', 400);
  }

  try {
    const base64String = buffer.toString('base64');
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw createError('Failed to process image', 500);
  }
};

/**
 * Extract base64 data from data URL
 * @param {string} dataUrl - Data URL string
 * @returns {string} Pure base64 string
 */
const extractBase64 = (dataUrl) => {
  if (!dataUrl) {
    throw createError('No data URL provided', 400);
  }

  try {
    // Handle both formats: "data:image/jpeg;base64,..." and plain base64
    if (dataUrl.startsWith('data:')) {
      const base64Index = dataUrl.indexOf('base64,');
      if (base64Index === -1) {
        throw createError('Invalid data URL format', 400);
      }
      return dataUrl.substring(base64Index + 7);
    }
    
    return dataUrl;
  } catch (error) {
    console.error('Base64 extraction error:', error);
    throw createError('Invalid image data format', 400);
  }
};

/**
 * Validate base64 image string
 * @param {string} base64String - Base64 image data
 * @returns {boolean} Is valid
 */
const validateBase64Image = (base64String) => {
  try {
    // Check if it's valid base64
    const buffer = Buffer.from(base64String, 'base64');
    
    // Check minimum size (basic validation)
    if (buffer.length < 100) {
      return false;
    }

    // Check for image file signatures (magic numbers)
    const header = buffer.subarray(0, 8);
    
    // JPEG: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      return true;
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      return true;
    }
    
    // WebP: RIFF ... WEBP
    if (buffer.includes(Buffer.from('WEBP'))) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get image metadata from buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {Object} Image metadata
 */
const getImageMetadata = (buffer) => {
  try {
    const metadata = {
      size: buffer.length,
      format: 'unknown'
    };

    // Detect format based on file signature
    const header = buffer.subarray(0, 8);
    
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      metadata.format = 'jpeg';
    } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      metadata.format = 'png';
    } else if (buffer.includes(Buffer.from('WEBP'))) {
      metadata.format = 'webp';
    }

    return metadata;
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return { size: buffer.length, format: 'unknown' };
  }
};

/**
 * Sanitize filename for storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  if (!filename) return 'image.jpg';
  
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 255);
};

module.exports = {
  validateImage,
  convertToBase64,
  extractBase64,
  validateBase64Image,
  getImageMetadata,
  sanitizeFilename,
  ALLOWED_FORMATS,
  MAX_FILE_SIZE,
  MIN_DIMENSIONS,
  MAX_DIMENSIONS
};