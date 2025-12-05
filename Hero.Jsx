import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Award, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const backgroundImages = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692dc2d0dbe7330379603fbe/bc69b8b73_stock-photo-marijuana-leaf-brown-color-background-decorate-for-ad-poster-template-print-artwork-2135601543.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692dc2d0dbe7330379603fbe/3ebbb6373_stock-photo-pattern-of-hemp-or-cannabis-leaves-isolate-on-white-background-top-view-flat-lay-close-up-of-1794469840.jpg",
  "https://images.unsplash.com/photo-1536357669570-c38fab5086a9?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603668484359-479951562df3?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615196677587-220c1d93140c?q=80&w=2670&auto=format&fit=crop"
];

const TransitionCircle = () => {
  return (
    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative w-[140px] h-[140px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px]"
      >
        {/* Center Content - Static */}
        <div className="absolute inset-0 bg-[#E8E5C8] rounded-full shadow-xl p-3 md:p-4 lg:p-5 z-10">
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-white text-center shadow-inner">
            <div className="px-2 py-1 w-full h-full flex flex-col items-center justify-center">
              <h3 className="font-serif font-bold text-[#1A1A1A] leading-tight mb-1 text-[14px] md:text-[16px] tracking-widest">
                ELEMENT
              </h3>
              <p className="font-sans text-[#1A1A1A] tracking-wider text-[8px] md:text-[10px] uppercase">
                Pure Quality
              </p>
            </div>
          </div>
        </div>

        {/* Rotating Text Ring */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <path id="textPath" d="M 50, 50 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" fill="transparent" />
            <text fill="#1A1A1A" style={{ textTransform: 'uppercase', fontSize: '7px', fontWeight: 500, letterSpacing: '2px' }}>
              <textPath href="#textPath" textLength="260" lengthAdjust="spacingAndGlyphs">
                * QUALITY * PURITY * NATURE * QUALITY * PURITY * NATURE
              </textPath>
            </text>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
                                src={backgroundImages[currentSlide]} 
                                alt="Hero Background" 
                                className="w-full h-full object-cover object-center opacity-80"
                                loading="eager"
                                decoding="async"
                              />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20">
          <div className="w-full max-w-6xl">
            <div className="text-white space-y-6 sm:space-y-8">
              
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center space-x-2 bg-[#4C8E5A]/20 backdrop-blur-md px-4 py-2 rounded-full border border-[#4C8E5A]/30 mb-6">
                  <span className="w-2 h-2 bg-[#4C8E5A] rounded-full animate-pulse shadow-[0_0_10px_#4C8E5A]"></span>
                  <span className="text-[#C8FFE0] text-sm font-medium tracking-wider uppercase">Licensed Retailer • Age 19+ Required</span>
                </div>

                <h1 className="font-serif font-medium leading-[1.1] text-white text-[clamp(2.5rem,7vw,5rem)]">
                  Premium Cannabis<br />
                  <span className="block text-[#C8FFE0] mt-4 text-[0.85em]">
                    Delivered in Hamilton, ON
                  </span>
                </h1>
              </motion.div>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-100 text-[clamp(1.125rem,4vw,1.5rem)] font-light leading-relaxed max-w-3xl"
              >
                Shop trusted, lab-tested products from Hamilton’s most reliable online cannabis store. Fast delivery and premium selection.
              </motion.p>

              {/* Stats Row */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4 sm:gap-8 pt-2 sm:pt-4"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#C8FFE0]" />
                  <span className="text-sm font-medium text-white/90">1000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#C8FFE0]" />
                  <span className="text-sm font-medium text-white/90">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#C8FFE0]" />
                  <span className="text-sm font-medium text-white/90">Hamilton Based</span>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6"
              >
                <Link to={createPageUrl('ProductList')}>
                  <Button 
                    className="h-16 px-10 rounded-full text-lg bg-gradient-to-r from-[#2F5D3A] to-[#4C8E5A] hover:from-[#4C8E5A] hover:to-[#2F5D3A] text-white shadow-lg hover:shadow-[#4C8E5A]/30 transition-all hover:scale-105 group"
                  >
                    <span className="tracking-wide font-semibold mr-2">BROWSE PRODUCTS</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline"
                  className="h-16 px-10 rounded-full text-lg border-2 border-white/30 text-white hover:bg-white hover:text-[#1A1A1A] bg-white/5 backdrop-blur-sm transition-all"
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Promo Box */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 max-w-md border border-white/10 mt-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#C8FFE0]" />
                  <span className="text-[#C8FFE0] font-medium text-xs tracking-wider uppercase">Same Day Delivery</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Order before 4PM for same-day delivery in Hamilton and surrounding areas.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Transition Circle - Placed relatively to the hero container but visually overlapping */}
      <TransitionCircle />
    </div>
  );
}