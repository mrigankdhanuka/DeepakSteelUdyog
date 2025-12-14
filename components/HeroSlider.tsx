import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2600&auto=format&fit=crop',
    title: 'Deepak Steel Udyog',
    subtitle: 'Premium heavy-duty iron furniture designed for generations. Jo aaj kharide, kal ki pehchaan bane.',
    ctaText: 'View Collection',
    ctaLink: '/shop',
    align: 'center'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=2600&auto=format&fit=crop',
    title: 'Secure Your World',
    subtitle: 'Industrial-grade steel almirahs and lockers for ultimate security and royal aesthetics.',
    ctaText: 'Explore Storage',
    ctaLink: '/shop',
    align: 'left'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1505693416388-b0346efee535?q=80&w=2600&auto=format&fit=crop',
    title: 'Strength You Can Trust',
    subtitle: 'Minimalist metal bed frames and racks that define your space. Eco-friendly and durable.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    align: 'right'
  }
];

export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const length = SLIDES.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(nextSlide, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, isPaused]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextSlide(); // Swipe Left
    if (touchStart - touchEnd < -75) prevSlide(); // Swipe Right
  };

  return (
    <div 
      className="relative w-full h-[55vh] md:h-[70vh] lg:h-[85vh] overflow-hidden bg-gray-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          
          {/* Dark Overlay - Blue Tinted */}
          <div className="absolute inset-0 bg-blue-900/30 md:bg-blue-900/20 bg-gradient-to-t from-gray-900 via-transparent to-blue-900/30" />

          {/* Content */}
          <div className={`absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto
            ${slide.align === 'center' ? 'items-center text-center' : ''}
            ${slide.align === 'left' ? 'items-start text-left' : ''}
            ${slide.align === 'right' ? 'items-end text-right' : ''}
          `}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg max-w-4xl transform transition-transform duration-700 translate-y-0 animate-in fade-in slide-in-from-bottom-4">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-8 max-w-2xl font-light drop-shadow-md">
              {slide.subtitle}
            </p>
            
            <Link
              to={slide.ctaLink}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-lg font-bold rounded-lg uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl shadow-blue-900/50 flex items-center gap-2"
            >
              {slide.ctaText} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
              idx === current ? 'bg-blue-500 w-8' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};