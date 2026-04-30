'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const helmetRef = useRef<HTMLImageElement>(null);
  const uiOverlaysRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(() => {
    // Total duration is 100 for easy percentage mapping matching the requirements
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrub effect
      },
    });

    // Stage 1 (0 to 15): Holds initial state (Video + Text).
    // Text fades out cleanly. Video darkens slightly to put focus on the product reveal without losing crispness.
    tl.to(textRef.current, { opacity: 0, y: -20, duration: 15, ease: "power1.inOut" }, 15);
    tl.to(videoOverlayRef.current, { backgroundColor: 'rgba(0,0,0,0.25)', duration: 20, ease: "none" }, 15);
    tl.to(videoRef.current, { filter: 'brightness(0.7) contrast(0.9) saturate(0.9)', duration: 20, ease: "power2.out" }, 15);
    
    // Stage 2 (20 to 45): Reveal Helmet making it a focal element, not a background replacement.
    tl.fromTo(helmetRef.current, 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 25, ease: "power2.out" }, 
      20
    );

    // Stage 3 (50 to 65): Reveal green interface overlays ONLY after helmet is heavily visible.
    tl.to(uiOverlaysRef.current, { opacity: 1, duration: 15, ease: "power1.inOut" }, 50);

    // Stage 4 (65 to 100): Overlays connect and pull slightly inward towards the helmet.
    tl.to('.ui-node-left', { x: 30, duration: 35, ease: "power1.out" }, 65);
    tl.to('.ui-node-right', { x: -30, duration: 35, ease: "power1.out" }, 65);
    tl.to('.ui-node-top', { y: 20, duration: 35, ease: "power1.out" }, 65);
    tl.to('.ui-node-bottom', { y: -20, duration: 35, ease: "power1.out" }, 65);
    
    // Give helmet a subtle continuous focal presence expanding slightly
    tl.to(helmetRef.current, { scale: 1.05, duration: 35, ease: "none" }, 65);

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-black">
      {/* Sticky Inner Container pinned at viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        
        {/* Layers (1 to 5) */}

        {/* 1. Background Mining Video */}
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 scale-110 transform-gpu md:scale-[1.15]"
          style={{ filter: 'brightness(1) contrast(1) saturate(1)' }}
        >
          <source src="/hero/mining-hero.mp4" type="video/mp4" />
        </video>

        {/* 2. Video Dark Overlay for Text Readability */}
        <div 
          ref={videoOverlayRef}
          className="absolute inset-0 w-full h-full bg-black/20 z-10 transition-colors"
        />

        {/* 3. Green Interface Overlays (Minimal, industrial tracking points) - Must sit OVER the helmet */}
        <div ref={uiOverlaysRef} className="absolute inset-0 z-30 opacity-0 pointer-events-none">
          
          {/* --- BACKGROUND ENVIRONMENT TRACKING (Faint) --- */}
          <div className="absolute top-[35%] left-[10%] md:left-[15%] opacity-50 flex flex-col items-start gap-1 ui-node-left">
            <div className="w-6 h-6 md:w-10 md:h-10 border-[1.5px] border-[#B7FF00]/30 rounded-sm flex items-center justify-center">
               <div className="w-1 h-1 bg-[#B7FF00]/60" />
            </div>
            <div className="text-[#B7FF00] font-mono text-[9px] md:text-[10px] uppercase tracking-widest pl-1 mt-1 opacity-80">Zona supervisada</div>
          </div>
          
          <div className="absolute top-[42%] right-[10%] md:right-[15%] opacity-50 flex flex-col items-end gap-1 ui-node-right">
            <div className="w-8 h-4 md:w-10 md:h-5 border-t-[1.5px] border-r-[1.5px] border-[#B7FF00]/30" />
            <div className="text-[#B7FF00] font-mono text-[9px] md:text-[10px] uppercase tracking-widest pr-1 opacity-80">Equipo en terreno</div>
          </div>

          <div className="absolute bottom-[20%] left-[15%] md:left-[20%] opacity-50 ui-node-bottom">
            <div className="w-2 h-2 rounded-full bg-[#B7FF00]/60" />
            <div className="w-[1.5px] h-10 bg-[#B7FF00]/30 absolute left-[3px] top-full" />
            <div className="text-[#B7FF00] font-mono text-[9px] md:text-[10px] uppercase tracking-widest mt-1 ml-4 whitespace-nowrap opacity-80">Monitoreo activo</div>
          </div>

          {/* --- HELMET PRIMARY NODES (Sharp & Focused) --- */}
          
          {/* Top Node (Visor Area) */}
          <div className="absolute top-[28%] left-[48%] md:left-[51%] flex flex-col items-center ui-node-top">
            <div className="text-[#B7FF00] font-mono text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-2 whitespace-nowrap drop-shadow-[0_0_8px_rgba(183,255,0,0.4)]">Nodo conectado</div>
            <div className="w-[1.5px] h-12 md:h-16 bg-gradient-to-b from-[#B7FF00]/90 to-transparent" />
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#B7FF00] mt-1.5 relative flex justify-center items-center">
              <div className="w-1 h-1 bg-[#B7FF00] rounded-full animate-ping opacity-100" />
            </div>
          </div>

          {/* Camera Module Node (Right side of helmet) */}
          <div className="absolute top-[45%] right-[20%] md:right-[32%] flex items-center gap-3 ui-node-right">
            <div className="w-4 h-4 md:w-5 md:h-5 border-[1.5px] border-[#B7FF00] rounded flex justify-center items-center relative">
              {/* Corner precise crosshairs */}
              <div className="absolute w-[18px] md:w-[24px] h-[1.5px] bg-[#B7FF00]/70 pointer-events-none" />
              <div className="absolute h-[18px] md:h-[24px] w-[1.5px] bg-[#B7FF00]/70 pointer-events-none" />
            </div>
            <div className="w-10 md:w-20 h-[1.5px] bg-[#B7FF00]/70" />
            <div className="text-[#B7FF00] font-mono text-[11px] md:text-sm font-semibold uppercase tracking-widest flex flex-col drop-shadow-[0_0_8px_rgba(183,255,0,0.4)]">
               <span className="opacity-100">Cámara activa</span>
               <span className="text-[9px] md:text-[10px] opacity-80 mt-0.5">Transmisión en vivo</span>
            </div>
          </div>

          {/* Side Module Node (Left side of helmet) */}
          <div className="absolute top-[52%] left-[25%] md:left-[35%] flex items-center gap-3 flex-row-reverse ui-node-left">
            <div className="w-3.5 h-3.5 md:w-5 md:h-5 border-[1.5px] border-[#B7FF00] rounded-full flex justify-center items-center">
              <div className="w-1.5 h-1.5 bg-[#B7FF00] rounded-full" />
            </div>
            <div className="w-10 md:w-16 h-[1.5px] bg-[#B7FF00]/70" />
            <div className="text-[#B7FF00] font-mono text-[11px] md:text-sm font-semibold uppercase tracking-widest text-right drop-shadow-[0_0_8px_rgba(183,255,0,0.4)]">
               Operación activa
               <div className="text-[9px] md:text-[10px] opacity-80 mt-1">Sensor nominal</div>
            </div>
          </div>

          {/* Small structural brackets loosely framing the helmet bounds */}
          <div className="absolute top-[20%] left-[22%] md:left-[30%] w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-[#B7FF00]/40 ui-node-top ui-node-left opacity-70" />
          <div className="absolute top-[20%] right-[22%] md:right-[30%] w-4 h-4 border-t-[1.5px] border-r-[1.5px] border-[#B7FF00]/40 ui-node-top ui-node-right opacity-70" />
          <div className="absolute bottom-[28%] left-[22%] md:left-[30%] w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-[#B7FF00]/40 ui-node-bottom ui-node-left opacity-70" />
          <div className="absolute bottom-[28%] right-[22%] md:right-[30%] w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-[#B7FF00]/40 ui-node-bottom ui-node-right opacity-70" />
          
          {/* Loose floating tracking points */}
          <div className="absolute top-[60%] right-[35%] w-1 h-1 bg-[#B7FF00]/60 rounded-full ui-node-bottom ui-node-right" />
          <div className="absolute top-[38%] left-[32%] w-1.5 h-1.5 bg-[#B7FF00]/40 rounded-full flex justify-center items-center ui-node-top ui-node-left">
             <div className="w-0.5 h-0.5 bg-[#B7FF00] rounded-full opacity-80" />
          </div>
          
        </div>

        {/* 4. Helmet Render Image - Sharp distinct foreground focal element */}
        <img 
          ref={helmetRef}
          src="/hero/hela-helmet-render.png" 
          alt="HELA Smart Helmet"
          className="absolute inset-0 m-auto z-20 opacity-0 object-contain w-[90vw] md:w-[75vw] lg:w-[60vw] max-h-[85vh]"
        />

        {/* 5. Centered Text Content */}
        <div 
          ref={textRef} 
          className="relative z-40 flex flex-col items-center justify-center text-center px-6 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 drop-shadow-xl" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)"}}>
            Visibilidad total en terreno
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-light mb-10 max-w-2xl drop-shadow-md">
            Supervisa, comunica y actúa en tiempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
            <button className="w-full sm:w-auto bg-[#B7FF00] text-black font-semibold text-sm md:text-base px-8 py-3.5 rounded-full uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-300 focus:ring-4 focus:ring-[#B7FF00]/50 outline-none shadow-[0_0_15px_rgba(183,255,0,0.2)]">
              Solicitar demo
            </button>
            <button className="w-full sm:w-auto bg-transparent border-[1.5px] border-white/80 text-white font-medium text-sm md:text-base px-8 py-3.5 rounded-full uppercase tracking-wide hover:bg-white/10 hover:border-white transition-all duration-300 focus:ring-4 focus:ring-white/30 outline-none">
              Ver cómo funciona
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
