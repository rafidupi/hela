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
  const accentLineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const microLineLeftRef = useRef<HTMLDivElement>(null);
  const microLineRightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        end: 'top 25%',
        toggleActions: 'play none none none',
      },
    });

    // 1. Green accent line draws in from center
    tl.fromTo(accentLineRef.current,
      { width: 0, opacity: 0 },
      { width: 48, opacity: 1, duration: 0.8, ease: 'power2.out' },
      0
    );

    // 2. Dot pulses in
    tl.fromTo(dotRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
      0.3
    );

    // 3. Headline fades up
    tl.fromTo(headlineRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      0.4
    );

    // 4. Subheadline follows
    tl.fromTo(subheadlineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      0.65
    );

    // 5. Micro corner lines fade in last
    tl.fromTo([microLineLeftRef.current, microLineRightRef.current],
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power2.out', stagger: 0.15 },
      0.9
    );

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#FAFAF8] py-40 md:py-56 lg:py-64 overflow-hidden"
    >
      {/* Content container */}
      <div className="relative max-w-3xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Green accent elements cluster */}
        <div className="flex items-center gap-3 mb-10">
          {/* Pulsing dot */}
          <div
            ref={dotRef}
            className="relative w-2 h-2 opacity-0"
          >
            <div className="absolute inset-0 rounded-full bg-[#B7FF00]" />
            <div className="absolute inset-0 rounded-full bg-[#B7FF00] animate-[pulse_3s_ease-in-out_infinite]" />
          </div>

          {/* Draw-in accent line */}
          <div
            ref={accentLineRef}
            className="h-[2px] bg-[#B7FF00] opacity-0 origin-left"
          />
        </div>

        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-3xl md:text-5xl lg:text-[3.5rem] font-medium leading-[1.15] tracking-tight text-neutral-900 mb-8 opacity-0"
        >
          Lo que no se ve en terreno,
          <br />
          no se puede controlar
        </h2>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-base md:text-lg lg:text-xl font-light leading-relaxed text-neutral-500 max-w-2xl opacity-0"
        >
          hela<span className="text-[#B7FF00]">.</span> transforma cada casco en un nodo de monitoreo en tiempo real
          para operar con información, no con intuición.
        </p>

        {/* Micro decorative corner lines — far edges */}
        <div
          ref={microLineLeftRef}
          className="absolute left-6 md:left-0 top-1/2 -translate-y-1/2 w-8 h-[1.5px] bg-[#B7FF00]/40 origin-left opacity-0"
        />
        <div
          ref={microLineRightRef}
          className="absolute right-6 md:right-0 top-1/2 -translate-y-1/2 w-8 h-[1.5px] bg-[#B7FF00]/40 origin-right opacity-0"
        />
      </div>
    </section>
  );
}
