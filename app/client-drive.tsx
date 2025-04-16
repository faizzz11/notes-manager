"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Folder, File, Search, Upload, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  created: string;
  size?: string;
}

interface DriveProps {
  path?: string;
}

export default function ClientDrive({ path = "" }: DriveProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("folder");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState("grid");
  
  // Example data - in a real app, you would fetch this based on the path
  const [items, setItems] = useState<FileItem[]>([
    { 
      id: "1", 
      name: "Documents", 
      type: "folder", 
      created: "2025-05-10" 
    },
    { 
      id: "2", 
      name: "Images", 
      type: "folder", 
      created: "2025-05-09" 
    },
    { 
      id: "3", 
      name: "Notes", 
      type: "folder", 
      created: "2025-05-08" 
    },
    { 
      id: "4", 
      name: "Project Report.pdf", 
      type: "file", 
      created: "2025-05-07",
      size: "2.4 MB" 
    },
    { 
      id: "5", 
      name: "Meeting Notes.docx", 
      type: "file", 
      created: "2025-05-06",
      size: "1.2 MB" 
    }
  ]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      const newPath = path ? `${path}/${item.name}` : item.name;
      router.push(`/${newPath}`);
    } else {
      // Handle file click (preview, download, etc.)
      console.log("File clicked:", item);
    }
  };

  const handleCreateNewItem = () => {
    if (!newItemName) return;
    
    const newItem: FileItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      created: new Date().toISOString().split('T')[0],
      size: newItemType === "file" ? "0 KB" : undefined
    };
    
    setItems([...items, newItem]);
    setNewItemName("");
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {path ? path.split('/').join(' / ') : 'My Drive'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {filteredItems.length} items
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                  Create a new folder or upload a file to your drive.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="folder" onValueChange={(value) => setNewItemType(value as "file" | "folder")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="folder">Folder</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="folder" className="mt-4">
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New Folder"
                      className="mt-2"
                    />
                  </TabsContent>
                  
                  <TabsContent value="file" className="mt-4">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New File"
                      className="mt-2 mb-4"
                    />
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewItem}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {path && (
            <Button 
              variant="ghost" 
              className="text-sm h-8 px-2"
              onClick={() => router.push(path.includes('/') ? `/${path.split('/').slice(0, -1).join('/')}` : '/')}
            >
              ← Back
            </Button>
          )}
        </div>
        
        <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="grid" className="h-8 px-3">Grid</TabsTrigger>
            <TabsTrigger value="list" className="h-8 px-3">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredItems.length > 0 ? (
          <div className={activeView === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
            : "space-y-2"
          }>
            {filteredItems.map(item => (
              activeView === "grid" ? (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    {item.type === "folder" ? (
                      <Folder className="h-12 w-12 text-blue-500 mb-2" />
                    ) : (
                      <File className="h-12 w-12 text-gray-500 mb-2" />
                    )}
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created).toLocaleDateString()}
                      {item.size && ` • ${item.size}`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div 
                  key={item.id}
                  className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {item.type === "folder" ? (
                    <Folder className="h-5 w-5 text-blue-500 mr-3" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500 mr-3" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created).toLocaleDateString()}
                    </p>
                  </div>
                  {item.size && <span className="text-sm text-muted-foreground">{item.size}</span>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-1">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "This folder is empty"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Item
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 