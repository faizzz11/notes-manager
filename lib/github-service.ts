interface UploadFileParams {
  fileName: string;
  content: string;
  fileType: string;
}

export async function uploadFileToGithub({
  fileName,
  content,
  fileType,
}: UploadFileParams): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    
    if (!token || !repo) {
      return {
        success: false,
        message: "GitHub configuration is missing",
      };
    }

    // Check content size - GitHub has a 100MB limit for individual files via API
    // Note: Base64 encoding increases size by ~33%, so the actual file size limit is ~75MB
    const contentSizeBytes = Buffer.from(content, 'base64').length;
    const contentSizeMB = contentSizeBytes / (1024 * 1024);
    
    // Log size information for debugging
    console.log('File upload details:', {
      fileName,
      sizeMB: contentSizeMB.toFixed(2),
      fileType
    });
    
    // GitHub has a 100MB file size limit
    if (contentSizeMB > 100) {
      return {
        success: false,
        message: `File size (${contentSizeMB.toFixed(2)}MB) exceeds GitHub's limit of 100MB.`,
      };
    }
    
    // Format the path for the GitHub API
    // Don't modify the path if it already includes directories
    const path = fileName;
    
    // Use a larger timeout for bigger files
    const timeoutMs = Math.max(60000, contentSizeMB * 1000); // At least 60 seconds
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload ${fileName}`,
          content,
          branch: 'main',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Get response data with error handling
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Error parsing GitHub response:', e);
        data = { message: 'Unable to parse GitHub response' };
      }

      if (!response.ok) {
        console.error('Error uploading to GitHub:', data);
        
        // Provide more specific error messages based on response status
        if (response.status === 413 || response.status === 422) {
          return {
            success: false,
            message: 'File is too large for GitHub. Maximum file size is 100MB.',
          };
        }
        
        return {
          success: false,
          message: data.message || 'Failed to upload file to GitHub',
        };
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        url: data.content?.html_url || '',
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle aborted requests or timeouts
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          message: 'The upload request timed out. This may be due to the file size.',
        };
      }
      
      throw fetchError; // Re-throw other fetch errors
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // More detailed error messages
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error while uploading file. Check your connection and try again.',
        };
      }
      
      if (error.message.includes('size') || error.message.includes('large')) {
        return {
          success: false,
          message: 'The file is too large to upload. GitHub has a 100MB file size limit.',
        };
      }
    }
    
    return {
      success: false,
      message: 'An error occurred while uploading the file',
    };
  }
} 