'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ClaritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const dataColumnRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── Main staged timeline — fires as soon as section enters viewport ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        toggleActions: 'play none none none',
      },
    });

    // Stage 1: Text reveals first
    // Headline rises from blur
    tl.fromTo(headlineRef.current,
      { opacity: 0, y: 36, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
      0
    );

    // Subheadline follows with delay
    tl.fromTo(subheadlineRef.current,
      { opacity: 0, y: 20, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      0.35
    );

    // Stage 2: Scan line sweeps across full section
    tl.fromTo(scanLineRef.current,
      { left: '-10%', opacity: 0 },
      { left: '110%', opacity: 1, duration: 2.2, ease: 'power1.inOut' },
      0.8
    );
    tl.to(scanLineRef.current, { opacity: 0, duration: 0.4 }, 2.6);

    // Stage 3: Network nodes activate progressively after scan
    // — Dots first (scale in from nothing)
    tl.fromTo('.net-node',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: { amount: 1.2, from: 'edges' } },
      1.6
    );

    // — Lines draw in after dots have started
    tl.fromTo('.net-line',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: { amount: 0.8 } },
      2.2
    );

    // Stage 4: Data metrics animate in last
    tl.fromTo('.data-value',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.15 },
      2.6
    );

    tl.fromTo('.data-label',
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.15 },
      2.9
    );

    // ── Parallax scroll depth ──
    gsap.to(networkRef.current, {
      y: -40,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    gsap.to(dataColumnRef.current, {
      y: -20,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // ── Continuous ambient animations (only pulse/glow, no re-entrance) ──
    gsap.to('.net-node-pulse', {
      scale: 1.8,
      opacity: 0,
      duration: 2.5,
      ease: 'power1.out',
      repeat: -1,
      delay: 3.5,
      stagger: { amount: 3, repeat: -1 },
    });

    gsap.to('.net-node-glow', {
      opacity: 0.35,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 3.5,
      stagger: { amount: 2, repeat: -1 },
    });

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 lg:py-56 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FAFAF8 0%, #F3F2EE 40%, #EDECE8 60%, #F5F4F0 100%)',
      }}
    >
      {/* Scan line effect */}
      <div
        ref={scanLineRef}
        className="absolute top-0 w-[4px] h-full opacity-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #B7FF00 20%, #B7FF00 80%, transparent 100%)',
          boxShadow: '0 0 60px 20px rgba(183,255,0,0.25), 0 0 120px 40px rgba(183,255,0,0.08)',
        }}
      />

      {/* Abstract network visualization — left side */}
      <div
        ref={networkRef}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Network nodes scattered with purpose */}
        {/* Top-left cluster */}
        <div className="absolute top-[18%] left-[8%] md:left-[12%]">
          <div className="net-node w-4 h-4 rounded-full border-2 border-[#B7FF00] flex items-center justify-center opacity-0" style={{ filter: 'drop-shadow(0 0 6px rgba(183,255,0,0.25))' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
            <div className="net-node-pulse absolute inset-0 rounded-full border border-[#B7FF00]/60" />
            <div className="net-node-glow absolute -inset-3 rounded-full bg-[#B7FF00]/25 opacity-0" />
          </div>
        </div>

        <div className="absolute top-[24%] left-[15%] md:left-[18%]">
          <div className="net-node w-2.5 h-2.5 rounded-full bg-[#B7FF00]/80 opacity-0" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.3))' }} />
        </div>

        {/* Connection line top-left */}
        <div className="absolute top-[20%] left-[10%] md:left-[14%] w-20 md:w-28">
          <div className="net-line h-[2px] bg-gradient-to-r from-[#B7FF00]/80 to-[#B7FF00]/20 origin-left opacity-0" />
        </div>

        {/* Mid-left node */}
        <div className="absolute top-[42%] left-[5%] md:left-[8%]">
          <div className="net-node w-5 h-5 rounded-full border-2 border-[#B7FF00]/70 flex items-center justify-center opacity-0" style={{ filter: 'drop-shadow(0 0 6px rgba(183,255,0,0.25))' }}>
            <div className="w-2 h-2 rounded-full bg-[#B7FF00]" />
            <div className="net-node-pulse absolute inset-0 rounded-full border-[1.5px] border-[#B7FF00]/50" />
          </div>
        </div>

        {/* Vertical connector left */}
        <div className="absolute top-[26%] left-[9%] md:left-[13%] h-24 md:h-36">
          <div className="net-line w-[2px] h-full bg-gradient-to-b from-[#B7FF00]/70 to-transparent origin-top opacity-0" style={{ transformOrigin: 'top' }} />
        </div>

        {/* Bottom-left */}
        <div className="absolute bottom-[22%] left-[12%] md:left-[16%]">
          <div className="net-node w-2.5 h-2.5 rounded-full bg-[#B7FF00]/60 opacity-0" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.2))' }} />
        </div>

        {/* Top-right cluster */}
        <div className="absolute top-[15%] right-[10%] md:right-[14%]">
          <div className="net-node w-3.5 h-3.5 rounded-full border-[1.5px] border-[#B7FF00]/80 flex items-center justify-center opacity-0" style={{ filter: 'drop-shadow(0 0 6px rgba(183,255,0,0.25))' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
            <div className="net-node-glow absolute -inset-3 rounded-full bg-[#B7FF00]/25 opacity-0" />
          </div>
        </div>

        {/* Connection line top-right diagonal */}
        <div className="absolute top-[22%] right-[12%] md:right-[16%] w-14 md:w-24 rotate-[25deg]">
          <div className="net-line h-[2px] bg-gradient-to-l from-[#B7FF00]/70 to-transparent origin-right opacity-0" />
        </div>

        {/* Mid-right large node */}
        <div className="absolute top-[38%] right-[6%] md:right-[10%]">
          <div className="net-node w-6 h-6 rounded-full border-2 border-[#B7FF00]/60 flex items-center justify-center opacity-0" style={{ filter: 'drop-shadow(0 0 8px rgba(183,255,0,0.2))' }}>
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#B7FF00]/80 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#B7FF00]" />
            </div>
            <div className="net-node-pulse absolute inset-0 rounded-full border-[1.5px] border-[#B7FF00]/40" />
          </div>
        </div>

        {/* Long horizontal connector right */}
        <div className="absolute top-[40%] right-[14%] md:right-[18%] w-24 md:w-36">
          <div className="net-line h-[2px] bg-gradient-to-l from-[#B7FF00]/60 to-transparent origin-right opacity-0" />
        </div>

        {/* Bottom-right */}
        <div className="absolute bottom-[28%] right-[15%] md:right-[20%]">
          <div className="net-node w-2.5 h-2.5 rounded-full bg-[#B7FF00]/70 opacity-0" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.2))' }} />
        </div>

        {/* Bottom center-left connector */}
        <div className="absolute bottom-[30%] left-[25%] md:left-[30%] w-20">
          <div className="net-line h-[2px] bg-gradient-to-r from-transparent via-[#B7FF00]/50 to-transparent origin-center opacity-0" />
        </div>

        {/* Corner brackets at asymmetric positions */}
        <div className="absolute top-[12%] left-[20%] md:left-[25%]">
          <div className="net-node w-5 h-5 border-t-2 border-l-2 border-[#B7FF00]/50 opacity-0" />
        </div>
        <div className="absolute bottom-[15%] right-[18%] md:right-[22%]">
          <div className="net-node w-4 h-4 border-b-2 border-r-2 border-[#B7FF00]/40 opacity-0" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight text-neutral-900 mb-10 opacity-0"
        >
          Lo que no se ve en terreno,
          <br />
          <span className="text-neutral-900">no se puede </span>
          <span className="relative inline-block">
            controlar
            <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#B7FF00] rounded-full" />
          </span>
        </h2>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-base md:text-lg lg:text-xl font-light leading-relaxed text-neutral-500 max-w-2xl mb-16 md:mb-20 opacity-0"
        >
          hela<span className="text-[#B7FF00] font-medium">.</span> transforma cada casco en un nodo de monitoreo en tiempo real
          para operar con información, no con intuición.
        </p>

        {/* Data metrics row */}
        <div
          ref={dataColumnRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 md:gap-24"
        >
          {[
            { value: '< 0.5s', label: 'Latencia' },
            { value: '360°', label: 'Cobertura visual' },
            { value: '24/7', label: 'Monitoreo continuo' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="data-value text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-900 tracking-tight opacity-0">
                {item.value}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.4))' }} />
                <div className="data-label text-xs md:text-sm font-mono uppercase tracking-widest text-neutral-400 opacity-0" style={{ textShadow: '0 0 6px rgba(183,255,0,0.15)' }}>
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle bottom edge gradient for transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a]/5 to-transparent pointer-events-none" />
    </section>
  );
}
