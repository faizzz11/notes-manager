"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/app/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaViewer } from "@/components/media-viewer";
import { PDFViewer } from "@/components/pdf-viewer";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { VideoViewer } from "@/components/video-viewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UploadIcon,
  FolderIcon,
  FileIcon,
  FileTextIcon,
  PlusIcon,
  Loader2,
  FolderPlusIcon,
  ImageIcon,
  VideoIcon,
  Trash2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

// Type definitions
interface FileItem {
  name: string;
  path: string;
  type: string;
  html_url: string;
  size: number;
}

interface FolderItem {
  name: string;
  path: string;
  type: string;
}

type ItemType = FileItem | FolderItem;

interface DriveInterfaceProps {
  initialPath: string;
}

export default function DriveInterface({ initialPath = "" }: DriveInterfaceProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [pathHistory, setPathHistory] = useState<string[]>([initialPath]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [createFolderOpen, setCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [readmeOpen, setReadmeOpen] = useState<boolean>(false);
  const [readmeUrl, setReadmeUrl] = useState<string>("");
  const [readmeFileName, setReadmeFileName] = useState<string>("");
  const [createdFolderPath, setCreatedFolderPath] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [uploadPollCount, setUploadPollCount] = useState<number>(0);
  const [mediaOpen, setMediaOpen] = useState<boolean>(false);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaFileName, setMediaFileName] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [pdfOpen, setPdfOpen] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [markdownOpen, setMarkdownOpen] = useState<boolean>(false);
  const [markdownUrl, setMarkdownUrl] = useState<string>("");
  const [markdownFileName, setMarkdownFileName] = useState<string>("");
  const [videoOpen, setVideoOpen] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ItemType | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // Set up initial path from prop
  useEffect(() => {
    if (initialPath) {
      setCurrentPath(initialPath);
      setPathHistory([initialPath]);
    }
  }, [initialPath]);

  // Fetch content from GitHub when the current path changes
  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath]);

  // Poll for newly created folder
  useEffect(() => {
    if (createdFolderPath && pollCount < 10) {
      const checkForFolder = async () => {
        if (pollCount > 6) {
          setIsLoading(true);
        }
        
        try {
          const pathParts = createdFolderPath.split('/');
          const folderName = pathParts.pop() || '';
          const parentPath = pathParts.join('/');
          
          const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
          const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
          const path = parentPath ? `/${parentPath}` : '';
          
          const response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
            headers: {
              Authorization: `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            const folderExists = Array.isArray(data) && data.some(
              item => item.type === 'dir' && item.name === folderName
            );
            
            if (folderExists) {
              setCreatedFolderPath(null);
              setPollCount(0);
              navigateToPath(createdFolderPath);
              return;
            }
          }
          
          setPollCount(prev => prev + 1);
          
          if (pollCount < 9) {
            const delay = Math.min(1000 * Math.pow(1.5, pollCount), 10000);
            setTimeout(checkForFolder, delay);
          } else {
            setCreatedFolderPath(null);
            setPollCount(0);
            fetchItems(currentPath);
            toast({
              title: "Note",
              description: "Folder created. It may take a moment to appear.",
            });
          }
        } catch (error) {
          console.error('Error polling for folder:', error);
          setCreatedFolderPath(null);
          setPollCount(0);
        } finally {
          if (pollCount > 6) {
            setIsLoading(false);
          }
        }
      };
      
      checkForFolder();
    }
  }, [createdFolderPath, pollCount]);

  // Poll for newly uploaded file
  useEffect(() => {
    if (uploadedFilePath && uploadPollCount < 10) {
      const checkForFile = async () => {
        if (uploadPollCount > 6) {
          setIsLoading(true);
        }
        
        try {
          const pathParts = uploadedFilePath.split('/');
          const fileName = pathParts.pop() || '';
          const dirPath = pathParts.join('/');
          
          const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
          const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
          const path = dirPath ? `/${dirPath}` : '';
          
          const response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
            headers: {
              Authorization: `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            const fileExists = Array.isArray(data) && data.some(
              item => item.type === 'file' && item.name === fileName
            );
            
            if (fileExists) {
              setUploadedFilePath(null);
              setUploadPollCount(0);
              fetchItems(currentPath);
              return;
            }
          }
          
          setUploadPollCount(prev => prev + 1);
          
          if (uploadPollCount < 9) {
            const delay = Math.min(1000 * Math.pow(1.5, uploadPollCount), 5000);
            setTimeout(checkForFile, delay);
          } else {
            setUploadedFilePath(null);
            setUploadPollCount(0);
            fetchItems(currentPath);
            toast({
              title: "Note",
              description: "File uploaded. It may take a moment to appear.",
            });
          }
        } catch (error) {
          console.error('Error polling for file:', error);
          setUploadedFilePath(null);
          setUploadPollCount(0);
        } finally {
          if (uploadPollCount > 6) {
            setIsLoading(false);
          }
        }
      };
      
      checkForFile();
    }
  }, [uploadedFilePath, uploadPollCount]);

  const fetchItems = async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
      const response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
        headers: {
          Authorization: `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setItems([]);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch repository contents');
      }
      
      const data = await response.json();
      
      const sortedItems = Array.isArray(data) 
        ? data.sort((a, b) => {
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
          })
        : [];
      
      // Filter out README.md files from the display
      const filteredItems = sortedItems.filter(item => 
        item.type === 'dir' || 
        (item.type === 'file' && !item.name.toLowerCase().includes('readme.md'))
      );
      
      setItems(filteredItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items");
      // Navigate to root on error
      router.push('/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPath = (path: string) => {
    // Only navigate if the path is a directory
    if (path && !path.includes('.')) {
      router.push(`/notes/${path}`);
    } else {
      router.push('/notes');
    }
    
    if (path !== currentPath) {
      const newHistory = [...pathHistory];
      if (!pathHistory.includes(path)) {
        newHistory.push(path);
      } else {
        const index = pathHistory.indexOf(path);
        newHistory.splice(index + 1);
      }
      setPathHistory(newHistory);
    }
    setCurrentPath(path);
  };

  const navigateToParentFolder = () => {
    if (currentPath === '') return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    navigateToPath(parentPath);
  };

  const handleItemClick = (item: ItemType) => {
    if (item.type === 'dir') {
      navigateToPath(item.path);
    } else if (item.type === 'file') {
      const fileItem = item as FileItem;
      const extension = item.name.split('.').pop()?.toLowerCase() || '';
      
      if (['md', 'markdown'].includes(extension) || item.name.toLowerCase() === 'readme.md') {
        setMarkdownUrl(fileItem.html_url);
        setMarkdownFileName(item.name);
        setMarkdownOpen(true);
      } else if (extension === 'pdf') {
        setPdfUrl(fileItem.html_url);
        setPdfFileName(item.name);
        setPdfOpen(true);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
        setMediaUrl(fileItem.html_url);
        setMediaFileName(item.name);
        setMediaType("image");
        setMediaOpen(true);
      } else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
        setVideoUrl(fileItem.html_url);
        setVideoFileName(item.name);
        setVideoOpen(true);
      } else {
        window.open(fileItem.html_url, '_blank');
      }
    }
  };

  const validateFileName = (fileName: string): { isValid: boolean; message?: string } => {
    // Remove any leading or trailing slashes
    const cleanedName = fileName.replace(/^\/+|\/+$/g, '');
    
    // Check if the name contains any invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(cleanedName)) {
      return { 
        isValid: false, 
        message: "File name contains invalid characters. Avoid: < > : \" | ? *" 
      };
    }

    // Check if the name starts with a dot
    if (cleanedName.startsWith('.')) {
      return { 
        isValid: false, 
        message: "File name cannot start with a dot (.)" 
      };
    }

    // Check if the name is too long (255 characters is a common limit)
    if (cleanedName.length > 255) {
      return { 
        isValid: false, 
        message: "File name is too long (max 255 characters)" 
      };
    }

    return { isValid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file name first
      const validation = validateFileName(file.name);
      if (!validation.isValid) {
        toast({
          title: "Invalid file name",
          description: validation.message,
          variant: "destructive",
        });
        return;
      }
      
      const fileName = file.name.toLowerCase();
      const extension = fileName.split('.').pop() || '';
      
      const contains = (str: string, search: string) => str.indexOf(search) !== -1;
      
      const isReadme = fileName === 'readme.md';
      const isPdf = file.type === "application/pdf" || extension === 'pdf';
      const isMarkdown = file.type === "text/markdown" || 
                        file.type === "text/x-markdown" || 
                        contains(file.type, 'markdown') ||
                        file.type === "text/plain" ||
                        extension === 'md' || 
                        extension === 'markdown';
      const isImage = file.type.startsWith("image/") || 
                     ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
      const isVideo = file.type.startsWith("video/") || 
                     ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension);
      
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        extension,
        size: `${fileSizeMB}MB`,
        isMarkdown,
        isPdf,
        isImage,
        isVideo
      });
      
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `The file size (${fileSizeMB}MB) exceeds GitHub's 100MB limit`,
          variant: "destructive",
        });
        return;
      }
      
      if (isPdf || isMarkdown || isImage || isVideo || isReadme) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload only PDF, Markdown, image, or video files",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Clean the path by removing leading/trailing slashes and any double slashes
      const cleanPath = currentPath
        .replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
        .replace(/\/+/g, '/');      // Replace multiple slashes with single
      
      formData.append("path", cleanPath);
      
      const result = await uploadFile(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "File uploaded successfully.",
          variant: "default",
        });
        
        // Use cleaned path for filePath construction
        const filePath = cleanPath 
          ? `${cleanPath}/${selectedFile.name}` 
          : selectedFile.name;
        
        try {
          await fetchItems(currentPath);
        } catch (e) {
          console.log("Initial refresh failed, will poll for file silently");
          setUploadedFilePath(filePath);
          setUploadPollCount(0);
        }
        
        setUploadDialogOpen(false);
        setSelectedFile(null);
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
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const readmeContent = `# ${newFolderName}\n\nThis folder was created with GitHub File Uploader.`;
    
    // Clean the current path first
    const cleanCurrentPath = currentPath
      .replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
      .replace(/\/+/g, '/');      // Replace multiple slashes with single
    
    const folderPath = cleanCurrentPath 
      ? `${cleanCurrentPath}/${newFolderName}` 
      : newFolderName;
    
    setIsCreatingFolder(true);
    try {
      const formData = new FormData();
      const readmeFile = new File(
        [readmeContent], 
        "README.md", 
        { type: "text/markdown" }
      );
      formData.append("file", readmeFile);
      formData.append("path", folderPath);
      
      const result = await uploadFile(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Folder '${newFolderName}' created successfully`,
          variant: "default",
        });
        
        setCreatedFolderPath(folderPath);
        setPollCount(0);
        
        setCreateFolderOpen(false);
        setNewFolderName("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create folder",
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
      setIsCreatingFolder(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024 * 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return (
      <div className="flex items-center text-sm mb-4 overflow-x-auto whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateToPath('')}
          className="hover:bg-secondary p-1"
        >
          Home
        </Button>
        
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <div key={path} className="flex items-center">
              <span className="mx-1 text-muted-foreground">/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToPath(path)}
                className="hover:bg-secondary p-1"
              >
                {part}
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const getFileIcon = (fileName: string, className: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return <ImageIcon className={`${className} text-purple-500`} />;
    }
    
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
      return <VideoIcon className={`${className} text-pink-500`} />;
    }
    
    if (extension === 'pdf') {
      return <FileIcon className={`${className} text-red-500`} />;
    }
    
    if (['md', 'markdown'].includes(extension)) {
      return <FileTextIcon className={`${className} text-green-500`} />;
    }
    
    return <FileIcon className={`${className} text-gray-500`} />;
  };

  const handleDelete = async (item: ItemType) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
      
      if (itemToDelete.type === 'dir') {
        // For folders, we need to delete all contents first
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${itemToDelete.path}`, {
          headers: {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to get folder contents: ${response.status}`);
        }

        const contents = await response.json();
        
        // Delete all files in the folder
        for (const item of contents) {
          const deleteResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${item.path}`, {
            method: 'DELETE',
            headers: {
              Authorization: `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Delete file: ${item.name}`,
              sha: item.sha
            })
          });

          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete file ${item.name}: ${deleteResponse.status}`);
          }
        }
      } else {
        // For files, get the SHA first
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${itemToDelete.path}`, {
          headers: {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get file info: ${response.status}`);
        }

        const data = await response.json();
        
        // Delete the file
        const deleteResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${itemToDelete.path}`, {
          method: 'DELETE',
          headers: {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Delete file: ${itemToDelete.name}`,
            sha: data.sha
          })
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete file: ${deleteResponse.status}`);
        }
      }
      
      toast({
        title: "Success",
        description: `${itemToDelete.type === 'dir' ? 'Folder' : 'File'} deleted successfully`,
        variant: "default",
      });
      
      // Refresh the current directory
      fetchItems(currentPath);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type === 'dir' ? 'folder' : 'file'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card className="w-full border-none shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Notes</h2>
          <div className="flex gap-2">
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlusIcon className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for the new folder. A README.md file will be created automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateFolderOpen(false)}
                    disabled={isCreatingFolder}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateFolder}
                    disabled={isCreatingFolder}
                  >
                    {isCreatingFolder ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Folder"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload file</DialogTitle>
                  <DialogDescription>
                    Choose a PDF, Markdown, image, or video file to upload to {currentPath || 'the root directory'}.
                    {selectedFile && (
                      <span className="block mt-2 text-xs text-muted-foreground">
                        Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    type="file"
                    accept=".pdf,.md,.markdown,application/pdf,text/markdown,text/x-markdown,text/plain,image/*,video/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum file size: 100MB (GitHub limit)
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                    {isUploading ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      "Upload File"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {renderBreadcrumbs()}
        
        {isLoading ? (
          <div className="h-64 flex justify-center items-center">
            <Loading 
              message={
                createdFolderPath 
                  ? "Creating folder..." 
                  : uploadedFilePath 
                    ? "Processing file upload..." 
                    : "Loading files..."
              }
            />
          </div>
        ) : (
          <>
            {currentPath !== "" && (
              <div 
                className="flex items-center p-2 mb-2 rounded-md hover:bg-secondary/30 cursor-pointer"
                onClick={navigateToParentFolder}
              >
                <FolderIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>...</span>
              </div>
            )}
            
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                This folder is empty
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.path}
                    className="group flex items-center p-3 rounded-md hover:bg-secondary/30 cursor-pointer relative"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.type === "dir" ? (
                      <FolderIcon className="h-10 w-10 mr-3 text-blue-500" />
                    ) : getFileIcon(item.name, "h-10 w-10 mr-3")}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      {item.type === "file" && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize((item as FileItem).size)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
      
      <MediaViewer
        isOpen={mediaOpen}
        onOpenChange={setMediaOpen}
        url={mediaUrl}
        fileName={mediaFileName}
        fileType="image"
      />

      <PDFViewer
        isOpen={pdfOpen}
        onOpenChange={setPdfOpen}
        url={pdfUrl}
        fileName={pdfFileName}
      />

      <MarkdownViewer
        isOpen={markdownOpen}
        onOpenChange={setMarkdownOpen}
        url={markdownUrl}
        fileName={markdownFileName}
      />

      <VideoViewer
        isOpen={videoOpen}
        onOpenChange={setVideoOpen}
        url={videoUrl}
        fileName={videoFileName}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {itemToDelete?.type === 'dir' ? 'the folder' : 'the file'} "{itemToDelete?.name}".
              {itemToDelete?.type === 'dir' && ' This action cannot be undone and will delete all contents within the folder.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 