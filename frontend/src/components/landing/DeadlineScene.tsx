import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const countdownSteps = [
  { days: '30', label: 'DAYS' },
  { days: '14', label: 'DAYS' },
  { days: '7', label: 'DAYS' },
  { days: '2', label: 'DAYS' },
  { days: 'TODAY', label: '' },
];

export default function DeadlineScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const countdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const urgentRef = useRef<HTMLDivElement>(null);

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

      tl.fromTo(headingRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.1 }
      );

      tl.fromTo(dateRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.1 },
        0.1
      );

      tl.to(headingRef.current, { opacity: 0.1, duration: 0.08 }, 0.2);
      tl.to(dateRef.current, { opacity: 0.1, scale: 0.85, duration: 0.08 }, 0.2);

      countdownSteps.forEach((_, i) => {
        const ref = countdownRefs.current[i];
        if (!ref) return;
        const start = 0.25 + i * 0.12;

        tl.fromTo(ref,
          { opacity: 0, scale: 1.3 },
          { opacity: 1, scale: 1, duration: 0.06 },
          start
        );

        tl.to(ref, {
          letterSpacing: `${-0.02 - i * 0.01}em`,
          duration: 0.06,
        }, start);

        if (i < countdownSteps.length - 1) {
          tl.to(ref, {
            opacity: 0,
            scale: 0.7,
            y: -30,
            duration: 0.06,
          }, start + 0.09);
        }
      });

      tl.to(countdownRefs.current[countdownRefs.current.length - 1], {
        opacity: 0,
        duration: 0.06,
      }, 0.82);

      tl.fromTo(urgentRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.1 },
        0.85
      );

      tl.to(urgentRef.current, { opacity: 0, duration: 0.08 }, 0.93);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="deadline"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Deadline countdown"
    >
      <div className="relative w-full h-screen flex items-center justify-center">
        <div ref={headingRef} className="absolute text-section text-paper opacity-0 will-transform font-bold">
          DEADLINE
        </div>

        <div ref={dateRef} className="absolute text-center opacity-0 will-transform">
          <span className="block text-display text-paper font-black" style={{ fontSize: 'clamp(6rem, 18vw, 24vw)' }}>
            18
          </span>
          <span className="block text-subsection text-neutral -mt-4 font-bold">SEP</span>
          <span className="block text-subsection text-neutral font-bold">2026</span>
        </div>

        {countdownSteps.map((step, i) => (
          <div
            key={i}
            ref={(el) => { countdownRefs.current[i] = el; }}
            className="absolute text-center opacity-0 will-transform"
          >
            <span
              className={`block font-bold tracking-tight ${
                i >= 3 ? 'text-accent' : 'text-paper'
              }`}
              style={{
                fontSize: step.days === 'TODAY' ? 'clamp(4rem, 12vw, 16vw)' : 'clamp(6rem, 16vw, 22vw)',
              }}
            >
              {step.days}
            </span>
            {step.label && (
              <span className="block text-subsection text-neutral -mt-2">{step.label}</span>
            )}
          </div>
        ))}

        <div ref={urgentRef} className="absolute text-center opacity-0 will-transform">
          <span className="text-section text-accent font-bold">ACTION REQUIRED</span>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Deadline Analysis</p>
        </div>
      </div>
    </section>
  );
}
