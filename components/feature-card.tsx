"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
        <CardContent className="p-0 space-y-4">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-950 bg-opacity-50">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-white/70">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
} 