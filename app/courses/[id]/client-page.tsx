"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Calendar, Clock, User, BookOpen, BookMarked, FileText } from "lucide-react";

interface CoursePageClientProps {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    totalSubjects: number;
    progress: number;
    lastAccessed: string;
  };
}

export default function CoursePageClient({ course }: CoursePageClientProps) {
  const [activeTab, setActiveTab] = useState("subjects");
  const [searchTerm, setSearchTerm] = useState("");

  // Example data - in a real app, you would fetch this from an API
  const subjects = [
    {
      id: "subj-1",
      title: "Introduction to React",
      description: "Learn the basics of React including components, props, and state",
      notesCount: 12,
      flashcardsCount: 45,
      quizzesCount: 3,
      lastAccessed: "2025-09-15"
    },
    {
      id: "subj-2",
      title: "JavaScript Fundamentals",
      description: "Core concepts of JavaScript including variables, functions, and objects",
      notesCount: 18,
      flashcardsCount: 60,
      quizzesCount: 5,
      lastAccessed: "2025-09-10"
    },
    {
      id: "subj-3",
      title: "CSS and Styling",
      description: "Modern CSS techniques, Flexbox, Grid, and responsive design",
      notesCount: 15,
      flashcardsCount: 30,
      quizzesCount: 2,
      lastAccessed: "2025-09-05"
    }
  ];

  const resources = [
    {
      id: "res-1",
      title: "React Official Documentation",
      type: "Website",
      link: "https://reactjs.org/docs/getting-started.html",
      addedOn: "2025-08-25"
    },
    {
      id: "res-2",
      title: "Modern JavaScript for React Developers",
      type: "PDF",
      link: "#",
      addedOn: "2025-08-20"
    },
    {
      id: "res-3",
      title: "Web Development Bootcamp",
      type: "Video Course",
      link: "#",
      addedOn: "2025-08-15"
    }
  ];

  const assignments = [
    {
      id: "assign-1",
      title: "Build a ToDo App",
      dueDate: "2025-10-15",
      status: "Not Started",
      subjectId: "subj-1"
    },
    {
      id: "assign-2",
      title: "JavaScript Array Methods Practice",
      dueDate: "2025-10-10",
      status: "In Progress",
      subjectId: "subj-2"
    },
    {
      id: "assign-3",
      title: "Responsive Layout Challenge",
      dueDate: "2025-10-05",
      status: "Completed",
      subjectId: "subj-3"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.description}</p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              {course.instructor}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              {course.totalSubjects} subjects
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Last accessed: {course.lastAccessed}
            </div>
          </div>
          
          <div className="mt-4 w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {course.progress}% complete
          </p>
        </div>
        
        <Button>Continue Learning</Button>
      </div>

      <div className="flex items-center justify-between">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add {activeTab === "subjects" ? "Subject" : activeTab === "resources" ? "Resource" : "Assignment"}
              </Button>
            </div>
          </div>

          <TabsContent value="subjects" className="mt-6">
            <ScrollArea className="h-[650px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.length > 0 ? filteredSubjects.map(subject => (
                  <Link href={`/subjects/${subject.id}`} key={subject.id}>
                    <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle>{subject.title}</CardTitle>
                        <CardDescription>{subject.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {subject.notesCount} notes
                          </Badge>
                          <Badge variant="outline" className="flex items-center">
                            <BookMarked className="h-3 w-3 mr-1" />
                            {subject.flashcardsCount} flashcards
                          </Badge>
                          <Badge variant="outline" className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {subject.quizzesCount} quizzes
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p className="text-xs text-muted-foreground">
                          Last accessed: {subject.lastAccessed}
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                )) : (
                  <div className="col-span-3 py-12 text-center">
                    <h3 className="text-lg font-medium">No subjects found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchTerm ? `No subjects matching "${searchTerm}"` : "No subjects have been added to this course yet"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Resources</CardTitle>
                <CardDescription>
                  Supplementary materials to help with your studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResources.length > 0 ? filteredResources.map(resource => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">
                            <a href={resource.link} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                              {resource.title}
                            </a>
                          </TableCell>
                          <TableCell>{resource.type}</TableCell>
                          <TableCell>{resource.addedOn}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <p className="text-muted-foreground">
                              {searchTerm ? `No resources matching "${searchTerm}"` : "No resources have been added yet"}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>
                  Track your progress on assignments for this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.length > 0 ? filteredAssignments.map(assignment => {
                        const subject = subjects.find(s => s.id === assignment.subjectId);
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                {assignment.dueDate}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/subjects/${assignment.subjectId}`} className="text-primary hover:underline">
                                {subject?.title || "Unknown Subject"}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <p className="text-muted-foreground">
                              {searchTerm ? `No assignments matching "${searchTerm}"` : "No assignments have been added yet"}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 