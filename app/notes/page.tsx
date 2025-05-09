import { Toaster } from "@/components/ui/toaster";
import DriveInterface from "@/components/drive-interface";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

export default function NotesPage() {
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
          <DriveInterface initialPath="/" />
        </Suspense>
      </div>
      <Toaster />
    </main>
  );
} 