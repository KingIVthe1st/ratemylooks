/**
 * Image Processing Utilities
 * Handles image validation, conversion, and optimization for AI analysis
 */

// Configuration constants
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate image file
 */
export function validateImage(file) {
  const errors = [];

  // Check if file exists
  if (!file) {
    throw new Error('No image file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file format
  const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
  const mimeTypeFormat = file.mimetype?.split('/')[1]?.toLowerCase();

  if (fileExtension && !ALLOWED_FORMATS.includes(fileExtension)) {
    errors.push(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
  }

  if (file.mimetype && !file.mimetype.startsWith('image/')) {
    errors.push('File must be an image');
  }

  if (errors.length > 0) {
    const error = new Error(errors.join('. '));
    error.status = 400;
    throw error;
  }

  return {
    valid: true,
    format: fileExtension || mimeTypeFormat || 'jpeg',
    size: file.size,
    mimeType: file.mimetype
  };
}

/**
 * Convert image buffer to base64 with data URL prefix
 */
export function convertToBase64(buffer, mimeType) {
  if (!buffer) {
    throw new Error('No image buffer provided');
  }

  try {
    // Convert Uint8Array to base64
    const base64String = arrayBufferToBase64(buffer);
    return `data:${mimeType || 'image/jpeg'};base64,${base64String}`;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Convert ArrayBuffer/Uint8Array to base64 string
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

/**
 * Extract base64 data from data URL
 */
export function extractBase64(dataUrl) {
  if (!dataUrl) {
    throw new Error('No data URL provided');
  }

  try {
    if (dataUrl.startsWith('data:')) {
      const base64Index = dataUrl.indexOf('base64,');
      if (base64Index === -1) {
        throw new Error('Invalid data URL format');
      }
      return dataUrl.substring(base64Index + 7);
    }

    return dataUrl;
  } catch (error) {
    console.error('Base64 extraction error:', error);
    throw new Error('Invalid image data format');
  }
}

/**
 * Validate base64 image string
 */
export function validateBase64Image(base64String) {
  try {
    // Check minimum length
    if (base64String.length < 100) {
      return false;
    }

    // Basic base64 validation
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64String)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Parse multipart form data (native implementation)
 * Note: Workers automatically parse FormData, so this is mainly for reference
 */
export async function parseMultipartFormData(request) {
  const formData = await request.formData();
  const fields = {};
  const files = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}

/**
 * Get image metadata from buffer
 */
export function getImageMetadata(buffer) {
  try {
    const metadata = {
      size: buffer.length,
      format: 'unknown'
    };

    // Detect format based on file signature
    const header = buffer.slice(0, 8);

    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      metadata.format = 'jpeg';
    } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      metadata.format = 'png';
    } else {
      // Check for WebP signature
      const webpCheck = new TextDecoder().decode(buffer.slice(0, 12));
      if (webpCheck.includes('WEBP')) {
        metadata.format = 'webp';
      }
    }

    return metadata;
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return { size: buffer.length, format: 'unknown' };
  }
}

export { ALLOWED_FORMATS, MAX_FILE_SIZE };
