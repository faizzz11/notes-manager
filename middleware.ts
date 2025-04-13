import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs before any API route
export function middleware(request: NextRequest) {
  // Set response headers to support large file uploads (CORS headers)
  const response = NextResponse.next();
  
  // Add headers to increase upload limits and timeouts
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Return the modified response
  return response;
}

// Configure the middleware to only run on API routes
export const config = {
  matcher: ['/api/:path*'],
}; 