import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(request: NextRequest) {
  console.log('Proxy route received request:', request.method, request.url);
  
  // Get the URL to proxy from the query parameter
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    console.error('No URL parameter provided');
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Server proxy fetching:', url);
    
    // Fetch the requested resource
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 GitHub File Manager Proxy',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
    });

    console.log('GitHub response status:', response.status);
    
    if (!response.ok) {
      console.error(`Proxy fetch failed: ${response.status} ${response.statusText} for URL: ${url}`);
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type and other relevant headers from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    console.log('Content type:', contentType);
    
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
    
    // Handle different content types appropriately
    if (contentType.includes('text/') || 
        contentType.includes('application/json') || 
        contentType.includes('application/javascript') ||
        url.toLowerCase().endsWith('.md') ||
        url.toLowerCase().endsWith('.markdown')) {
      // For text-based content, use text()
      const text = await response.text();
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      console.log('Returning text response');
      return new NextResponse(text, {
        status: 200,
        headers,
      });
    } else if (contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf')) {
      // For PDF files, add additional headers
      headers.set('Content-Type', 'application/pdf');
      headers.set('Accept-Ranges', 'bytes');
      const arrayBuffer = await response.arrayBuffer();
      console.log('Returning PDF response');
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers,
      });
    } else {
      // For all other content types, use arrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      console.log('Returning binary response');
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers,
      });
    }
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
  console.log('Handling OPTIONS request');
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