import Image from 'next/image';
import AboutVideoSection from '@/components/AboutVideoSection';
import { config } from '@/lib/config';

export default function AboutPage() {
  return (
    <main>
      <AboutVideoSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Story
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                Welcome to Nomad Stop, where authentic Afghan cuisine meets modern convenience. 
                Our journey began with a simple mission: to share the rich, flavorful traditions 
                of Afghanistan with our community in Staines-upon-Thames.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Every dish we serve tells a story of our heritage. From our signature Kabuli Pilau, 
                prepared with tender lamb shank and aromatic spices, to our sizzling Karahi dishes 
                that bring the warmth of Afghan hospitality to your table.
              </p>
              
              <p className="text-lg leading-relaxed mb-8">
                We&apos;re proud to be halal-certified, ensuring that every ingredient meets the highest 
                standards of quality and authenticity. Our commitment to fresh, locally-sourced 
                ingredients means you can taste the difference in every bite.
              </p>
            </div>

            {/* Hygiene & Halal Notice */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quality & Standards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">✓ Halal Certified</h4>
                  <p className="text-gray-700 text-sm">
                    All our meat and ingredients are halal-certified, ensuring compliance 
                    with Islamic dietary requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">🍽️ Food Hygiene</h4>
                  <p className="text-gray-700 text-sm">
                    We maintain the highest standards of food safety and hygiene, 
                    with regular inspections and staff training.
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Behind the Scenes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src="/img/sections/banner-charcoal-grill.jpg"
                    alt="Charcoal grill preparation"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src="/img/sections/banner-night-market.jpg"
                    alt="Night market atmosphere"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src="/img/menu/dish-kabuli-pilau.jpg"
                    alt="Kabuli Pilau preparation"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src="/img/menu/dish-lamb-karahi.jpg"
                    alt="Lamb Karahi cooking"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Visit Us
              </h3>
              <p className="text-lg text-gray-700 mb-2">
                {config.restaurant.address}
              </p>
              <p className="text-gray-600">
                Open daily {config.hours.open} - {config.hours.close}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
