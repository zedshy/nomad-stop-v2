'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  
  // Calculate total item count (sum of all quantities)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          <Link href="/" className="text-2xl font-bold text-amber-500" onClick={closeMobileMenu} style={{color: '#FFE033'}}>
            Nomad Stop
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-amber-400 transition-colors"
              style={{'--tw-text-opacity': '1'} as React.CSSProperties}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-white hover:text-amber-400 transition-colors"
              style={{'--tw-text-opacity': '1'} as React.CSSProperties}
            >
              Menu
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="outline" size="sm" className="bg-amber-600 hover:bg-amber-700 text-black font-semibold border-amber-600 hover:border-amber-700" style={{backgroundColor: '#FFD500', borderColor: '#FFD500'}}>
                Cart
              </Button>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-white text-amber-600 border-amber-600 font-bold min-w-[20px] h-5 flex items-center justify-center px-1.5" style={{color: '#FFD500', borderColor: '#FFD500'}}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600 hover:border-amber-700" style={{backgroundColor: '#FFD500', borderColor: '#FFD500'}}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md shadow-lg border-t border-gray-700 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-white hover:text-amber-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  href="/menu"
                  className="text-white hover:text-amber-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Menu
                </Link>
                <Link href="/cart" onClick={closeMobileMenu} className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold border-amber-600 hover:border-amber-700" style={{backgroundColor: '#FFD500', borderColor: '#FFD500'}}
                  >
                    Cart
                  </Button>
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-white text-amber-600 border-amber-600 font-bold min-w-[20px] h-5 flex items-center justify-center px-1.5" style={{color: '#FFD500', borderColor: '#FFD500'}}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
