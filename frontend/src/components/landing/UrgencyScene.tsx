import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const levels = [
  { label: 'LOW', color: '#A8A8A0', scale: 0.7 },
  { label: 'MEDIUM', color: '#F4F2EC', scale: 0.9 },
  { label: 'HIGH', color: '#5B6CFF', scale: 1.1 },
];

export default function UrgencyScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.6 },
        0
      );

      levelRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const start = 0.05 + i * 0.25;

        tl.fromTo(ref,
          { opacity: 0, x: -40, scale: 0.8 },
          { opacity: 1, x: 0, scale: 1, duration: 0.12 },
          start
        );

        if (i > 0 && levelRefs.current[i - 1]) {
          tl.to(levelRefs.current[i - 1], {
            opacity: 0.15,
            scale: 0.8,
            duration: 0.1,
          }, start);
        }
      });

      tl.to('.urgency-inner', {
        opacity: 0,
        duration: 0.1,
      }, 0.9);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="urgency"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Urgency classification"
    >
      <div className="urgency-inner relative w-full h-screen flex items-center justify-center">
        <div
          ref={lineRef}
          className="absolute left-1/2 -translate-x-1/2 w-px bg-dark-gray origin-top"
          style={{ height: '60vh', top: '20vh', transformOrigin: 'top' }}
          aria-hidden="true"
        />

        <div className="absolute left-1/2 flex flex-col items-start gap-24 md:gap-32" style={{ top: '22vh' }}>
          {levels.map((level, i) => (
            <div
              key={level.label}
              ref={(el) => { levelRefs.current[i] = el; }}
              className="opacity-0 will-transform flex items-center gap-6 md:gap-10 -translate-x-1/2"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: level.color }}
              />
              <span
                className="font-bold tracking-tight uppercase will-transform"
                style={{
                  fontSize: `clamp(${2 + i * 1.5}rem, ${5 + i * 3}vw, ${6 + i * 4}vw)`,
                  color: level.color,
                  lineHeight: 0.9,
                }}
              >
                {level.label}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Urgency Classification</p>
        </div>
      </div>
    </section>
  );
}
