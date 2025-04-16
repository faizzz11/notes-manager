"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MarkdownViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
}

export function MarkdownViewer({ isOpen, onOpenChange, url, fileName }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && url) {
      fetchMarkdownContent();
    } else {
      // Reset state when dialog is closed
      setContent("");
      setIsLoading(true);
      setError(null);
      setRawUrl("");
    }
  }, [isOpen, url]);

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
    } catch (error) {
      console.error('Error fetching markdown:', error);
      setError(`Failed to load markdown content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle direct image links starting with @
      if (line.startsWith('@http')) {
        const imageUrl = line.slice(1);
        return (
          <div key={index} className="my-4 flex flex-col items-center">
            <div className="relative w-full max-w-2xl aspect-square">
              <Image
                src={imageUrl}
                alt="Content image"
                fill
                className="object-contain"
                unoptimized // For external images
              />
            </div>
          </div>
        );
      }

      // Handle markdown image syntax
      if (line.match(/!\[(.*?)\]\((.*?)\)/)) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, alt, imageUrl] = match;
          return (
            <div key={index} className="my-4 flex flex-col items-center">
              <div className="relative w-full max-w-2xl aspect-square">
                <Image
                  src={imageUrl}
                  alt={alt || "Content image"}
                  fill
                  className="object-contain"
                  unoptimized // For external images
                />
              </div>
              {alt && <p className="text-sm text-muted-foreground mt-2">{alt}</p>}
            </div>
          );
        }
      }

      // Handle headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold my-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold my-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold my-2">{line.slice(4)}</h3>;
      }

      // Handle lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-6 list-disc my-1">{line.slice(2)}</li>;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return <li key={index} className="ml-6 list-decimal my-1">{line.slice(line.indexOf(' ') + 1)}</li>;
      }

      // Handle bold text
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');

      // Handle italic text
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      content = content.replace(/_(.*?)_/g, '<em>$1</em>');

      // Handle code blocks
      if (line.startsWith('```')) {
        return <pre key={index} className="bg-muted p-4 rounded my-4 font-mono">{line.slice(3)}</pre>;
      }

      // Handle inline code
      content = content.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>');

      // Handle links
      content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');

      // Empty lines
      if (!line.trim()) {
        return <br key={index} />;
      }

      // Regular paragraphs
      return line ? (
        <p 
          key={index} 
          className="my-2"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null;
    });
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
              <Loading message="Loading content..." compact size="sm" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="py-4">
              {renderFormattedContent(content)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 