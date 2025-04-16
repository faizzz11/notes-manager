import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import ClientDriveInterface from "./client-drive";

interface PathPageProps {
  params: {
    path: string[];
  };
}

// Server component (no "use client" directive)
export default function PathPage({ params }: PathPageProps) {
  // In a server component, we need to handle params safely
  const pathString = Array.isArray(params.path) ? params.path.join('/') : '';

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading">GitHub File Manager</h1>
          <p className="text-muted-foreground font-body">
            Manage your files and folders in your GitHub repository
          </p>
        </div>
        
        <Suspense fallback={
          <div className="h-64 flex justify-center items-center">
            <Loading message="Loading file manager..." />
          </div>
        }>
          <ClientDriveInterface initialPath={pathString} />
        </Suspense>
      </div>
      <Toaster />
    </main>
  );
} 