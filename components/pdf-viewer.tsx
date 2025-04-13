"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
}

export function PDFViewer({ isOpen, onOpenChange, url, fileName }: PDFViewerProps) {
  const [rawUrl, setRawUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && url) {
      fetchPdfUrl();
    } else {
      // Reset state when dialog closes
      setRawUrl("");
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, url]);

  const fetchPdfUrl = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Transform GitHub URL to raw URL with proper encoding
      let rawUrl = '';
      
      if (url.includes('github.com')) {
        // For GitHub URLs - parse the URL carefully to handle special characters
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        
        // GitHub repository URLs are in the format:
        // github.com/username/repo/blob/branch/path/to/file.pdf
        // We need to convert to:
        // raw.githubusercontent.com/username/repo/branch/path/to/file.pdf
        
        if (pathParts.length >= 5 && pathParts[3] === 'blob') {
          // Extract the important parts
          const username = pathParts[1];
          const repo = pathParts[2];
          const branch = pathParts[4];
          const filePath = pathParts.slice(5).join('/');
          
          // Construct the raw URL
          rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filePath}`;
        } else {
          // Fallback to simple string replacement if URL structure is unexpected
          rawUrl = url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
        }
      } else if (url.includes('githubusercontent.com')) {
        // If the URL is already a raw URL
        rawUrl = url;
      } else {
        // For other URLs, use as is
        rawUrl = url;
      }
      
      // ALWAYS use our server-side proxy - this bypasses CORS issues completely
      // Ensure proper URL encoding of the rawUrl parameter
      const serverProxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      
      // Set the URL directly to the proxy URL
      setRawUrl(serverProxyUrl);
      
      // Just a simple test to see if the proxy is working
      try {
        const testResponse = await fetch(serverProxyUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          console.warn('Server proxy gave status:', testResponse.status);
          // Continue anyway - we'll handle errors in the iframe
        }
      } catch (err) {
        console.warn('Server proxy test failed, but we will try using it anyway');
        // Continue with the proxy URL even if the test fails
      }
    } catch (err) {
      console.error("Error setting up PDF URL:", err);
      setError(`Failed to prepare PDF for viewing: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
    
    // Set loading to false after a short delay to allow the iframe to load
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] w-[90vw] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="mr-8 truncate">{fileName}</DialogTitle>
          {rawUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={rawUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </DialogHeader>
        
        <div className="mt-4 h-[70vh] w-full">
          {isLoading ? (
            <div className="h-full flex justify-center items-center">
              <Loading message="Loading PDF..." compact size="sm" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
              <div className="flex flex-col space-y-2 mt-4">
                <Button variant="outline" asChild>
                  <a href={rawUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                </Button>
                <Button variant="outline" onClick={() => window.open(url, '_blank')}>
                  Open Original Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {/* First try embed with object tag which works better for PDFs */}
              <object
                data={rawUrl}
                type="application/pdf"
                className="w-full h-full"
                onError={(e) => {
                  console.log("Object embed failed, falling back to iframe");
                  // The error will be handled by hiding this object and showing the iframe
                  const target = e.currentTarget as HTMLObjectElement;
                  if (target) {
                    target.style.display = 'none';
                    // Show iframe as fallback (handled by CSS)
                  }
                }}
              >
                {/* iframe as fallback if object fails */}
                <iframe 
                  src={rawUrl}
                  className="w-full h-full border-0 rounded-md"
                  title={fileName}
                  onError={(e) => {
                    console.log("Primary embed methods failed, trying Google Docs viewer");
                    const target = e.target as HTMLIFrameElement;
                    if (target) {
                      // Use Google Docs viewer as last resort
                      target.src = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
                    }
                  }}
                />
                
                {/* Fallback message if nothing works */}
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="mb-4">Unable to display PDF directly</p>
                  <div className="flex space-x-4">
                    <Button asChild>
                      <a href={rawUrl} download={fileName}>Download PDF</a>
                    </Button>
                    <Button variant="outline" onClick={() => 
                      window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}`, '_blank')
                    }>
                      Open in Google Docs
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 