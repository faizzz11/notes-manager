"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/app/actions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReadmeViewer } from "@/components/readme-viewer";
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
  UploadIcon,
  FolderIcon,
  FileIcon,
  FileTextIcon,
  PlusIcon,
  Loader2,
  FolderPlusIcon,
  ImageIcon,
  VideoIcon,
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
    fetchItems();
  }, [currentPath]);

  // Poll for newly created folder
  useEffect(() => {
    if (createdFolderPath && pollCount < 10) {
      const checkForFolder = async () => {
        // Only show loading UI if absolutely necessary - removed early loading indicator
        if (pollCount > 6) {
          setIsLoading(true);
        }
        
        try {
          // Get the parent path of the created folder
          const pathParts = createdFolderPath.split('/');
          const folderName = pathParts.pop() || '';
          const parentPath = pathParts.join('/');
          
          // Fetch the parent directory
          const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
          const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
          const path = parentPath ? `/${parentPath}` : '';
          
          // Create headers - only include auth if token exists and is valid
          const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
          };
          
          if (token && token.length > 10) {
            headers.Authorization = `token ${token}`;
          }
          
          // Try with token first (if available)
          let response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
            headers
          });
          
          // If failed with token, try without token for public repos
          if (!response.ok && token) {
            response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
              headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
          }
          
          if (response.ok) {
            const data = await response.json();
            
            // Check if our folder exists
            const folderExists = Array.isArray(data) && data.some(
              item => item.type === 'dir' && item.name === folderName
            );
            
            if (folderExists) {
              // Folder found! Navigate to it
              setCreatedFolderPath(null);
              setPollCount(0);
              navigateToPath(createdFolderPath);
              return;
            }
          }
          
          // Folder not found yet, continue polling
          setPollCount(prev => prev + 1);
          
          if (pollCount < 9) {
            // Exponential backoff for polling
            const delay = Math.min(1000 * Math.pow(1.5, pollCount), 10000);
            setTimeout(checkForFolder, delay);
          } else {
            // Give up after 10 attempts
            setCreatedFolderPath(null);
            setPollCount(0);
            fetchItems(); // Refresh items
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

  // Poll for newly uploaded file with minimized loading indicators
  useEffect(() => {
    if (uploadedFilePath && uploadPollCount < 10) {
      const checkForFile = async () => {
        // Only show loading UI if absolutely necessary - removed early loading indicator
        if (uploadPollCount > 6) {
          setIsLoading(true);
        }
        
        try {
          // Get the directory path and filename
          const pathParts = uploadedFilePath.split('/');
          const fileName = pathParts.pop() || '';
          const dirPath = pathParts.join('/');
          
          // Fetch the directory
          const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
          const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'kstubhieeee/files';
          const path = dirPath ? `/${dirPath}` : '';
          
          // Create headers - only include auth if token exists and is valid
          const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
          };
          
          if (token && token.length > 10) {
            headers.Authorization = `token ${token}`;
          }
          
          // Try with token first (if available)
          let response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
            headers
          });
          
          // If failed with token, try without token for public repos
          if (!response.ok && token) {
            response = await fetch(`https://api.github.com/repos/${repo}/contents${path}`, {
              headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
          }
          
          if (response.ok) {
            const data = await response.json();
            
            // Check if our file exists
            const fileExists = Array.isArray(data) && data.some(
              item => item.type === 'file' && item.name === fileName
            );
            
            if (fileExists) {
              // File found! Refresh the directory
              setUploadedFilePath(null);
              setUploadPollCount(0);
              fetchItems();
              return;
            }
          }
          
          // File not found yet, continue polling
          setUploadPollCount(prev => prev + 1);
          
          if (uploadPollCount < 9) {
            // Exponential backoff for polling
            const delay = Math.min(1000 * Math.pow(1.5, uploadPollCount), 5000);
            setTimeout(checkForFile, delay);
          } else {
            // Give up after 10 attempts
            setUploadedFilePath(null);
            setUploadPollCount(0);
            fetchItems(); // Refresh items
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

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      // Get repository information - set a default that exists as a fallback
      const defaultRepo = 'bradtraversy/50projects50days';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || defaultRepo;
      const path = currentPath ? `/${currentPath}` : '';
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
      
      // Create fetch URL and headers
      const apiUrl = `https://api.github.com/repos/${repo}/contents${path}`;
      console.log(`Fetching from: ${apiUrl}`);
      
      // Prepare headers - only include auth if token exists
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token && token.length > 10) { // Simple validation to avoid adding invalid tokens
        headers.Authorization = `token ${token}`;
      }
      
      // First attempt with token (if available)
      let response;
      try {
        response = await fetch(apiUrl, { headers });
      } catch (fetchError) {
        console.error('Network error fetching from GitHub:', fetchError);
        toast({
          title: "Network Error",
          description: "Failed to connect to GitHub API. Please check your internet connection.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // If failed with token, try again without token for public repos
      if (!response.ok && token) {
        console.log('Retry without token for public repository');
        try {
          response = await fetch(apiUrl, { 
            headers: { 'Accept': 'application/vnd.github.v3+json' } 
          });
        } catch (retryError) {
          console.error('Network error on retry:', retryError);
        }
      }
      
      // Handle various error cases
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Error:', response.status, errorText);
        
        if (response.status === 404) {
          // Repository or path doesn't exist
          setItems([]);
          toast({
            title: "Repository or Path Not Found",
            description: `The repository "${repo}" or path "${path}" could not be found. Using demo data instead.`,
            variant: "destructive",
          });
          
          // Set some demo items as fallback
          const demoItems = [
            { name: 'Example Folder', path: 'example-folder', type: 'dir' },
            { 
              name: 'README.md', 
              path: 'README.md', 
              type: 'file',
              html_url: 'https://github.com/bradtraversy/50projects50days/blob/master/README.md',
              size: 1024
            },
            { 
              name: 'sample-image.jpg', 
              path: 'sample-image.jpg', 
              type: 'file', 
              html_url: 'https://source.unsplash.com/random/800x600',
              size: 4096
            }
          ];
          setItems(demoItems);
          setIsLoading(false);
          return;
        }
        
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your GitHub token has expired or is invalid. Please update your token.",
            variant: "destructive",
          });
          throw new Error('GitHub token is invalid or has expired');
        }
        
        if (response.status === 403) {
          if (response.headers.get('X-RateLimit-Remaining') === '0') {
            throw new Error('GitHub API rate limit exceeded. Please try again later or use a token.');
          }
          throw new Error('Access forbidden. This may be a private repository that requires authentication.');
        }
        
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Sort items: folders first, then files
      const sortedItems = Array.isArray(data) 
        ? data.sort((a, b) => {
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
          })
        : [];
      
      setItems(sortedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error Loading Contents",
        description: error instanceof Error ? error.message : "Failed to load files and folders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPath = (path: string) => {
    // Update URL to match the current path
    if (path) {
      router.push(`/${path}`);
    } else {
      router.push('/');
    }
    
    // Update the path history for back navigation
    if (path !== currentPath) {
      const newHistory = [...pathHistory];
      // If we're not going back, add the current path to history
      if (!pathHistory.includes(path)) {
        newHistory.push(path);
      } else {
        // If we're going back, trim the history
        const index = pathHistory.indexOf(path);
        newHistory.splice(index + 1);
      }
      setPathHistory(newHistory);
    }
    setCurrentPath(path);
  };

  const navigateToParentFolder = () => {
    if (currentPath === '') return; // Already at root
    
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove the last part
    const parentPath = pathParts.join('/');
    navigateToPath(parentPath);
  };

  const handleItemClick = (item: ItemType) => {
    if (item.type === 'dir') {
      navigateToPath(item.path);
    } else if (item.type === 'file') {
      const fileItem = item as FileItem;
      const extension = item.name.split('.').pop()?.toLowerCase() || '';
      
      // For README.md files, show the markdown viewer
      if (item.name.toLowerCase() === 'readme.md') {
        setReadmeUrl(fileItem.html_url);
        setReadmeFileName(item.name);
        setReadmeOpen(true);
      } 
      // For PDF files, use the dedicated PDF viewer
      else if (extension === 'pdf') {
        setPdfUrl(fileItem.html_url);
        setPdfFileName(item.name);
        setPdfOpen(true);
      }
      // For Markdown files (other than README), use dedicated Markdown viewer
      else if (['md', 'markdown'].includes(extension) && item.name.toLowerCase() !== 'readme.md') {
        setMarkdownUrl(fileItem.html_url);
        setMarkdownFileName(item.name);
        setMarkdownOpen(true);
      }
      // For image files, show the image viewer
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
        setMediaUrl(fileItem.html_url);
        setMediaFileName(item.name);
        setMediaType("image");
        setMediaOpen(true);
      } 
      // For video files, show the dedicated video viewer instead of MediaViewer
      else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
        setVideoUrl(fileItem.html_url);
        setVideoFileName(item.name);
        setVideoOpen(true);
      } 
      // For other files, open in new tab
      else {
        window.open(fileItem.html_url, '_blank');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file extension for more reliable type detection
      const fileName = file.name.toLowerCase();
      const extension = fileName.split('.').pop() || '';
      
      // Helper function to check if a string contains another string
      const contains = (str: string, search: string) => str.indexOf(search) !== -1;
      
      // Check if it's a supported file type
      const isReadme = fileName === 'readme.md';
      const isPdf = file.type === "application/pdf" || extension === 'pdf';
      const isMarkdown = file.type === "text/markdown" || 
                        file.type === "text/x-markdown" || 
                        contains(file.type, 'markdown') ||
                        file.type === "text/plain" ||  // Some browsers might send md files as plain text
                        extension === 'md' || 
                        extension === 'markdown';
      const isImage = file.type.startsWith("image/") || 
                     ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
      const isVideo = file.type.startsWith("video/") || 
                     ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension);
      
      // Format file size for display
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
      
      // Check file size - GitHub has a 100MB limit
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
      
      // Add current path to formData
      formData.append("path", currentPath);
      
      const result = await uploadFile(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "File uploaded successfully.",
          variant: "default",
        });
        
        // Track the uploaded file but don't show immediate loading indicator
        const filePath = currentPath 
          ? `${currentPath}/${selectedFile.name}` 
          : selectedFile.name;
        
        // Try a silent fetch first
        try {
          await fetchItems();
        } catch (e) {
          console.log("Initial refresh failed, will poll for file silently");
          setUploadedFilePath(filePath);
          setUploadPollCount(0);
        }
        
        // Close dialog and reset
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
    
    // Create README.md file in the new folder
    const readmeContent = `# ${newFolderName}\n\nThis folder was created with GitHub File Uploader.`;
    const folderPath = currentPath 
      ? `${currentPath}/${newFolderName}` 
      : newFolderName;
    
    setIsCreatingFolder(true);
    try {
      // Create a README.md file in the new folder
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
        
        // Start polling for the folder, but don't show immediate loading state
        setCreatedFolderPath(folderPath);
        setPollCount(0);
        
        // Close dialog and reset form
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
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return <ImageIcon className={`${className} text-purple-500`} />;
    }
    
    // Video files
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
      return <VideoIcon className={`${className} text-pink-500`} />;
    }
    
    // PDF files
    if (extension === 'pdf') {
      return <FileIcon className={`${className} text-red-500`} />;
    }
    
    // Markdown files
    if (['md', 'markdown'].includes(extension)) {
      return <FileTextIcon className={`${className} text-green-500`} />;
    }
    
    // Default file icon
    return <FileIcon className={`${className} text-gray-500`} />;
  };

  return (
    <>
      <Card className="w-full border-none shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Files</h2>
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
                    className="flex items-center p-3 rounded-md hover:bg-secondary/30 cursor-pointer"
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
      
      <ReadmeViewer 
        isOpen={readmeOpen} 
        onOpenChange={setReadmeOpen}
        url={readmeUrl}
        fileName={readmeFileName}
      />

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
    </>
  );
} 