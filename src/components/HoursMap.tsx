import { config } from '@/lib/config';

export default function HoursMap() {
  return (
    <section id="hours-location" className="py-16 bg-gray-900 pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Hours Table */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Opening Hours</h2>
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                    <span className="font-medium text-white">{day}</span>
                    <span className="text-amber-600 font-semibold">
                      {config.hours.open} - {config.hours.close}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-900/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Note:</strong> We&apos;re open late every day! Perfect for late-night cravings.
                </p>
              </div>
            </div>
          </div>

              {/* Location Info */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Find Us</h2>
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="font-semibold text-white mb-4 text-xl">Nomad Stop</h3>
                  <p className="text-gray-300 mb-4 text-lg">{config.restaurant.address}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(config.restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
        </div>
      </div>
    </section>
  );
}
