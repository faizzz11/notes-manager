"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Search, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectCard } from "@/components/subject-card";
import { Toaster } from "@/components/ui/toaster";

// Sample subject data
const subjects = [
  {
    id: 1,
    title: "Computer Science",
    description: "Algorithms, Data Structures, OS, DBMS, and more.",
    imageUrl: "/subjects/computer-science.jpg",
    modules: 8,
    notes: 42,
    category: "engineering",
    year: "all",
  },
  {
    id: 2,
    title: "Electrical Engineering",
    description: "Circuit Theory, Power Systems, Control Systems, etc.",
    imageUrl: "/subjects/electrical.jpg",
    modules: 7,
    notes: 36,
    category: "engineering",
    year: "all",
  },
  {
    id: 3,
    title: "Mechanical Engineering",
    description: "Thermodynamics, Fluid Mechanics, Machine Design, etc.",
    imageUrl: "/subjects/mechanical.jpg",
    modules: 9,
    notes: 45,
    category: "engineering",
    year: "all",
  },
  {
    id: 4,
    title: "Civil Engineering",
    description: "Structural Analysis, Soil Mechanics, Transportation, etc.",
    imageUrl: "/subjects/civil.jpg",
    modules: 6,
    notes: 32,
    category: "engineering",
    year: "all",
  },
  {
    id: 5,
    title: "Electronics Engineering",
    description: "Digital Electronics, VLSI Design, Microprocessors, etc.",
    imageUrl: "/subjects/electronics.jpg",
    modules: 8,
    notes: 38,
    category: "engineering",
    year: "all",
  },
  {
    id: 6,
    title: "Chemical Engineering",
    description: "Chemical Processes, Reaction Engineering, Plant Design, etc.",
    imageUrl: "/subjects/chemical.jpg",
    modules: 7,
    notes: 30,
    category: "engineering",
    year: "all",
  },
  {
    id: 7,
    title: "Mathematics",
    description: "Calculus, Linear Algebra, Differential Equations, etc.",
    imageUrl: "/subjects/mathematics.jpg",
    modules: 5,
    notes: 28,
    category: "foundation",
    year: "first",
  },
  {
    id: 8,
    title: "Physics",
    description: "Mechanics, Electromagnetism, Modern Physics, etc.",
    imageUrl: "/subjects/physics.jpg",
    modules: 4,
    notes: 24,
    category: "foundation",
    year: "first",
  },
];

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Filter subjects based on search and filters
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || subject.category === categoryFilter;
    const matchesYear = yearFilter === "all" || subject.year === yearFilter;
    return matchesSearch && matchesCategory && matchesYear;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-purple-950">
      {/* Navbar */}
      <nav className="relative z-10 container mx-auto py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">EduNotes</span>
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

      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Engineering{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              Subjects
            </span>
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Explore our comprehensive collection of engineering subjects with
            top-tier notes, video lectures, and important questions.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12 bg-white/5 backdrop-blur-sm p-6 rounded-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search subjects..."
                className="pl-10 bg-white/10 border-white/20 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="first">First Year</SelectItem>
                    <SelectItem value="second">Second Year</SelectItem>
                    <SelectItem value="third">Third Year</SelectItem>
                    <SelectItem value="fourth">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                title={subject.title}
                description={subject.description}
                imageUrl={subject.imageUrl}
                modules={subject.modules}
                notes={subject.notes}
                delay={index * 0.1}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-white/80 text-lg">
                No subjects match your search criteria.
              </p>
              <Button
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setYearFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-800 to-violet-800 rounded-xl p-8 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need a Specific Subject?
          </h2>
          <p className="text-white/90 mb-6">
            Can't find what you're looking for? Our team is continuously adding
            new subjects. Let us know what you need.
          </p>
          <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90">
            Request a Subject <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-black text-white/70">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
                <span className="text-lg font-bold text-white">EduNotes</span>
              </Link>
              <p className="max-w-xs">
                Empowering engineering students with quality learning resources
                and community support.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Subjects</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Computer Science
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Electrical
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Mechanical
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Civil
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Notes
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Videos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Important Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Community
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 EduNotes. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="#" className="hover:text-white transition">
                Twitter
              </Link>
              <Link href="#" className="hover:text-white transition">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-white transition">
                Facebook
              </Link>
              <Link href="#" className="hover:text-white transition">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </main>
  );
} 