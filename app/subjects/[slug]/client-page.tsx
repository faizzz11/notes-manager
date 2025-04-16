"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight, Book, Video, Download, MessageCircle, Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import * as THREE from 'three';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Define proper types for subject data
interface Topic {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  noteUrl: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

interface Subject {
  title: string;
  description: string;
  imageUrl: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  instructors: string[];
  modules: Module[];
  notes: { id: string; title: string; content: string }[];
  flashcards: { id: string; question: string; answer: string }[];
}

interface SubjectData {
  [key: string]: Subject;
}

// Sample subject data
const subjectData: SubjectData = {
  "computer-science": {
    title: "Computer Science",
    description:
      "Comprehensive computer science learning resources covering algorithms, data structures, operating systems, databases, and more.",
    imageUrl: "/subjects/computer-science.jpg",
    progress: 68,
    completedTopics: 22,
    totalTopics: 32,
    instructors: ["Dr. Aisha Patel", "Prof. James Wilson"],
    modules: [
      {
        id: "mod1",
        title: "Data Structures & Algorithms",
        description: "Fundamental data structures and algorithms",
        topics: [
          {
            id: "topic1",
            title: "Arrays and Linked Lists",
            description: "Understanding basic data structures",
            videoUrl: "https://www.youtube.com/embed/8hly31xKli0",
            noteUrl: "/notes/arrays-linked-lists.pdf",
            duration: "32 min",
            completed: true,
          },
          {
            id: "topic2",
            title: "Stacks and Queues",
            description: "LIFO and FIFO data structures",
            videoUrl: "https://www.youtube.com/embed/wjI1WNcIntg",
            noteUrl: "/notes/stacks-queues.pdf",
            duration: "28 min",
            completed: true,
          },
          {
            id: "topic3",
            title: "Trees and Graphs",
            description: "Hierarchical and network data structures",
            videoUrl: "https://www.youtube.com/embed/oSWTXtMglKE",
            noteUrl: "/notes/trees-graphs.pdf",
            duration: "45 min",
            completed: false,
          },
        ],
      },
      {
        id: "mod2",
        title: "Operating Systems",
        description: "Core concepts of operating systems",
        topics: [
          {
            id: "topic4",
            title: "Process Management",
            description: "Understanding processes and threads",
            videoUrl: "https://www.youtube.com/embed/26QPDBe-NB8",
            noteUrl: "/notes/process-management.pdf",
            duration: "36 min",
            completed: true,
          },
          {
            id: "topic5",
            title: "Memory Management",
            description: "Virtual memory and paging",
            videoUrl: "https://www.youtube.com/embed/LKMhi4Mm3RM",
            noteUrl: "/notes/memory-management.pdf",
            duration: "42 min",
            completed: true,
          },
          {
            id: "topic6",
            title: "File Systems",
            description: "File organization and access methods",
            videoUrl: "https://www.youtube.com/embed/KN8YgJnShPM",
            noteUrl: "/notes/file-systems.pdf",
            duration: "38 min",
            completed: false,
          },
        ],
      },
      {
        id: "mod3",
        title: "Database Management Systems",
        description: "Principles of database design and management",
        topics: [
          {
            id: "topic7",
            title: "Entity-Relationship Model",
            description: "Database design using ER modeling",
            videoUrl: "https://www.youtube.com/embed/QpdhBUYk7Kk",
            noteUrl: "/notes/er-model.pdf",
            duration: "33 min",
            completed: true,
          },
          {
            id: "topic8",
            title: "SQL Fundamentals",
            description: "SQL queries for data manipulation",
            videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
            noteUrl: "/notes/sql-fundamentals.pdf",
            duration: "55 min",
            completed: false,
          },
          {
            id: "topic9",
            title: "Transaction Management",
            description: "ACID properties and concurrency control",
            videoUrl: "https://www.youtube.com/embed/5ZjhNTM8XU8",
            noteUrl: "/notes/transaction-management.pdf",
            duration: "40 min",
            completed: false,
          },
        ],
      },
    ],
    notes: [
      { id: "1", title: "Note 1", content: "Content for note 1" },
      { id: "2", title: "Note 2", content: "Content for note 2" },
    ],
    flashcards: [
      { id: "1", question: "Question 1", answer: "Answer 1" },
      { id: "2", question: "Question 2", answer: "Answer 2" },
    ]
  },
  "electrical-engineering": {
    title: "Electrical Engineering",
    description:
      "Comprehensive electrical engineering learning resources covering circuit theory, power systems, control systems, and more.",
    imageUrl: "/subjects/electrical.jpg",
    progress: 52,
    completedTopics: 11,
    totalTopics: 21,
    instructors: ["Dr. Sarah Johnson", "Prof. Michael Chen"],
    modules: [
      {
        id: "mod1",
        title: "Circuit Theory",
        description: "Fundamental principles of electrical circuits",
        topics: [
          {
            id: "topic1",
            title: "Ohm's Law and Kirchhoff's Laws",
            description: "Basic principles of circuit analysis",
            videoUrl: "https://www.youtube.com/embed/G3H5lKESJGc",
            noteUrl: "/notes/ohms-kirchhoffs-laws.pdf",
            duration: "35 min",
            completed: true,
          },
          {
            id: "topic2",
            title: "Thevenin and Norton Equivalents",
            description: "Circuit simplification techniques",
            videoUrl: "https://www.youtube.com/embed/ENz-f9YXMi0",
            noteUrl: "/notes/thevenin-norton.pdf",
            duration: "42 min",
            completed: true,
          },
        ],
      },
    ],
    notes: [],
    flashcards: []
  },
};

interface TopicProps {
  topic: Topic;
}

function Topic({ topic }: TopicProps) {
  const [activeTab, setActiveTab] = useState("video");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-white">{topic.title}</h3>
        <span className="text-white/70 text-sm">{topic.duration}</span>
      </div>
      <p className="text-white/70">{topic.description}</p>

      <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 bg-white/10">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="mt-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={topic.videoUrl}
              title={topic.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <Card className="border-0 bg-white/5">
            <CardContent className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">
                  {topic.title} Notes
                </h4>
                <p className="text-white/70">
                  Comprehensive notes covering all key concepts and examples.
                </p>
              </div>
              <div className="flex justify-between items-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" /> Download Notes
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion" className="mt-4">
          <Card className="border-0 bg-white/5">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">
                  Join the Discussion
                </h4>
                <p className="text-white/70 mb-4">
                  Connect with other students to discuss this topic.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  View Discussions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SubjectPageClientProps {
  slug: string;
}

export default function SubjectPageClient({ slug }: SubjectPageClientProps) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real app, fetch data from API
    const subjectInfo = subjectData[slug as keyof typeof subjectData];
    if (subjectInfo) {
      setSubject(subjectInfo);
      // Set first topic as default selected
      if (subjectInfo.modules.length > 0 && subjectInfo.modules[0].topics.length > 0) {
        setSelectedTopic(subjectInfo.modules[0].topics[0]);
      }
    }
  }, [slug]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4 font-heading">Subject not found</h1>
          <p className="text-white/70 mb-6 font-body">
            The subject you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/subjects">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse Subjects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-purple-950 font-body">
      {/* Navbar */}
      <nav className="relative z-10 container mx-auto py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white font-heading">EduNotes</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/subjects"
            className="text-white hover:text-white transition border-b-2 border-purple-500 pb-1"
          >
            Subjects
          </Link>
          <Link
            href="/notes"
            className="text-white/80 hover:text-white transition"
          >
            Notes
          </Link>
          <Link
            href="/videos"
            className="text-white/80 hover:text-white transition"
          >
            Videos
          </Link>
          <Link
            href="/community"
            className="text-white/80 hover:text-white transition"
          >
            Community
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            Login
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90">
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Subject Header */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={subject.imageUrl}
            alt={subject.title}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-20">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/subjects" className="hover:text-white">Subjects</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">{subject.title}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-heading">
            {subject.title}
          </h1>
          <p className="text-white/80 max-w-2xl">
            {subject.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0 md:mr-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-white">Your Progress</h2>
              <span className="text-white font-bold">{subject.progress}%</span>
            </div>
            <div className="w-full md:w-80">
              <Progress value={subject.progress} className="h-2" />
            </div>
          </div>
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2 text-purple-400" />
              <span>
                <strong className="text-white">{subject.completedTopics}</strong>/{subject.totalTopics} topics completed
              </span>
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-2 text-purple-400" />
              <span>
                <strong className="text-white">{subject.instructors.length}</strong> instructors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu toggle */}
      <div className="md:hidden container mx-auto px-4 mb-6">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-between bg-white/5 border-white/20 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span>Browse Modules</span>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Modules Sidebar */}
          <div className={`md:w-1/3 lg:w-1/4 md:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Modules</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {subject.modules.map((module: Module, index: number) => (
                  <AccordionItem key={module.id} value={module.id} className="border-b-0 bg-white/5 rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-white hover:bg-white/5 hover:no-underline">
                      <div className="text-left">
                        <div className="font-medium">{module.title}</div>
                        <p className="text-xs text-white/70 mt-1">{module.topics.length} topics</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white/5">
                      <div className="px-4 py-2 space-y-1">
                        {module.topics.map((topic: Topic) => (
                          <div
                            key={topic.id}
                            onClick={() => {
                              setSelectedTopic(topic);
                              setMobileMenuOpen(false);
                            }}
                            className={`p-2 rounded cursor-pointer flex items-center gap-2 ${
                              selectedTopic && selectedTopic.id === topic.id
                                ? "bg-purple-600"
                                : "hover:bg-white/10"
                            }`}
                          >
                            {topic.completed ? (
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-white/30"></div>
                            )}
                            <span className="text-sm text-white">{topic.title}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:w-2/3 lg:w-3/4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{subject.title}</h1>
                  <p className="text-muted-foreground">{subject.description}</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                  </TabsList>
                  <Input
                    placeholder="Search..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <TabsContent value="notes" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subject.notes.map((note) => (
                      <Card key={note.id}>
                        <CardHeader className="pb-2">
                          <CardTitle>{note.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="flashcards" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subject.flashcards.map((card) => (
                      <Card key={card.id}>
                        <CardHeader className="pb-2">
                          <CardTitle>{card.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{card.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-4">
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">No quizzes available yet</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </main>
  );
} 