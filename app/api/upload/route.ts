import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToGithub } from '@/lib/github-service';

// This is the correct format for App Router API routes
export const dynamic = 'force-dynamic';

// Set proper size limits for uploads
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 60; // In seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file info for debugging
    console.log('Upload file info:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    // Check file type - remove this restriction to allow any file type
    // Only check if it's supported by our viewers but don't restrict upload
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    
    // Read file content
    const fileContent = await file.arrayBuffer();
    const content = Buffer.from(fileContent).toString('base64');

    // Upload to GitHub
    const result = await uploadFileToGithub({
      fileName: file.name,
      content,
      fileType,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for size-related errors
    if (errorMessage.includes('size') || errorMessage.includes('limit')) {
      return NextResponse.json(
        { success: false, message: 'The file is too large to process. Please try a smaller file or contact support.' },
        { status: 413 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing the upload' },
      { status: 500 }
    );
  }
} 