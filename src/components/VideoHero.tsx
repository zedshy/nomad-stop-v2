'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

export default function VideoHero() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        setIsVideoLoaded(true);
        video.play().catch((error) => {
          console.log('Video autoplay prevented:', error);
        });
      };

      video.addEventListener('loadeddata', handleLoadedData);
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, []);

  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-black">
      {/* Video Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          loop
          controls={false}
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Fallback background if video doesn't load */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Dark overlay gradient with yellow accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 via-transparent to-yellow-900/20" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Authentic Afghan Flavours,
            <br />
            <span className="text-yellow-400">Served Till Late</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Order direct, save more, taste more.
          </p>
          <Link href="/menu">
            <Button
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              View Menu
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator with smooth scroll functionality */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => {
            document.querySelector('#popular-dishes')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }}
          className="animate-bounce hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Scroll to popular dishes"
        >
          <svg
            className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
