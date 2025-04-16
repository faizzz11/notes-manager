"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";

interface SubjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  modules: number;
  notes: number;
  delay?: number;
}

export const SubjectCard: FC<SubjectCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  modules, 
  notes,
  delay = 0 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate a gradient background as fallback
  const generateGradient = () => {
    // Create a deterministic hash from the title
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate colors based on the hash
    const hue1 = hash % 360;
    const hue2 = (hash * 1.5) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 35%), hsl(${hue2}, 70%, 25%))`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={`/subjects/${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <Card className="overflow-hidden h-full border-0 bg-white/5 hover:bg-white/10 transition-all">
          <div className="relative h-40">
            {!imageError ? (
              <Image 
                src={imageUrl} 
                alt={title}
                fill
                className="object-cover opacity-60"
                sizes="100vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div 
                className="w-full h-full" 
                style={{ background: generateGradient() }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-white font-bold text-lg z-10">
              {title}
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-white/70 text-sm mb-4">{description}</p>
            <div className="flex justify-between text-sm text-white/60">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{modules} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{notes} notes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}; 