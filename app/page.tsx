"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  VideoIcon,
  Download,
  Users,
  Sparkles
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Float, 
  PresentationControls, 
  Environment,
  ContactShadows,
  Box
} from "@react-three/drei";
import DriveInterface from "@/components/drive-interface";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import { SubjectCard } from "@/components/subject-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { FeatureCard } from "@/components/feature-card";
import { Inter } from "next/font/google";
import * as THREE from 'three';

// Custom CSS for bg-pattern
const styles = {
  bgPattern: {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  },
};

// Remove the preloading since we'll use a custom book
// useGLTF.preload("/models/book.glb");

// Animated 3D book stack created from Three.js primitives
function Model(props: React.PropsWithChildren<{ [key: string]: any }>) {
  // Create a reference to the group for animation
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate the books with subtle floating movement
  useFrame((state) => {
    if (groupRef.current) {
      // Add subtle floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} {...props}>
      {/* Bottom book */}
      <Box args={[1.8, 0.2, 2.5]} position={[0, -0.4, 0]}>
        <meshStandardMaterial 
          color="#6c4ed9" 
          roughness={0.5} 
          metalness={0.2}
        />
      </Box>
      
      {/* Middle book */}
      <Box args={[1.6, 0.2, 2.2]} position={[0.1, -0.1, 0]}>
        <meshStandardMaterial 
          color="#8046a5" 
          roughness={0.5} 
          metalness={0.2}
        />
      </Box>
      
      {/* Top book */}
      <Box args={[1.4, 0.2, 1.9]} position={[-0.1, 0.2, 0]}>
        <meshStandardMaterial 
          color="#4a1f6e" 
          roughness={0.5} 
          metalness={0.2}
        />
      </Box>
    </group>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    // Simulate loading state for animation purposes
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section with 3D Element */}
      <section className="relative h-screen flex flex-col overflow-hidden bg-gradient-to-b from-black to-purple-950">
        <div className="absolute inset-0 bg-grid-white/5 bg-pattern opacity-20 pointer-events-none" style={styles.bgPattern}></div>
        
        {/* Navbar */}
        <nav className="relative z-10 container mx-auto py-6 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white font-heading">EduNotes</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/subjects" className="text-white/80 hover:text-white transition font-body">
              Subjects
            </Link>
            <Link href="/notes" className="text-white/80 hover:text-white transition font-body">
              Notes
            </Link>
            <Link href="/videos" className="text-white/80 hover:text-white transition font-body">
              Videos
            </Link>
            <Link href="/community" className="text-white/80 hover:text-white transition font-body">
              Community
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-black border-white hover:bg-white/10 font-body">
              Login
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 font-body">
              Sign Up
            </Button>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-16 md:py-24 h-full relative z-10">
          <motion.div 
            className="w-full md:w-1/2 text-white space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-heading">
              <span className="block">Learn Engineering</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Like Never Before</span>
            </h1>
            <p className="text-xl text-white/80 max-w-md font-body">
              Access top-tier notes, important questions, and expert videos for all engineering subjects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 font-body">
                Explore Subjects <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10 font-body">
                View Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full md:w-1/2 h-[400px] md:h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Canvas className="w-full h-full" shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Suspense fallback={null}>
                <PresentationControls
                  global
                  zoom={0.8}
                  rotation={[0, -Math.PI / 4, 0]}
                  polar={[-Math.PI / 4, Math.PI / 4]}
                  azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                  <Float rotationIntensity={0.3}>
                    <Model scale={0.8} position={[0, -0.5, 0]} rotation={[0, -0.4, 0]} />
                  </Float>
                </PresentationControls>
                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.4} />
                <Environment preset="city" />
              </Suspense>
              <OrbitControls enableZoom={false} />
            </Canvas>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-2 bg-white rounded-full mt-2"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-purple-950 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text font-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Choose Our Platform?
            </motion.h2>
            <motion.p 
              className="text-white/80 max-w-2xl mx-auto text-lg font-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Everything you need to excel in your engineering courses, organized in one place.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              title="Topper Notes"
              description="Access comprehensive notes from top-performing students, organized by subject and topic."
              delay={0.1}
            />
            
            <FeatureCard 
              icon={<VideoIcon className="h-8 w-8 text-purple-500" />}
              title="Video Lectures"
              description="Watch high-quality video explanations for each topic from experienced educators."
              delay={0.2}
            />
            
            <FeatureCard 
              icon={<Download className="h-8 w-8 text-purple-500" />}
              title="Downloadable Content"
              description="Download notes and resources for offline study at your convenience."
              delay={0.3}
            />
            
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-purple-500" />}
              title="Community Support"
              description="Connect with other engineering students to solve problems together."
              delay={0.4}
            />
            
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-purple-500" />}
              title="Important Questions"
              description="Focus your study with curated important questions for each subject module."
              delay={0.5}
            />
            
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8 text-purple-500" />}
              title="Module-wise Learning"
              description="Structured learning path with progressive modules for each engineering subject."
              delay={0.6}
            />
          </div>
        </div>
      </section>
      
      {/* Subject Preview Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4 text-white font-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Explore Our <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Subjects</span>
            </motion.h2>
            <motion.p 
              className="text-white/80 max-w-2xl mx-auto text-lg font-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Comprehensive learning materials for core engineering disciplines.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Suspense fallback={<div className="h-64 flex justify-center items-center"><Loading message="Loading subjects..." /></div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 col-span-full">
                <SubjectCard 
                  title="Computer Science"
                  description="Algorithms, Data Structures, OS, DBMS, and more."
                  imageUrl="/subjects/computer-science.jpg"
                  modules={8}
                  notes={42}
                  delay={0.1}
                />
                
                <SubjectCard 
                  title="Electrical Engineering"
                  description="Circuit Theory, Power Systems, Control Systems, etc."
                  imageUrl="/subjects/electrical.jpg"
                  modules={7}
                  notes={36}
                  delay={0.2}
                />
                
                <SubjectCard 
                  title="Mechanical Engineering"
                  description="Thermodynamics, Fluid Mechanics, Machine Design, etc."
                  imageUrl="/subjects/mechanical.jpg"
                  modules={9}
                  notes={45}
                  delay={0.3}
                />
                
                <SubjectCard 
                  title="Civil Engineering"
                  description="Structural Analysis, Soil Mechanics, Transportation, etc."
                  imageUrl="/subjects/civil.jpg"
                  modules={6}
                  notes={32}
                  delay={0.4}
                />
              </div>
            </Suspense>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 font-body">
              View All Subjects <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-950 to-purple-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4 text-white font-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Students Say
            </motion.h2>
            <motion.p 
              className="text-white/80 max-w-2xl mx-auto text-lg font-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Hear from students who have transformed their learning experience with us.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The organized structure of notes and videos helped me understand complex topics easily. My grades have improved significantly!"
              name="Priya Singh"
              role="Computer Science, 3rd Year"
              imageUrl="/testimonials/student1.jpg"
              delay={0.1}
            />
            
            <TestimonialCard 
              quote="The community aspect is amazing. I got help with a challenging project from seniors who had already completed similar work."
              name="Rahul Sharma"
              role="Electrical Engineering, 4th Year"
              imageUrl="/testimonials/student2.jpg"
              delay={0.2}
            />
            
            <TestimonialCard 
              quote="Having access to toppers' notes gave me insights into effective study strategies. I'm now among the top performers in my class."
              name="Anjali Patel"
              role="Mechanical Engineering, 2nd Year"
              imageUrl="/testimonials/student3.jpg"
              delay={0.3}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-pattern opacity-20 pointer-events-none" style={styles.bgPattern}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6 text-white font-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to Transform Your Learning Experience?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 mb-8 font-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of engineering students who are already excelling with our platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="bg-white text-purple-950 hover:bg-white/90 font-body">
                Get Started for Free
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-black text-white/70">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
                <span className="text-lg font-bold text-white font-heading">EduNotes</span>
              </Link>
              <p className="max-w-xs font-body">
                Empowering engineering students with quality learning resources and community support.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4 font-heading">Subjects</h4>
                <ul className="space-y-2 font-body">
                  <li><Link href="#" className="hover:text-white transition">Computer Science</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Electrical</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Mechanical</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Civil</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4 font-heading">Resources</h4>
                <ul className="space-y-2 font-body">
                  <li><Link href="#" className="hover:text-white transition">Notes</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Videos</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Important Questions</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Community</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4 font-heading">Company</h4>
                <ul className="space-y-2 font-body">
                  <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4 font-heading">Legal</h4>
                <ul className="space-y-2 font-body">
                  <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-white transition">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="font-body">© 2023 EduNotes. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6 font-body">
              <Link href="#" className="hover:text-white transition">Twitter</Link>
              <Link href="#" className="hover:text-white transition">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition">Facebook</Link>
              <Link href="#" className="hover:text-white transition">Instagram</Link>
            </div>
          </div>
      </div>
      </footer>
      
      <Toaster />
    </main>
  );
}
