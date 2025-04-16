import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Search, UserIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses | Notes Manager",
  description: "Browse and manage your courses",
};

export default function CoursesPage() {
  // In a real app, fetch courses from an API
  const courses = [
    {
      id: "1",
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development including HTML, CSS, and JavaScript",
      instructor: "John Doe",
      totalSubjects: 8,
      progress: 35,
      lastAccessed: "2025-09-20",
    },
    {
      id: "2",
      title: "Advanced React Concepts",
      description: "Master advanced React concepts like hooks, context, and state management",
      instructor: "Jane Smith",
      totalSubjects: 12,
      progress: 65,
      lastAccessed: "2025-09-22",
    },
    {
      id: "3",
      title: "Backend Development with Node.js",
      description: "Build scalable backends with Node.js, Express, and MongoDB",
      instructor: "Alex Johnson",
      totalSubjects: 10,
      progress: 15,
      lastAccessed: "2025-09-18",
    },
  ];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 w-[250px]"
            />
          </div>
          <Button>Add Course</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link href={`/courses/${course.id}`} key={course.id}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{course.totalSubjects} subjects</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Last accessed on {course.lastAccessed}</span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 