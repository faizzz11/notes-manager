import { Toaster } from "@/components/ui/toaster";
import DriveInterface from "@/components/drive-interface";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

interface PathPageProps {
  params: {
    path: string[];
  };
}

export default function PathPage({ params }: PathPageProps) {
  // Convert the path array to a string path
  const pathString = params.path.join('/');

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">GitHub File Manager</h1>
          <p className="text-muted-foreground">
            Manage your files and folders in your GitHub repository
          </p>
        </div>
        
        <Suspense fallback={
          <div className="h-64 flex justify-center items-center">
            <Loading message="Loading file manager..." />
          </div>
        }>
          <DriveInterface initialPath={pathString} />
        </Suspense>
      </div>
      <Toaster />
    </main>
  );
} 