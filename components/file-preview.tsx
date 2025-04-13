"use client";

import { useState } from "react";
import { FileIcon, ImageIcon, VideoIcon, FileTextIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@/components/pdf-viewer";
import { VideoViewer } from "@/components/video-viewer";
import { MarkdownViewer } from "@/components/markdown-viewer";
import Image from "next/image";

interface FilePreviewProps {
  url: string;
  fileName: string;
  fileType: string;
}

export function FilePreview({ url, fileName, fileType }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewerType, setViewerType] = useState<"image" | "pdf" | "markdown" | "video" | null>(null);

  const isPdf = fileType.includes("pdf") || fileName.endsWith(".pdf");
  const isImage = fileType.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  const isVideo = fileType.includes("video") || /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName);
  const isMarkdown = fileType.includes("markdown") || 
                     fileType === "text/plain" || 
                     fileName.endsWith(".md") || 
                     fileName.endsWith(".markdown");

  const handlePreviewClick = () => {
    if (isImage) {
      setViewerType("image");
    } else if (isPdf) {
      setViewerType("pdf");
    } else if (isMarkdown) {
      setViewerType("markdown");
    } else if (isVideo) {
      setViewerType("video");
    } else {
      return; // No preview available
    }
    setIsOpen(true);
  };

  const FileTypeIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5" />;
    if (isVideo) return <VideoIcon className="h-5 w-5" />;
    if (isMarkdown) return <FileTextIcon className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border p-2 hover:bg-accent transition-colors cursor-pointer",
          (isImage || isPdf || isMarkdown || isVideo) && "hover:bg-accent/80"
        )}
        onClick={handlePreviewClick}
      >
        <FileTypeIcon />
        <span className="truncate">{fileName}</span>
      </div>

      {/* Image preview */}
      {viewerType === "image" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] w-[90vw] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                <span className="truncate">{fileName}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 h-[calc(90vh-8rem)] flex items-center justify-center bg-card rounded-md border">
              <Image
                src={url}
                alt={fileName}
                className="object-contain"
                fill
                sizes="80vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PDF viewer */}
      {viewerType === "pdf" && (
        <PDFViewer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          url={url}
          fileName={fileName}
        />
      )}

      {/* Markdown viewer */}
      {viewerType === "markdown" && (
        <MarkdownViewer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          url={url}
          fileName={fileName}
        />
      )}

      {/* Video viewer */}
      {viewerType === "video" && (
        <VideoViewer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          url={url}
          fileName={fileName}
        />
      )}
    </>
  );
} 