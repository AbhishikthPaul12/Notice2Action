import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const documents = [
  { num: '01', label: 'IDENTITY PROOF', desc: 'Aadhaar Card / Passport / Voter ID' },
  { num: '02', label: 'ACADEMIC RECORD', desc: 'Mark sheets for all semesters' },
  { num: '03', label: 'PHOTOGRAPH', desc: 'Passport-size, within 3 months' },
  { num: '04', label: 'APPLICATION FORM', desc: 'Form N2A-47, completed and signed' },
];

export default function DocumentsScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const docRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      tl.fromTo(headingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.1 }
      );

      tl.to(headingRef.current, {
        opacity: 0.08,
        y: -80,
        scale: 0.7,
        duration: 0.15,
      }, 0.12);

      docRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, y: 40 + i * 10, x: -20 },
          { opacity: 1, y: 0, x: 0, duration: 0.1 },
          0.2 + i * 0.1
        );
      });

      tl.to('.docs-inner', {
        opacity: 0,
        duration: 0.1,
      }, 0.9);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="documents"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Required documents"
    >
      <div className="docs-inner relative w-full h-screen flex items-center justify-center px-6">
        <div ref={headingRef} className="absolute text-section text-paper opacity-0 will-transform font-bold">
          WHAT DO YOU NEED?
        </div>

        <div className="max-w-xl w-full">
          {documents.map((doc, i) => (
            <div
              key={doc.num}
              ref={(el) => { docRefs.current[i] = el; }}
              className="opacity-0 will-transform flex items-start gap-6 py-6 border-b border-dark-gray/30"
            >
              <span className="font-mono text-3xl md:text-5xl font-light text-neutral/30 tabular-nums leading-none">
                {doc.num}
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-paper tracking-tight uppercase">
                  {doc.label}
                </h3>
                <p className="text-sm text-neutral mt-1">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Document Requirements</p>
        </div>
      </div>
    </section>
  );
}
