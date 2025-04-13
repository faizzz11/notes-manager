'use server';

import { uploadFileToGithub } from "@/lib/github-service";

// Server actions now use the bodySizeLimit from next.config.js
// Do not use the config export here as it's not needed and causes conflicts

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || '';
    
    if (!file) {
      return {
        success: false,
        message: 'No file selected',
      };
    }

    // Check both MIME type and file extension for more reliable detection
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    
    // Log file information for debugging
    console.log('File upload attempt:', {
      name: file.name,
      type: fileType,
      extension,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });
    
    // Helper function to check if a string contains another string
    const contains = (str: string, search: string) => str.indexOf(search) !== -1;

    // Check for supported file types
    const isReadme = fileName === 'readme.md';
    const isPdf = fileType === 'application/pdf' || extension === 'pdf';
    const isMarkdown = fileType === 'text/markdown' || 
                      fileType === 'text/x-markdown' || 
                      contains(fileType, 'markdown') ||
                      fileType === 'text/plain' ||  // Some browsers might send md files as plain text
                      extension === 'md' || 
                      extension === 'markdown';
    const isImage = fileType.startsWith('image/') || 
                   ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
    const isVideo = fileType.startsWith('video/') || 
                   ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension);
    
    // Log validation results
    console.log('File validation:', {
      isReadme,
      isPdf,
      isMarkdown,
      isImage,
      isVideo
    });
    
    if (!isReadme && !isPdf && !isMarkdown && !isImage && !isVideo) {
      return {
        success: false,
        message: 'Only PDF, Markdown, image, and video files are supported',
      };
    }

    // Check for file size
    const MAX_SIZE_MB = 500; // 500MB maximum file size
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > MAX_SIZE_MB) {
      return {
        success: false,
        message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum limit (${MAX_SIZE_MB}MB)`,
      };
    }

    try {
      // Convert file to binary content
      const fileContent = await file.arrayBuffer();
      const content = Buffer.from(fileContent).toString('base64');
      
      // Use the path for the upload if provided
      const fileName2 = path ? `${path}/${file.name}` : file.name;
      
      // Upload to GitHub
      const result = await uploadFileToGithub({
        fileName: fileName2,
        content,
        fileType,
      });

      return result;
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for size-related errors
      if (errorMessage.includes('size') || errorMessage.includes('limit') || 
          errorMessage.includes('too large') || errorMessage.includes('exceeded')) {
        return {
          success: false,
          message: 'The file is too large for GitHub to process. GitHub has a 100MB file size limit.',
        };
      }
      
      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error in uploadFile action:', error);
    return {
      success: false,
      message: 'Error processing file upload',
    };
  }
} 