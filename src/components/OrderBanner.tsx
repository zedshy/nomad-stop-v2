'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';

export default function OrderBanner() {
  return (
    <section id="order" className="bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Order Now
          </h2>
          <p className="text-gray-300 mb-6">
            Open daily {config.hours.open}–{config.hours.close}
          </p>
          
          {/* Delivery Platform Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
              disabled
              title="Link coming soon"
            >
              Order on Deliveroo
            </Button>
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3"
              disabled
              title="Link coming soon"
            >
              Order on Uber Eats
            </Button>
          </div>

          {/* Direct Order CTA */}
          <div className="mb-4">
            <Button
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"
            >
              Order Direct (Save More!)
            </Button>
          </div>

          {/* Halal Badge */}
          {config.restaurant.halal && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-green-600 text-white">
                ✓ Halal Certified
              </Badge>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
