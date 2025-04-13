"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
}

export function VideoViewer({ isOpen, onOpenChange, url, fileName }: VideoViewerProps) {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && url) {
      fetchVideoUrl();
    } else {
      // Reset state when dialog is closed
      setVideoUrl("");
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, url]);

  const fetchVideoUrl = async () => {
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
        // github.com/username/repo/blob/branch/path/to/file.mp4
        // We need to convert to:
        // raw.githubusercontent.com/username/repo/branch/path/to/file.mp4
        
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
      
      // For videos, we'll use the server proxy to avoid CORS issues
      // Ensure proper URL encoding of the rawUrl parameter
      const serverProxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      
      // Set URL directly without checking first - we'll handle errors in the video player
      setVideoUrl(serverProxyUrl);
    } catch (err) {
      console.error("Error preparing video URL:", err);
      setError(`Failed to load video: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Set loading to false after a short delay to allow the video to start loading
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] w-[90vw] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            <span className="truncate">{fileName}</span>
          </DialogTitle>
          {videoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={videoUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </DialogHeader>
        
        <div className="mt-4 h-[calc(90vh-8rem)] flex items-center justify-center bg-card rounded-md border">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loading message="Loading video..." compact size="sm" />
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <video 
              src={videoUrl}
              className="max-h-full max-w-full"
              controls
              autoPlay={false}
              controlsList="nodownload"
              onError={() => setError("Failed to load video. The format may be unsupported.")}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 