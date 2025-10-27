import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nomad Stop - Authentic Afghan Cuisine',
  description: 'Experience authentic Afghan flavors at Nomad Stop. Open daily 12:00-04:00. Halal certified. Order direct and save more.',
  keywords: 'Afghan food, halal restaurant, Staines, TW18, Kabuli Pilau, Karahi, Doner, Pizza',
  authors: [{ name: 'Nomad Stop' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Nomad Stop - Authentic Afghan Cuisine',
    description: 'Experience authentic Afghan flavors at Nomad Stop. Open daily 12:00-04:00. Halal certified.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'Nomad Stop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nomad Stop - Authentic Afghan Cuisine',
    description: 'Experience authentic Afghan flavors at Nomad Stop. Open daily 12:00-04:00. Halal certified.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Nomad Stop',
              description: 'Authentic Afghan cuisine served till late',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '133 High Street',
                addressLocality: 'Staines-upon-Thames',
                postalCode: 'TW18 4PD',
                addressCountry: 'GB',
              },
              telephone: '+44-XXXX-XXXXXX',
              openingHours: [
                'Mo 12:00-04:00',
                'Tu 12:00-04:00',
                'We 12:00-04:00',
                'Th 12:00-04:00',
                'Fr 12:00-04:00',
                'Sa 12:00-04:00',
                'Su 12:00-04:00',
              ],
              servesCuisine: 'Afghan',
              priceRange: '££',
              acceptsReservations: false,
              hasMenu: true,
              url: 'https://nomadstop.com',
              sameAs: [
                'https://instagram.com/nomadstop',
                'https://facebook.com/nomadstop',
                'https://tiktok.com/@nomadstop',
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}