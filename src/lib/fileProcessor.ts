// File processor to extract text from various file types
import { createWorker } from 'tesseract.js';

export interface ExtractedContent {
  text: string;
  fileName: string;
  fileType: string;
  extractedAt: Date;
  imageData?: string; // Base64 encoded image for AI vision
}

/**
 * Extract text from uploaded file
 */
export async function extractTextFromFile(
  file: File
): Promise<ExtractedContent> {
  const fileType = file.type;
  const fileName = file.name;

  // For PDFs
  if (fileType === 'application/pdf') {
    return extractFromPDF(file, fileName);
  }

  // For images (JPG, PNG, etc.) - using OCR would require additional setup
  if (fileType.startsWith('image/')) {
    return extractFromImage(file, fileName);
  }

  // For PowerPoint
  if (
    fileType ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return extractFromPowerPoint(file, fileName);
  }

  // For text files
  if (fileType.startsWith('text/') || fileType === 'application/json') {
    return extractFromText(file, fileName);
  }

  // For Word documents
  if (
    fileType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromWord(file, fileName);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function extractFromPDF(
  file: File,
  fileName: string
): Promise<ExtractedContent> {
  // This requires pdf-parse which needs to run on the backend
  // For now, we'll send it to our API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'pdf');

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to extract PDF text');
  }

  const { text } = await response.json();

  return {
    text,
    fileName,
    fileType: 'pdf',
    extractedAt: new Date(),
  };
}

async function extractFromImage(
  file: File,
  fileName: string
): Promise<ExtractedContent> {
  // Read image as base64 for vision models
  const imageData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // If image is too large (e.g. > 4MB), we might want to warn or compress
      // For now, just pass it through but we'll monitor for errors
      resolve(result);
    };
    reader.readAsDataURL(file);
  });

  // Extract text via Tesseract.js (Client-side OCR)
  let extractedText = `Image: ${fileName}`;
  try {
    // Pre-process image for better OCR results
    const processedBlob = await preProcessImage(file);
    
    const worker = await createWorker('eng');
    // Set parameters to improve recognition for diagrams
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()[]/- ',
    });
    
    const ret = await worker.recognize(processedBlob || file);
    extractedText = ret.data.text;
    await worker.terminate();
  } catch (err) {
    console.warn('Tesseract OCR failed, falling back to basic text', err);
    // Fallback to server-side if client-side fails
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const { text } = await response.json();
        if (text) extractedText = text;
      }
    } catch (apiErr) {
      console.warn('Server OCR fallback failed', apiErr);
    }
  }

  return {
    text: extractedText || "No text could be extracted from this image.",
    fileName,
    fileType: 'image',
    extractedAt: new Date(),
    imageData: imageData,
  };
}

async function extractFromPowerPoint(
  file: File,
  fileName: string
): Promise<ExtractedContent> {
  // PowerPoint extraction requires backend processing
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'ppt');

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to extract PowerPoint text');
  }

  const { text } = await response.json();

  return {
    text,
    fileName,
    fileType: 'ppt',
    extractedAt: new Date(),
  };
}

async function extractFromWord(
  file: File,
  fileName: string
): Promise<ExtractedContent> {
  // Word document extraction
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'docx');

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to extract Word document text');
  }

  const { text } = await response.json();

  return {
    text,
    fileName,
    fileType: 'docx',
    extractedAt: new Date(),
  };
}

async function extractFromText(
  file: File,
  fileName: string
): Promise<ExtractedContent> {
  const text = await file.text();

  return {
    text,
    fileName,
    fileType: 'text',
    extractedAt: new Date(),
  };
}

/**
 * Pre-process image to improve OCR accuracy
 */
async function preProcessImage(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Set canvas dimensions
        // Ensure minimum width and height of 100px for Tesseract to work properly
        const minDim = 100;
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth < minDim) {
          targetHeight = (minDim / targetWidth) * targetHeight;
          targetWidth = minDim;
        }
        if (targetHeight < minDim) {
          targetWidth = (minDim / targetHeight) * targetWidth;
          targetHeight = minDim;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw image to canvas with potential upscaling
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply grayscale and high contrast
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Grayscale using luminance formula
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // High contrast: push to black or white
          gray = gray < 128 ? 0 : 255;
          
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
