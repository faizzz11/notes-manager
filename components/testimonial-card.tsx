"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, User } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  imageUrl: string;
  delay?: number;
}

export const TestimonialCard: FC<TestimonialCardProps> = ({ 
  quote, 
  name, 
  role, 
  imageUrl,
  delay = 0 
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
        <CardContent className="p-0 space-y-4">
          <Quote className="h-8 w-8 text-purple-400 opacity-70" />
          <p className="text-white/80 italic">{quote}</p>
          <div className="flex items-center gap-3 pt-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-purple-800">
              {!imageError ? (
                <Image 
                  src={imageUrl} 
                  alt={name}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEhQJ/jX5OgAAAAABJRU5ErkJggg=="
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white opacity-70" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-white">{name}</h4>
              <p className="text-sm text-white/60">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 