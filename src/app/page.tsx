import VideoHero from '@/components/VideoHero';
import PopularProducts from '@/components/PopularProducts';
import AboutVideoSection from '@/components/AboutVideoSection';
import HoursMap from '@/components/HoursMap';

export default function HomePage() {
  return (
    <main className="smooth-scroll">
      <VideoHero />
      <PopularProducts />
      <AboutVideoSection />
      <HoursMap />
    </main>
  );
}