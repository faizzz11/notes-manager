import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import DriveInterface from "@/components/drive-interface";

interface PathPageProps {
  params: {
    path?: string | string[];
  };
}

export default function NotesPathPage({ params }: PathPageProps) {
  // Use a default path if params is not available
  const defaultPath = 'notes';
  
  // Get the path segments safely
  const pathSegments = params?.path 
    ? (Array.isArray(params.path) ? params.path : [params.path])
    : [defaultPath];
  
  // Join the path segments
  const pathString = pathSegments.join('/');

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading">Notes Manager</h1>
          <p className="text-muted-foreground font-body">
            Manage your notes in the GitHub repository
          </p>
        </div>
        
        <Suspense fallback={
          <div className="h-64 flex justify-center items-center">
            <Loading message="Loading notes..." />
          </div>
        }>
          <DriveInterface initialPath={pathString} />
        </Suspense>
      </div>
      <Toaster />
    </main>
  );
} 