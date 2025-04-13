"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Download, Volume2, VolumeX, Maximize, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface MediaViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
  fileType: "image" | "video";
}

export function MediaViewer({ isOpen, onOpenChange, url, fileName, fileType }: MediaViewerProps) {
  const [rawUrl, setRawUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);

  useEffect(() => {
    if (isOpen && url) {
      fetchMediaUrl();
    } else {
      // Reset state when dialog closes
      setRawUrl("");
      setIsLoading(true);
      setError(null);
      setImgLoaded(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [isOpen, url]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [isOpen, rawUrl]);

  const fetchMediaUrl = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // More robust URL transformation logic
      let rawUrl = '';
      
      if (url.includes('github.com')) {
        // For GitHub URLs
        rawUrl = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      } else if (url.includes('githubusercontent.com')) {
        // If the URL is already a raw URL
        rawUrl = url;
      } else {
        // For other URLs, use as is
        rawUrl = url;
      }
      
      console.log(`Fetching ${fileType} from:`, rawUrl);
      
      // Our server-side proxy
      const serverProxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      
      // External CORS proxy as fallback
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
      
      // Try direct access first with a head request
      let accessMethod = 'serverProxy'; // Default to server proxy as it's most reliable
      
      // Test if direct access works
      try {
        const directResponse = await fetch(rawUrl, { 
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (directResponse.ok) {
          console.log('Direct access succeeded');
          accessMethod = 'direct';
        } else {
          console.log('Direct access failed, will use server proxy');
        }
      } catch (e) {
        console.log('Direct access threw error, will use server proxy:', e);
      }
      
      // Test server proxy if needed
      if (accessMethod === 'serverProxy') {
        try {
          const proxyResponse = await fetch(serverProxyUrl, { method: 'HEAD' });
          if (!proxyResponse.ok) {
            console.log('Server proxy failed, will use external CORS proxy');
            accessMethod = 'corsProxy';
          }
        } catch (e) {
          console.log('Server proxy threw error, will use external CORS proxy:', e);
          accessMethod = 'corsProxy';
        }
      }
      
      // Set the URL we'll use for display based on the access method that worked
      switch (accessMethod) {
        case 'direct':
          setRawUrl(rawUrl);
          break;
        case 'serverProxy':
          setRawUrl(serverProxyUrl);
          break;
        case 'corsProxy':
          setRawUrl(corsProxyUrl);
          break;
      }
      
      // Wait a moment to ensure the URL is set before we try to load the media
      setTimeout(() => setIsLoading(false), 100);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError(`Failed to load ${fileType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newValue: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = newValue[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (newValue: number[]) => {
    if (!videoRef.current) return;
    
    const newTime = newValue[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    
    const newTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    videoRef.current.currentTime = newTime;
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
  };

  const enterFullscreen = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${fileType === 'image' ? 'max-w-5xl' : 'max-w-6xl'} max-h-[90vh] w-[90vw] overflow-hidden`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="truncate max-w-lg">{fileName}</DialogTitle>
          <Button variant="outline" size="sm" asChild>
            <a href={rawUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </DialogHeader>
        
        <div className={`mt-4 ${fileType === 'image' ? 'flex justify-center items-center' : 'relative'}`}>
          {isLoading ? (
            <div className="h-[60vh] flex justify-center items-center">
              <Loading message={`Loading ${fileType}...`} />
            </div>
          ) : error ? (
            <div className="h-[60vh] flex flex-col justify-center items-center text-destructive">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {fileType === "image" ? (
                <div className="relative max-h-[70vh] flex items-center justify-center">
                  {!imgLoaded && <Loading message="Loading image..." />}
                  <img 
                    src={rawUrl} 
                    alt={fileName}
                    className={`max-w-full max-h-[70vh] object-contain rounded-md ${imgLoaded ? 'block' : 'hidden'}`}
                    onLoad={() => setImgLoaded(true)}
                  />
                </div>
              ) : (
                <div className="w-full">
                  <video
                    ref={videoRef}
                    src={rawUrl}
                    className="max-w-full max-h-[65vh] mx-auto rounded-md"
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  <div className="mt-2 space-y-2 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-12">
                        {formatTime(currentTime)}
                      </span>
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {formatTime(duration)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.01}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={skipBackward}>
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={togglePlayPause}>
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={skipForward}>
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="icon" onClick={enterFullscreen}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 