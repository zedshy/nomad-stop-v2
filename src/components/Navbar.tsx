'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-yellow-600" onClick={closeMobileMenu}>
            Nomad Stop
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Menu
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700">
                Cart
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg border-t border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-white hover:text-yellow-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  href="/menu"
                  className="text-white hover:text-yellow-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Menu
                </Link>
                <Link href="/cart" onClick={closeMobileMenu}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700"
                  >
                    Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
