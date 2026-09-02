import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fragments = [
  'DEADLINE',
  'ELIGIBILITY',
  'DOCUMENTS',
  'TASKS',
  'ANSWERS',
  '18 SEPTEMBER',
  'FINAL YEAR',
  'HIGH PRIORITY',
  'CHECKLIST',
  'SUMMARY',
];

export default function ClimaxScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionTextRef = useRef<HTMLHeadingElement>(null);
  const fragmentsContainerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=250%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      fragmentRefs.current.forEach((frag, i) => {
        if (!frag) return;
        const angle = (i / fragments.length) * Math.PI * 2;
        const dist = 320 + (i % 3) * 60;
        gsap.set(frag, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: 0.7,
        });
      });

      tl.to(
        fragmentRefs.current.filter(Boolean),
        {
          opacity: 0.7,
          scale: 1,
          duration: 0.2,
          stagger: 0.02,
        },
        0
      );

      tl.fromTo(
        actionTextRef.current,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' },
        0.15
      );

      tl.to(
        fragmentRefs.current.filter(Boolean),
        {
          x: 0,
          y: 0,
          scale: 0.2,
          opacity: 0,
          duration: 0.25,
          stagger: 0.01,
        },
        0.35
      );

      tl.to(
        actionTextRef.current,
        {
          scale: 2.8,
          opacity: 0.15,
          filter: 'blur(10px)',
          duration: 0.3,
        },
        0.55
      );

      tl.to(
        actionTextRef.current,
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.1,
        },
        0.75
      );

      tl.fromTo(
        brandRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2 },
        0.78
      );

      tl.to(
        brandRef.current,
        {
          opacity: 0,
          scale: 1.05,
          duration: 0.1,
        },
        0.92
      );
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="climax"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Climax — Collapse into Action"
    >
      <div className="relative w-full h-screen flex items-center justify-center">
        <div ref={fragmentsContainerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {fragments.map((frag, i) => (
            <span
              key={i}
              ref={(el) => {
                fragmentRefs.current[i] = el;
              }}
              className="absolute font-mono text-xs md:text-sm tracking-widest text-neutral uppercase opacity-0 will-transform"
            >
              {frag}
            </span>
          ))}
        </div>

        <h2
          ref={actionTextRef}
          className="text-hero text-paper opacity-0 will-transform select-none font-black tracking-tighter"
          style={{ fontSize: 'clamp(14rem, 30vw, 40vw)', lineHeight: 0.8 }}
        >
          ACTION
        </h2>

        <div ref={brandRef} className="absolute text-center opacity-0 will-transform">
          <p className="text-technical text-accent mb-3 tracking-[0.3em]">INTELLIGENCE RESOLVED</p>
          <h2 className="text-display text-paper font-black tracking-tight">
            NOTICE<span className="text-accent">2</span>ACTION
          </h2>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">09 / Climax</p>
        </div>
      </div>
    </section>
  );
}
