import { Metadata } from "next";
import CoursePageClient from "./client-page";

// Mock course data
const courses = [
  {
    id: "course-1",
    title: "Web Development Fundamentals",
    description: "Learn the core technologies that power modern web applications",
    instructor: "John Smith",
    totalSubjects: 12,
    progress: 45,
    lastAccessed: "2025-09-20",
  },
  {
    id: "course-2",
    title: "Data Science Essentials",
    description: "Master the tools and techniques for analyzing complex datasets",
    instructor: "Jane Doe",
    totalSubjects: 8,
    progress: 30,
    lastAccessed: "2025-09-18",
  },
  {
    id: "course-3",
    title: "Mobile App Development",
    description: "Create cross-platform mobile applications with React Native",
    instructor: "Alex Johnson",
    totalSubjects: 10,
    progress: 20,
    lastAccessed: "2025-09-15",
  }
];

// Generate metadata based on course ID
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = courses.find(c => c.id === params.id);
  
  return {
    title: course ? `${course.title} | Notes Manager` : "Course Not Found",
    description: course?.description || "Course details not available",
  };
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = courses.find(c => c.id === params.id);
  
  if (!course) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p className="mt-2">The course you are looking for does not exist.</p>
        </div>
      </div>
    );
  }
  
  return <CoursePageClient course={course} />;
} 