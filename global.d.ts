declare module 'framer-motion';
declare module 'lucide-react';

// Fix for JSX errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 