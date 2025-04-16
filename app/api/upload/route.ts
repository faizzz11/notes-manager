"use client";

import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// This is the correct format for App Router API routes
export const dynamic = 'force-dynamic';

// Set proper size limits for uploads
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 60; // In seconds

// Clean file name by removing extra slashes and normalizing the path
const cleanFileName = (fileName: string) => {
  // Remove all leading/trailing slashes and normalize path separators
  return fileName
    .split(/[\/\\]+/)
    .filter(Boolean)
    .join('/');
};

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

    // Clean the file name first
    const filePath = cleanFileName(file.name);

    // Log file info for debugging with cleaned path
    console.log('Upload file info:', {
      originalName: file.name,
      cleanedPath: filePath,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    // Verify the path is clean
    if (filePath.startsWith('/')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file path: Path cannot start with a slash',
          path: filePath
        },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.arrayBuffer();
    const content = Buffer.from(fileContent).toString('base64');

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get the current user
    const {
      data: { login: username },
    } = await octokit.rest.users.getAuthenticated();

    // First try to get the file (to get the sha if it exists)
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: username,
        repo: 'files',
        path: filePath,
      });

      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
      console.log('File does not exist yet, creating new file');
    }

    // Create or update file
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: 'files',
      path: filePath,
      message: `Upload ${filePath}`,
      content: content,
      ...(sha ? { sha } : {}),
    });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
} 