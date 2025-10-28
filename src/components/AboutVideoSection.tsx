'use client';

import { useState, useRef, useEffect } from 'react';

export default function AboutVideoSection() {
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
    <section id="about" className="relative h-[80vh] w-full overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        loop
        poster="/video/about-poster.jpg"
      >
        <source src="/video/about-bg.webm" type="video/webm" />
        <source src="/video/about-bg.mp4" type="video/mp4" />
      </video>

      {/* Fallback background if video doesn't load */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-black to-gray-900">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-yellow-600/6 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Dark overlay with orange accent */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 via-transparent to-orange-900/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-400">
            Our Story
          </h2>
          <div className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            <p className="mb-4">
              At Nomad Stop, we bring the authentic flavors of Afghanistan to your table. 
              Our family recipes have been passed down through generations, preserving 
              the rich culinary traditions of our homeland.
            </p>
            <p>
              From our signature Kabuli Pilau to our sizzling Karahi dishes, every meal 
              is prepared with love, care, and the finest ingredients. We&apos;re proud to 
              serve our community with halal-certified food that brings people together.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
