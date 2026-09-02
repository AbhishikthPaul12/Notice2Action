import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, FileText, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ProductDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      tl.fromTo(uploadRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.1 }
      );

      tl.to(uploadRef.current, { opacity: 0, y: -20, duration: 0.08 }, 0.15);
      tl.fromTo(processingRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.08 },
        0.2
      );

      tl.to(processingRef.current, { opacity: 0, duration: 0.08 }, 0.35);
      tl.fromTo(dashboardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.1 },
        0.4
      );

      cardRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.06 },
          0.45 + i * 0.04
        );
      });

      tl.to(dashboardRef.current, { opacity: 0, duration: 0.1 }, 0.9);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="product-demo"
      className="relative w-full min-h-screen bg-dark-gray overflow-hidden text-paper"
      aria-label="Product demonstration"
    >
      <div className="relative w-full h-screen flex items-center justify-center px-4 md:px-8">
        <div ref={uploadRef} className="absolute text-center opacity-0 will-transform">
          <div className="border border-dashed border-neutral/30 p-12 md:p-16 max-w-sm mx-auto">
            <Upload size={32} className="text-neutral mx-auto mb-4" />
            <p className="text-subsection text-paper mb-2">UPLOAD NOTICE</p>
            <p className="text-technical">PDF / DOCX / TXT</p>
          </div>
        </div>

        <div ref={processingRef} className="absolute text-center opacity-0 will-transform">
          <FileText size={40} className="text-accent mx-auto mb-4" />
          <p className="text-label text-accent">Analyzing...</p>
          <div className="w-32 h-px bg-dark-gray mx-auto mt-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent animate-pulse" />
          </div>
        </div>

        <div ref={dashboardRef} className="absolute w-full max-w-3xl opacity-0 will-transform px-4">
          <div className="border-b border-neutral/20 pb-4 mb-6">
            <p className="text-technical text-accent mb-1">Analysis Complete</p>
            <h2 className="text-xl md:text-2xl font-bold text-paper tracking-tight">
              SCHOLARSHIP APPLICATION
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { label: 'URGENCY', value: 'HIGH', accent: true },
              { label: 'DEADLINE', value: '18 SEP', accent: false },
              { label: 'ELIGIBILITY', value: 'FINAL-YEAR', accent: false },
              { label: 'DOCUMENTS', value: '4 REQUIRED', accent: false },
            ].map((card, i) => (
              <div
                key={card.label}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="border border-neutral/15 p-4 opacity-0 will-transform"
              >
                <p className="text-technical mb-2">{card.label}</p>
                <p className={`text-lg font-bold tracking-tight ${
                  card.accent ? 'text-accent' : 'text-paper'
                }`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div
            ref={(el) => { cardRefs.current[4] = el; }}
            className="border border-neutral/15 p-4 md:p-6 mb-4 opacity-0 will-transform"
          >
            <p className="text-technical mb-3">Action Checklist</p>
            <div className="space-y-2">
              {['Verify eligibility', 'Prepare documents', 'Complete application', 'Submit'].map((task, i) => (
                <div key={task} className="flex items-center gap-3">
                  <div className={`w-4 h-4 border flex items-center justify-center ${
                    i === 0 ? 'border-accent bg-accent/10' : 'border-neutral/30'
                  }`}>
                    {i === 0 && <Check size={10} className="text-accent" />}
                  </div>
                  <span className={`text-xs font-mono tracking-wider uppercase ${
                    i === 0 ? 'text-neutral line-through' : 'text-paper/80'
                  }`}>
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={(el) => { cardRefs.current[5] = el; }}
            className="border border-neutral/15 p-4 opacity-0 will-transform"
          >
            <p className="text-technical text-accent">Ask This Notice ↗</p>
          </div>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Product Interface</p>
        </div>
      </div>
    </section>
  );
}
