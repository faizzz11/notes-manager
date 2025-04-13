import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
  // Get the URL to proxy from the query parameter
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Server proxy fetching:', url);
    
    // Fetch the requested resource
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 GitHub File Manager Proxy',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Proxy fetch failed: ${response.status} ${response.statusText} for URL: ${url}`);
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type and other relevant headers from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');
    const contentLength = response.headers.get('content-length');
    
    // Create headers object with all necessary headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Proxy-Source': 'GitHub-File-Manager'
    });
    
    // Add additional headers if they exist
    if (contentDisposition) headers.set('Content-Disposition', contentDisposition);
    if (contentLength) headers.set('Content-Length', contentLength);
    
    // For PDF files, add additional headers to help browsers render them properly
    if (contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf')) {
      headers.set('Content-Type', 'application/pdf');
      headers.set('Accept-Ranges', 'bytes');
    }
    
    // Get the file content as array buffer for binary data
    const arrayBuffer = await response.arrayBuffer();
    
    // Return the proxied response with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    return NextResponse.json(
      { error: 'Failed to proxy request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 