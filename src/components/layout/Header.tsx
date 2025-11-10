// File: Header.tsx
// Path: /src/components/layout/Header.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import SearchModal from '@/components/common/SearchModal';

export default function Header() {
  const { theme } = useTheme();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = false; // TODO: Replace with actual auth state

  return (
    <>
      <header className={`sticky top-0 z-50 h-16 border-b ${
        theme === 'dark' 
          ? 'bg-[#1a1a1a] border-[#2a2a2a]' 
          : 'bg-white border-[#e0e0e0]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Producers Avenue" 
              className="h-10"
            />
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <NavDropdown title="Community" theme={theme}>
              <Link href="/community">Browse Members</Link>
              <Link href="/groups">Groups</Link>
              <Link href="/feed">Feed</Link>
            </NavDropdown>

            <NavDropdown title="Marketplace" theme={theme}>
              <Link href="/marketplace">Browse All</Link>
              <Link href="/products">Products</Link>
              <Link href="/services">Services</Link>
            </NavDropdown>

            <Link 
              href="/tools" 
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}
            >
              Tools
            </Link>
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button 
              onClick={() => setSearchModalOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link 
              href="/cart"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link 
              href="/wishlist"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle variant="icon" />

            {/* Avatar Dropdown */}
            <AvatarDropdown theme={theme} isLoggedIn={isLoggedIn} />

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden absolute top-16 left-0 right-0 border-b shadow-lg ${
            theme === 'dark'
              ? 'bg-[#1a1a1a] border-[#2a2a2a]'
              : 'bg-white border-[#e0e0e0]'
          }`}>
            <nav className="p-4 space-y-2">
              <Link href="/community" className={`block px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Community
              </Link>
              <Link href="/marketplace" className={`block px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Marketplace
              </Link>
              <Link href="/tools" className={`block px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Tools
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}

// Navigation Dropdown
function NavDropdown({ title, children, theme }: { title: string; children: React.ReactNode; theme: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
          : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
      }`}>
        {title}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-48 rounded-lg border shadow-lg py-2 ${
          theme === 'dark'
            ? 'bg-[#1a1a1a] border-[#2a2a2a]'
            : 'bg-white border-[#e0e0e0]'
        }`}>
          {React.Children.map(children, (child) => (
            <div className={`px-3 py-2 transition-colors ${
              theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
            }`}>
              {child}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Avatar Dropdown
function AvatarDropdown({ theme, isLoggedIn }: { theme: string; isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={`p-1 rounded-full transition-colors ${
        theme === 'dark'
          ? 'hover:bg-[#2a2a2a]'
          : 'hover:bg-[#f5f5f5]'
      }`}>
        <div className="w-8 h-8 rounded-full bg-[#009ae9] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute top-full right-0 mt-1 w-48 rounded-lg border shadow-lg py-2 ${
          theme === 'dark'
            ? 'bg-[#1a1a1a] border-[#2a2a2a]'
            : 'bg-white border-[#e0e0e0]'
        }`}>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className={`block px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Profile
              </Link>
              <Link href="/dashboard" className={`block px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Dashboard
              </Link>
              <Link href="/settings" className={`block px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Settings
              </Link>
              <hr className={`my-2 ${theme === 'dark' ? 'border-[#2a2a2a]' : 'border-[#e0e0e0]'}`} />
              <button className={`w-full text-left px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                  : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
              }`}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={`block px-4 py-2 transition-colors ${
              theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-[#f5f5f5]'
                : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
            }`}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}