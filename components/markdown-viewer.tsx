"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

interface MarkdownViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
  initialContent?: string;
}

export function MarkdownViewer({ 
  isOpen, 
  onOpenChange, 
  url, 
  fileName,
  initialContent 
}: MarkdownViewerProps) {
  const [content, setContent] = useState<string>(initialContent || "");
  const [isLoading, setIsLoading] = useState<boolean>(!initialContent);
  const [error, setError] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string>("");
  const [isInitialContent, setIsInitialContent] = useState<boolean>(!!initialContent);

  useEffect(() => {
    if (isOpen) {
      if (initialContent) {
        setContent(initialContent);
        setIsInitialContent(true);
      }
      if (url) {
        fetchMarkdownContent();
      }
    } else {
      // Reset state when dialog is closed
      setContent("");
      setIsLoading(true);
      setError(null);
      setRawUrl("");
      setIsInitialContent(false);
    }
  }, [isOpen, url, initialContent]);

  const fetchMarkdownContent = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert GitHub URL to raw URL
      let rawUrl = url;
      if (url.includes('github.com')) {
        rawUrl = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }
      
      setRawUrl(rawUrl);
      
      // Try fetching from jsDelivr first (better performance in India)
      const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${rawUrl.replace('https://raw.githubusercontent.com/', '')}`;
      
      try {
        const response = await fetch(jsDelivrUrl);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
          setIsInitialContent(false);
          return;
        }
      } catch (jsDelivrError) {
        console.log('jsDelivr fetch failed, trying alternative...');
      }
      
      // If jsDelivr fails, try GitHub raw content directly
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`);
      }
      
      const text = await response.text();
      setContent(text);
      setIsInitialContent(false);
    } catch (error) {
      console.error('Error fetching markdown:', error);
      setError(`Failed to load markdown content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom image component for ReactMarkdown
  const ImageComponent = ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null;
    
    return (
      <span className="block my-4">
        <div className="relative w-full max-w-2xl h-[300px] mx-auto">
          <Image
            src={src}
            alt={alt || "Content image"}
            fill
            className="object-contain"
            unoptimized // For external images
          />
        </div>
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            <span className="truncate">{fileName}</span>
            {isInitialContent && (
              <span className="ml-2 text-xs text-muted-foreground">(Preview)</span>
            )}
          </DialogTitle>
          {rawUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={rawUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </DialogHeader>
        
        <div className="mt-4 h-[calc(90vh-8rem)] overflow-y-auto px-4 bg-card rounded-md border">
          {isLoading && !isInitialContent ? (
            <div className="h-full flex justify-center items-center">
              <Loading message="Loading content..." compact size="sm" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="py-4 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  img: ImageComponent
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 