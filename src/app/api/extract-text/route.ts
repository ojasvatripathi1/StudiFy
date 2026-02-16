import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * API Route to extract text from uploaded files
 * Supports: PDF, Images, PowerPoint, Word, Text
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    let extractedText = '';

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp');
    try {
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }
    } catch {
      // Directory might already exist
    }

    const tempFilePath = join(tempDir, `${Date.now()}_${fileName}`);

    try {
      // Save file temporarily
      await writeFile(tempFilePath, buffer);

      if (fileType === 'pdf') {
        extractedText = await extractPDFText(tempFilePath);
      } else if (fileType === 'image') {
        extractedText = await extractImageText(fileName);
      } else if (fileType === 'ppt') {
        extractedText = await extractPowerPointText(tempFilePath);
      } else if (fileType === 'docx') {
        extractedText = await extractWordText(tempFilePath);
      } else if (fileType === 'text') {
        extractedText = buffer.toString('utf-8');
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileType}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        text: extractedText || `File uploaded: ${fileName}. Text extraction not available for this file type.`,
        fileName,
        fileType,
        success: true,
      });
    } catch (extractError: unknown) {
      const errorMessage = extractError instanceof Error ? extractError.message : String(extractError);
      console.error('Extraction error:', errorMessage);
      // Return file info even if extraction fails
      return NextResponse.json({
        text: `Uploaded: ${fileName}\n\nNote: Automatic text extraction not available. Ensure Python packages are installed:\npip install pdfplumber python-pptx pillow python-docx`,
        fileName,
        fileType,
        success: true,
        warning: errorMessage,
      });
    } finally {
      // Clean up temporary file
      try {
        await unlink(tempFilePath);
      } catch {
        // File might not exist, ignore error
      }
    }
  } catch (error) {
    console.error('Error in extract-text API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process file upload',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract text from PDF
 */
async function extractPDFText(filePath: string): Promise<string> {
  const scriptPath = join(process.cwd(), 'temp', `extract_pdf_${Date.now()}.py`);
  
  try {
    const pythonCode = `
import pdfplumber
import sys
import io

# Use UTF-8 for output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    with pdfplumber.open(r"${filePath}") as pdf:
        text = ""
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\\n"
        print(text, end='')
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
    await writeFile(scriptPath, pythonCode);

    let pythonCmd = 'python';
    try {
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    } catch {
      pythonCmd = 'python3';
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    }
  } catch (error) {
    console.warn('PDF extraction failed:', error);
    throw error;
  } finally {
    try { await unlink(scriptPath); } catch {}
  }
}

/**
 * Extract text from Images
 */
async function extractImageText(fileName: string): Promise<string> {
  return `Image uploaded: ${fileName}. Text extraction is handled by the client-side Tesseract.js engine.`;
}

/**
 * Extract text from PowerPoint
 */
async function extractPowerPointText(filePath: string): Promise<string> {
  const scriptPath = join(process.cwd(), 'temp', `extract_ppt_${Date.now()}.py`);

  try {
    const pythonCode = `
from pptx import Presentation
import sys
import io

# Use UTF-8 for output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    prs = Presentation(r"${filePath}")
    text = ""
    for slide_num, slide in enumerate(prs.slides, 1):
        text += f"--- Slide {slide_num} ---\\n"
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text + "\\n"
    print(text, end='')
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
    await writeFile(scriptPath, pythonCode);

    let pythonCmd = 'python';
    try {
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    } catch {
      pythonCmd = 'python3';
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    }
  } catch (error) {
    console.warn('PowerPoint extraction failed:', error);
    throw error;
  } finally {
    try { await unlink(scriptPath); } catch {}
  }
}

/**
 * Extract text from Word documents
 */
async function extractWordText(filePath: string): Promise<string> {
  const scriptPath = join(process.cwd(), 'temp', `extract_docx_${Date.now()}.py`);

  try {
    const pythonCode = `
from docx import Document
import sys
import io

# Use UTF-8 for output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    doc = Document(r"${filePath}")
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\\n"
    print(text, end='')
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
    await writeFile(scriptPath, pythonCode);

    let pythonCmd = 'python';
    try {
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    } catch {
      pythonCmd = 'python3';
      const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });
      if (stderr && stderr.includes('Error')) throw new Error(stderr);
      return stdout.trim();
    }
  } catch (error) {
    console.warn('Word extraction failed:', error);
    throw error;
  } finally {
    try { await unlink(scriptPath); } catch {}
  }
}
