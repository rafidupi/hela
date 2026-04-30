'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled 
          ? "top-4 h-[64px]" 
          : "top-6 md:top-8 h-[76px]"
      }`}
    >
      <div 
        className={`w-full h-full flex items-center justify-between px-6 md:px-8 rounded-full border border-white/40 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled 
            ? "bg-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]" 
            : "bg-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* Left: Brand */}
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl tracking-[0.08em] text-neutral-900">
            hela<span className="text-[#B7FF00]">.</span>
          </span>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {['Solución', 'Industrias', 'Tecnología', 'Recursos', 'Contacto'].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-[13px] font-medium text-neutral-600 hover:text-neutral-950 transition-colors duration-300"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Right: CTA & Mobile Menu */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3000/login"
            className="hidden sm:inline-flex items-center justify-center bg-[#B7FF00] hover:bg-[#a3e600] text-neutral-950 text-[11px] font-bold uppercase tracking-wider px-6 h-[42px] rounded-full transition-colors duration-300"
          >
            Iniciar sesión
          </a>
          
          {/* Mobile Hamburger Placeholder */}
          <button className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none">
            <span className="w-5 h-[1.5px] bg-neutral-800 rounded-full" />
            <span className="w-5 h-[1.5px] bg-neutral-800 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
