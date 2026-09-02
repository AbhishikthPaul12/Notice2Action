import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const conditions = [
  { label: 'YEAR', value: 'FINAL YEAR', symbol: '+' },
  { label: 'CATEGORY', value: 'ELIGIBLE', symbol: '+' },
  { label: 'DOCUMENTS', value: 'AVAILABLE', symbol: '=' },
];

export default function EligibilityScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const conditionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=180%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(questionRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.12 }
      );

      tl.to(questionRef.current, {
        opacity: 0.08,
        scale: 0.8,
        y: -60,
        duration: 0.12,
      }, 0.15);

      conditionRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, y: 30, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.1 },
          0.25 + i * 0.12
        );
      });

      tl.fromTo(resultRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.12 },
        0.7
      );

      tl.to('.elig-inner', {
        opacity: 0,
        duration: 0.1,
      }, 0.92);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="eligibility"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Eligibility check"
    >
      <div className="elig-inner relative w-full h-screen flex items-center justify-center px-6">
        <div ref={questionRef} className="absolute text-section text-paper opacity-0 will-transform font-bold">
          WHO CAN APPLY?
        </div>

        <div className="flex flex-col items-center gap-6 md:gap-8 max-w-lg">
          {conditions.map((cond, i) => (
            <div
              key={cond.label}
              ref={(el) => { conditionRefs.current[i] = el; }}
              className="opacity-0 will-transform w-full"
            >
              <div className="flex items-center justify-between border-b border-dark-gray/50 pb-4">
                <div>
                  <p className="text-technical mb-1">{cond.label}</p>
                  <p className="text-xl md:text-2xl font-semibold text-paper tracking-tight">
                    {cond.value}
                  </p>
                </div>
                <span className="text-2xl md:text-3xl text-neutral/40 font-light">
                  {cond.symbol}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div ref={resultRef} className="absolute bottom-20 md:bottom-28 text-center opacity-0 will-transform">
          <p className="text-technical text-accent mb-2">Result</p>
          <p className="text-section text-accent font-bold">ELIGIBLE</p>
          <p className="text-body-lg text-paper/60 mt-3">You can apply</p>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Eligibility Analysis</p>
        </div>
      </div>
    </section>
  );
}
