import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const elements = ['DEADLINE', 'ELIGIBILITY', 'DOCUMENTS', 'TASKS', 'ANSWERS'];

export default function TransformationScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const oneNoticeRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planRef = useRef<HTMLDivElement>(null);

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

      tl.fromTo(oneNoticeRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.12 }
      );

      tl.to(oneNoticeRef.current, {
        opacity: 0.03,
        scale: 0.6,
        duration: 0.15,
      }, 0.15);

      elementRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          {
            opacity: 0,
            y: 30,
            x: (i - 2) * 20,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.08,
          },
          0.25 + i * 0.06
        );
      });

      elementRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.to(ref, {
          y: (i - 2) * 50,
          scale: 0.9,
          opacity: 0.4,
          duration: 0.15,
        }, 0.65);
      });

      tl.to(elementRefs.current.filter(Boolean), {
        opacity: 0,
        duration: 0.08,
      }, 0.8);

      tl.fromTo(planRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.1 },
        0.82
      );

      tl.to(planRef.current, { opacity: 0, duration: 0.08 }, 0.92);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="transformation"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="The Transformation"
    >
      <div className="relative w-full h-screen flex items-center justify-center px-6">
        <div ref={oneNoticeRef} className="absolute text-center opacity-0 will-transform font-bold">
          <p className="text-section text-paper">ONE NOTICE</p>
        </div>

        <div className="absolute flex flex-col items-center gap-4 md:gap-6">
          {elements.map((el, i) => (
            <div
              key={el}
              ref={(ref) => { elementRefs.current[i] = ref; }}
              className="opacity-0 will-transform flex items-center gap-4"
            >
              <div className="w-6 h-px bg-accent" />
              <span className="text-lg md:text-2xl font-semibold text-paper tracking-tight uppercase">
                {el}
              </span>
            </div>
          ))}
        </div>

        <div ref={planRef} className="absolute text-center opacity-0 will-transform font-bold">
          <p className="text-section text-paper">ONE CLEAR</p>
          <p className="text-section text-accent">PLAN.</p>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Transformation</p>
        </div>
      </div>
    </section>
  );
}
