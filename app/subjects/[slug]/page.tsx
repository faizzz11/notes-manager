// Server component (no "use client" directive)

import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import SubjectPageClient from "./client-page";

// Define proper types for subject data
interface PageProps {
  params: {
    slug: string;
  };
}

// This is a server component
export default async function SubjectPage({ params }: PageProps) {
  // Properly await params in a server component
  const slug = params.slug;
  
  return (
    <Suspense fallback={<Loading message="Loading subject..." />}>
      <SubjectPageClient slug={slug} />
    </Suspense>
  );
} 