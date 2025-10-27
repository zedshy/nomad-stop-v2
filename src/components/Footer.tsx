import { config } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Nomad Stop</h3>
            <p className="text-gray-300 mb-2">{config.restaurant.address}</p>
            <p className="text-gray-300">
              Open daily {config.hours.open}–{config.hours.close}
            </p>
            {config.restaurant.halal && (
              <div className="mt-2">
                <span className="inline-block bg-green-600 text-white px-2 py-1 rounded text-sm">
                  ✓ Halal Certified
                </span>
              </div>
            )}
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <div className="space-y-1 text-gray-300">
              <p>Monday: {config.hours.open} - {config.hours.close}</p>
              <p>Tuesday: {config.hours.open} - {config.hours.close}</p>
              <p>Wednesday: {config.hours.open} - {config.hours.close}</p>
              <p>Thursday: {config.hours.open} - {config.hours.close}</p>
              <p>Friday: {config.hours.open} - {config.hours.close}</p>
              <p>Saturday: {config.hours.open} - {config.hours.close}</p>
              <p>Sunday: {config.hours.open} - {config.hours.close}</p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2">
              <p className="text-gray-300">Instagram: @nomadstop</p>
              <p className="text-gray-300">Facebook: Nomad Stop</p>
              <p className="text-gray-300">TikTok: @nomadstop</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Nomad Stop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
