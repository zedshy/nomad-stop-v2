'use client';

import Image from 'next/image';

export default function AboutVideoSection() {
  return (
    <section id="about" className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden bg-black pt-20 md:pt-24">
      {/* Image Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src="/about-image.png"
          alt="Nomad Stop - Our Story"
          fill
          priority
          className="object-cover"
          quality={90}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-amber-400" style={{color: '#FFE033'}}>
            Our Story
          </h2>
          <div className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
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
