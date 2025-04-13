"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadmeViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
}

export function ReadmeViewer({ isOpen, onOpenChange, url, fileName }: ReadmeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && url) {
      fetchReadmeContent();
    } else {
      // Reset state when dialog is closed
      setContent("");
      setIsLoading(true);
      setError(null);
      setRawUrl("");
    }
  }, [isOpen, url]);

  const fetchReadmeContent = async () => {
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
        // github.com/username/repo/blob/branch/path/to/README.md
        // We need to convert to:
        // raw.githubusercontent.com/username/repo/branch/path/to/README.md
        
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
      
      // Set raw URL for download button
      setRawUrl(rawUrl);
      
      // ALWAYS use our server-side proxy for content fetching
      // Ensure proper URL encoding of the rawUrl parameter
      const serverProxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      
      // Try to fetch content using server proxy
      try {
        const response = await fetch(serverProxyUrl);
        
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          throw new Error(`Server proxy failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Server proxy error:', error);
        const proxyError = error instanceof Error ? error : new Error('Unknown proxy error');
        
        // Fallback to direct fetch as a last resort (likely to fail due to CORS)
        try {
          const response = await fetch(rawUrl, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Direct fetch failed: ${response.status}`);
          }
          
          const text = await response.text();
          setContent(text);
        } catch (directError) {
          console.error('All fetch methods failed');
          throw new Error(`Failed to fetch README: ${proxyError.message}`);
        }
      }
    } catch (err) {
      console.error("Error fetching README:", err);
      setError(`Failed to load README content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced markdown rendering function
  const renderMarkdown = (markdown: string) => {
    // Convert headers
    let html = markdown.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-5">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-4">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-3">$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4 class="text-lg font-bold my-2">$1</h4>');
    html = html.replace(/^##### (.*$)/gm, '<h5 class="text-base font-bold my-2">$1</h5>');
    
    // Convert paragraphs
    html = html.replace(/^(?!<h[1-6]|<ul|<ol|<pre|<blockquote|<table|$)(.*$)/gm, '<p class="my-3 leading-relaxed">$1</p>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>');
    html = html.replace(/\_(.*?)\_/g, '<em>$1</em>');
    
    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>');
    
    // Convert code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, 
      '<pre class="bg-muted p-4 rounded my-4 overflow-x-auto"><code class="language-$1">$2</code></pre>'
    );
    
    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>');
    
    // Convert unordered lists
    html = html.replace(/^\* (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>');
    
    // Convert ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal my-1">$1</li>');
    
    // Group list items
    const groupLists = (html: string, marker: string, tag: string) => {
      let inList = false;
      const lines = html.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`<li class="ml-6 ${marker}`)) {
          if (!inList) {
            lines[i] = `<${tag} class="my-4">${lines[i]}`;
            inList = true;
          }
        } else if (inList) {
          lines[i-1] = `${lines[i-1]}</${tag}>`;
          inList = false;
        }
      }
      if (inList) {
        lines[lines.length-1] = `${lines[lines.length-1]}</${tag}>`;
      }
      return lines.join('\n');
    };
    
    html = groupLists(html, 'list-disc', 'ul');
    html = groupLists(html, 'list-decimal', 'ol');
    
    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300" />');
    
    // Convert blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote class="pl-4 border-l-4 border-gray-300 italic my-2">$1</blockquote>');
    
    return html;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            <span className="truncate">{fileName}</span>
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
          {isLoading ? (
            <div className="h-full flex justify-center items-center">
              <Loading message="Loading README..." compact size="sm" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div 
              className="prose max-w-none dark:prose-invert py-4"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 