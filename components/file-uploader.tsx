"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/app/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadIcon, FileIcon, FileTextIcon, Loader2 } from "lucide-react";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "text/markdown"
    ) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or Markdown files",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadFile(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
        setUploadedFileUrl(result.url || null);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload file",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      router.refresh();
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadedFileUrl(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload to GitHub</CardTitle>
        <CardDescription>
          Upload PDF or Markdown files to your GitHub repository
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <UploadIcon className="h-8 w-8 text-muted-foreground" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium">
                    {file ? file.name : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only PDF and Markdown files are supported
                  </p>
                </div>
              </div>
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.md,application/pdf,text/markdown"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 border rounded">
                {file.type === "application/pdf" ? (
                  <FileIcon className="h-5 w-5 text-rose-500" />
                ) : (
                  <FileTextIcon className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-sm truncate">{file.name}</span>
              </div>
            )}

            {uploadedFileUrl && (
              <div className="p-3 bg-muted rounded">
                <p className="text-sm font-medium">File uploaded successfully!</p>
                <a 
                  href={uploadedFileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate block"
                >
                  {uploadedFileUrl}
                </a>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetForm}
            disabled={isUploading || !file}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload to GitHub"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 