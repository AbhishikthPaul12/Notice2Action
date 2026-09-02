import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phases = ['READ', 'UNDERSTAND', 'EXTRACT', 'STRUCTURE'];

const extractions = [
  { label: 'LAST DATE', value: '18 SEPTEMBER 2026' },
  { label: 'ELIGIBILITY', value: 'FINAL YEAR STUDENTS' },
  { label: 'DOCUMENTS', value: 'ID / MARKSHEET / PHOTO' },
  { label: 'URGENCY', value: 'HIGH' },
];

export default function AIAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const extractionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      phaseRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const start = i * 0.15;

        tl.fromTo(ref,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1 },
          start
        );

        if (i < phases.length - 1) {
          tl.to(ref, {
            opacity: 0.1,
            scale: 0.8,
            y: -40,
            duration: 0.1,
          }, start + 0.12);
        }
      });

      tl.fromTo(scanLineRef.current,
        { opacity: 0, top: '20%' },
        { opacity: 1, top: '20%', duration: 0.02 },
        0.55
      );
      tl.to(scanLineRef.current, {
        top: '80%',
        duration: 0.2,
      }, 0.57);
      tl.to(scanLineRef.current, { opacity: 0, duration: 0.05 }, 0.77);

      extractionRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, x: -30, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.08 },
          0.65 + i * 0.05
        );
      });

      tl.to('.ai-inner', {
        opacity: 0,
        duration: 0.1,
      }, 0.92);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="ai-analysis"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="AI Analysis"
    >
      <div className="ai-inner relative w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {phases.map((phase, i) => (
            <div
              key={phase}
              ref={(el) => { phaseRefs.current[i] = el; }}
              className="absolute text-display text-paper will-transform opacity-0"
            >
              {phase}
            </div>
          ))}
        </div>

        <div
          ref={scanLineRef}
          className="scan-line"
          aria-hidden="true"
        />

        <div className="absolute bottom-16 md:bottom-24 left-6 md:left-16 right-6 md:right-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl">
            {extractions.map((item, i) => (
              <div
                key={item.label}
                ref={(el) => { extractionRefs.current[i] = el; }}
                className="opacity-0 will-transform"
              >
                <p className="text-technical text-accent mb-1">{item.label}</p>
                <p className="text-lg md:text-xl font-semibold tracking-tight text-paper">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">AI Processing</p>
        </div>
      </div>
    </section>
  );
}
