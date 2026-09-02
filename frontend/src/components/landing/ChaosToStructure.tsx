import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fragments = [
  'deadline', 'application', 'eligibility', 'documents', 'submit',
  'important', 'candidate', 'required', 'before', 'registration',
  'certificate', 'photograph', 'portal', 'semester', 'academic',
  'scholarship', 'notification', 'procedure', 'format', 'valid',
  'category', 'income', 'identity', 'marksheet', 'final',
  'proof', 'authority', 'competent', 'prescribed', 'receipt',
];

const structured = [
  {
    category: 'DEADLINE',
    items: ['18 SEPTEMBER 2026'],
  },
  {
    category: 'ELIGIBILITY',
    items: ['FINAL YEAR STUDENTS', 'CGPA ≥ 7.5'],
  },
  {
    category: 'DOCUMENTS',
    items: ['ID PROOF', 'MARKSHEET', 'PHOTO'],
  },
  {
    category: 'URGENCY',
    items: ['HIGH'],
  },
];

export default function ChaosToStructure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const structuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      fragmentRefs.current.forEach((frag) => {
        if (!frag) return;
        gsap.set(frag, {
          x: (Math.random() - 0.5) * window.innerWidth * 0.7,
          y: (Math.random() - 0.5) * window.innerHeight * 0.6,
          rotation: (Math.random() - 0.5) * 40,
          opacity: 0.15 + Math.random() * 0.35,
          scale: 0.6 + Math.random() * 0.8,
        });
      });

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
        tl.to(frag, {
          opacity: 0.6 + Math.random() * 0.4,
          scale: 1,
          duration: 0.15,
        }, i * 0.003);
      });

      fragmentRefs.current.forEach((frag, i) => {
        if (!frag) return;
        tl.to(frag, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 0.3,
          scale: 0.7,
          duration: 0.25,
        }, 0.2 + i * 0.005);
      });

      tl.to(fragmentRefs.current.filter(Boolean), {
        opacity: 0,
        scale: 0.5,
        duration: 0.15,
        stagger: 0.005,
      }, 0.55);

      tl.fromTo(structuredRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.2 },
        0.65
      );

      const categoryEls = structuredRef.current?.querySelectorAll('.struct-category');
      if (categoryEls) {
        tl.fromTo(categoryEls,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.1, stagger: 0.05 },
          0.7
        );
      }

      tl.to(structuredRef.current, {
        opacity: 0,
        duration: 0.1,
      }, 0.92);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="chaos-to-structure"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="From Chaos to Structure"
    >
      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {fragments.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => { fragmentRefs.current[i] = el; }}
              className="absolute font-mono text-xs md:text-sm tracking-wider uppercase text-paper/50 will-transform"
            >
              {word}
            </span>
          ))}
        </div>

        <div
          ref={structuredRef}
          className="absolute inset-0 flex items-center justify-center opacity-0"
        >
          <div className="max-w-2xl w-full px-6 md:px-0">
            {structured.map((group) => (
              <div
                key={group.category}
                className="struct-category mb-10 md:mb-14 will-transform"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-px bg-accent" />
                  <h3 className="text-label text-accent">{group.category}</h3>
                </div>
                {group.items.map((item, ii) => (
                  <p
                    key={ii}
                    className="text-xl md:text-3xl font-semibold text-paper tracking-tight ml-12"
                  >
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Extraction Complete</p>
        </div>
      </div>
    </section>
  );
}
