'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        toggleActions: 'play none none none',
      },
    });

    // Stage 1: Eyebrow
    tl.fromTo(eyebrowRef.current,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      0
    );

    // Stage 2: Headline rises from blur
    tl.fromTo(headlineRef.current,
      { opacity: 0, y: 28, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
      0.15
    );

    // Stage 3: Body text
    tl.fromTo(bodyRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      0.4
    );

    // Stage 4: Video container scales in
    tl.fromTo(containerRef.current,
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power2.out' },
      0.5
    );

    // Stage 5: Green monitoring overlays container activates
    tl.fromTo(overlaysRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      1.2
    );

    // Stage 6: Matrix columns flash down once then stay faint
    tl.fromTo('.matrix-col',
      { opacity: 0, y: '-100%' },
      { opacity: 0.1, y: '0%', duration: 1.5, ease: 'power2.out', stagger: { amount: 0.8 } },
      1.3
    );

    // Stage 7: Flickering nodes — glitch entrance then settle
    const flickerNodes = gsap.utils.toArray('.flicker-node');
    flickerNodes.forEach((node, i) => {
      const delay = 1.5 + (i * 0.12);
      // Rapid glitch: appear → vanish → appear → vanish → appear (settle)
      tl.set(node as Element, { opacity: 0.8, scale: 1 }, delay);
      tl.set(node as Element, { opacity: 0 }, delay + 0.08);
      tl.set(node as Element, { opacity: 0.6 }, delay + 0.18);
      tl.set(node as Element, { opacity: 0 }, delay + 0.22);
      tl.to(node as Element, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, delay + 0.3);
    });

    // Stage 8: Glitch labels — flash then settle
    const glitchLabels = gsap.utils.toArray('.glitch-label');
    glitchLabels.forEach((label, i) => {
      const delay = 1.8 + (i * 0.15);
      tl.set(label as Element, { opacity: 0.7, x: -2 }, delay);
      tl.set(label as Element, { opacity: 0 }, delay + 0.06);
      tl.set(label as Element, { opacity: 0.5, x: 1 }, delay + 0.12);
      tl.set(label as Element, { opacity: 0 }, delay + 0.16);
      tl.to(label as Element, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, delay + 0.22);
    });

    // Connection lines draw in
    tl.fromTo('.problem-line',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.2 },
      2.0
    );

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-40 lg:py-48 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F5F4F0 0%, #FAFAF8 30%, #FAFAF8 70%, #F5F4F0 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

          {/* Left: Text content */}
          <div className="flex-1 lg:max-w-lg pt-4 lg:pt-8">
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              className="flex items-center gap-3 mb-6 opacity-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.4))' }} />
              <span className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-400">
                03 / El problema
              </span>
            </div>

            {/* Headline */}
            <h2
              ref={headlineRef}
              className="text-2xl md:text-4xl lg:text-[2.75rem] font-medium leading-[1.15] tracking-tight text-neutral-900 mb-6 opacity-0"
            >
              En terreno, cada segundo sin visibilidad
              <span className="relative inline-block ml-2">
                importa<span className="text-[#B7FF00] font-medium">.</span>
                <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#B7FF00]/40 rounded-full" />
              </span>
            </h2>

            {/* Body */}
            <p
              ref={bodyRef}
              className="text-base md:text-lg font-light leading-relaxed text-neutral-500 max-w-md opacity-0"
            >
              Los equipos se mueven, las condiciones cambian y muchas decisiones todavía dependen de reportes manuales, llamados o información que llega tarde.
            </p>
          </div>

          {/* Right: System monitor container */}
          <div className="flex-1 w-full lg:max-w-2xl">
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden opacity-0"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {/* Top bar — system-style header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#B7FF00]/60" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.3))' }} />
                  <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-white/30">
                    Feed en terreno — Sin procesar
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-400/60 animate-pulse" />
                  <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-white/20">
                    En vivo
                  </span>
                </div>
              </div>

              {/* Visual area */}
              <div className="relative aspect-video">
                {/* Veo-generated mining scene — scaled up to crop watermark */}
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute top-1/2 left-1/2 min-w-[115%] min-h-[115%] object-cover"
                    style={{
                      transform: 'translate(-50%, -50%) scale(1.15)',
                      filter: 'brightness(0.6) contrast(0.9) saturate(0.75)',
                    }}
                  >
                    <source src="/hero/section3.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Noise/grain overlay for raw footage feel */}
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Subtle vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
                  }}
                />

                {/* Scanline effect for surveillance feel */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
                  }}
                />

                {/* Green monitoring overlays — matrix-style dynamic system */}
                <div ref={overlaysRef} className="absolute inset-0 pointer-events-none opacity-0">

                  {/* Falling data streams — matrix columns */}
                  <div className="matrix-col absolute top-0 left-[12%] w-[1px] h-full opacity-0"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #B7FF00 20%, #B7FF00 40%, transparent 60%)' }} />
                  <div className="matrix-col absolute top-0 left-[35%] w-[1px] h-full opacity-0"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #B7FF00 30%, #B7FF00 50%, transparent 70%)' }} />
                  <div className="matrix-col absolute top-0 left-[58%] w-[1px] h-full opacity-0"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #B7FF00 15%, #B7FF00 35%, transparent 55%)' }} />
                  <div className="matrix-col absolute top-0 left-[78%] w-[1px] h-full opacity-0"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #B7FF00 25%, #B7FF00 45%, transparent 65%)' }} />
                  <div className="matrix-col absolute top-0 left-[92%] w-[1px] h-full opacity-0"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, #B7FF00 10%, #B7FF00 30%, transparent 50%)' }} />

                  {/* Flickering data nodes — appear/disappear randomly */}
                  <div className="flicker-node absolute top-[18%] left-[15%] opacity-0">
                    <div className="w-3 h-3 border border-[#B7FF00]/60 rounded-full flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 6px rgba(183,255,0,0.3))' }}>
                      <div className="w-1 h-1 rounded-full bg-[#B7FF00]" />
                    </div>
                    <div className="font-mono text-[7px] text-[#B7FF00]/60 mt-0.5 whitespace-nowrap">ERR::NULL</div>
                  </div>

                  <div className="flicker-node absolute top-[40%] left-[45%] opacity-0">
                    <div className="w-4 h-4 border-[1.5px] border-[#B7FF00]/50 flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 8px rgba(183,255,0,0.2))' }}>
                      <div className="absolute w-[12px] h-[1px] bg-[#B7FF00]/40" />
                      <div className="absolute h-[12px] w-[1px] bg-[#B7FF00]/40" />
                    </div>
                  </div>

                  <div className="flicker-node absolute top-[28%] right-[25%] opacity-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B7FF00]/50" style={{ filter: 'drop-shadow(0 0 5px rgba(183,255,0,0.25))' }} />
                  </div>

                  <div className="flicker-node absolute top-[60%] left-[25%] opacity-0">
                    <div className="w-2 h-2 border border-[#B7FF00]/40 rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-[#B7FF00]/70" />
                    </div>
                    <div className="font-mono text-[6px] text-[#B7FF00]/40 mt-0.5">--:--</div>
                  </div>

                  <div className="flicker-node absolute top-[55%] right-[18%] opacity-0">
                    <div className="w-3 h-3 border border-[#B7FF00]/30 flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 4px rgba(183,255,0,0.15))' }}>
                      <div className="w-1 h-1 bg-[#B7FF00]/50" />
                    </div>
                  </div>

                  <div className="flicker-node absolute top-[75%] left-[60%] opacity-0">
                    <div className="w-2 h-2 rounded-full border border-[#B7FF00]/40">
                      <div className="w-full h-full rounded-full bg-[#B7FF00]/20" />
                    </div>
                  </div>

                  {/* Glitching data labels — appear briefly then vanish */}
                  <div className="glitch-label absolute top-[15%] left-[30%] font-mono text-[7px] text-[#B7FF00]/50 uppercase tracking-widest opacity-0 whitespace-nowrap"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(183,255,0,0.2))' }}>
                    0x4F::TIMEOUT
                  </div>
                  <div className="glitch-label absolute top-[50%] right-[12%] font-mono text-[7px] text-[#B7FF00]/40 uppercase tracking-widest opacity-0 whitespace-nowrap">
                    NODE_3::LOST
                  </div>
                  <div className="glitch-label absolute bottom-[25%] left-[40%] font-mono text-[6px] text-[#B7FF00]/35 uppercase tracking-widest opacity-0 whitespace-nowrap">
                    SYNC::FAILED
                  </div>
                  <div className="glitch-label absolute top-[35%] left-[8%] font-mono text-[6px] text-[#B7FF00]/30 uppercase tracking-widest opacity-0 whitespace-nowrap">
                    LAT::--ms
                  </div>
                  <div className="glitch-label absolute bottom-[35%] right-[30%] font-mono text-[7px] text-[#B7FF00]/45 uppercase tracking-widest opacity-0 whitespace-nowrap"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(183,255,0,0.15))' }}>
                    PKT::DROP
                  </div>

                  {/* Dashed connection lines — unstable links */}
                  <div className="problem-line absolute top-[22%] left-[18%] w-24 md:w-36 rotate-[12deg] opacity-0"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(183,255,0,0.25) 0px, rgba(183,255,0,0.25) 4px, transparent 4px, transparent 10px)', height: '1px', transformOrigin: 'left' }} />
                  <div className="problem-line absolute top-[42%] left-[48%] w-20 md:w-28 -rotate-[5deg] opacity-0"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(183,255,0,0.2) 0px, rgba(183,255,0,0.2) 3px, transparent 3px, transparent 8px)', height: '1px', transformOrigin: 'left' }} />

                  {/* Corner brackets — partial, flickering */}
                  <div className="flicker-node absolute top-[10%] right-[12%] opacity-0">
                    <div className="w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-[#B7FF00]/30" />
                  </div>
                  <div className="flicker-node absolute bottom-[12%] left-[10%] opacity-0">
                    <div className="w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-[#B7FF00]/25" />
                  </div>
                  <div className="flicker-node absolute bottom-[15%] right-[15%] opacity-0">
                    <div className="w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-[#B7FF00]/20" />
                  </div>

                  {/* Ambient status bar — bottom */}
                  <div className="absolute bottom-[6%] left-[14%] flex items-center gap-2 flicker-node opacity-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    <span className="font-mono text-[7px] text-white/20 uppercase tracking-widest">Señal intermitente</span>
                  </div>

                </div>
              </div>

              {/* Bottom bar — system status */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest">
                    Latencia: --ms
                  </span>
                  <span className="font-mono text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest">
                    Nodos: 0/4
                  </span>
                </div>
                <span className="font-mono text-[9px] md:text-[10px] text-amber-400/50 uppercase tracking-widest">
                  Visibilidad limitada
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
