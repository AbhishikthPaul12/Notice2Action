import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const phases = ['READ', 'UNDERSTAND', 'DECIDE', 'ACT'];

const tasks = [
  'DOWNLOAD FORM',
  'CHECK ELIGIBILITY',
  'PREPARE DOCUMENTS',
  'COMPLETE APPLICATION',
  'SUBMIT',
  'CONFIRM',
];

export default function ActionScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);
  const doneRef = useRef<HTMLDivElement>(null);
  const takenRef = useRef<HTMLDivElement>(null);

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

      phaseRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const start = i * 0.08;

        tl.fromTo(ref,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.06 },
          start
        );

        if (i < phases.length - 1) {
          tl.to(ref, {
            opacity: 0.05,
            y: -40,
            scale: 0.8,
            duration: 0.06,
          }, start + 0.06);
        }
      });

      tl.to(phaseRefs.current[phases.length - 1], {
        opacity: 0,
        y: -60,
        duration: 0.06,
      }, 0.35);

      taskRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.04 },
          0.38 + i * 0.03
        );
      });

      taskRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const checkmark = ref.querySelector('.task-check');
        const text = ref.querySelector('.task-text');

        tl.to(checkmark, {
          opacity: 1,
          scale: 1,
          duration: 0.03,
        }, 0.58 + i * 0.04);

        tl.to(text, {
          opacity: 0.3,
          textDecoration: 'line-through',
          duration: 0.03,
        }, 0.58 + i * 0.04);

        tl.to(ref, {
          height: 'auto',
          marginBottom: 0,
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          duration: 0.03,
        }, 0.62 + i * 0.04);
      });

      tl.fromTo(doneRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.06 },
        0.84
      );

      tl.to(doneRef.current, { opacity: 0, duration: 0.04 }, 0.88);
      tl.fromTo(takenRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.06 },
        0.89
      );

      tl.to(takenRef.current, { opacity: 0, duration: 0.06 }, 0.95);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="action"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="From information to action"
    >
      <div className="relative w-full h-screen flex items-center justify-center px-6">
        {phases.map((phase, i) => (
          <div
            key={phase}
            ref={(el) => { phaseRefs.current[i] = el; }}
            className={`absolute text-display will-transform opacity-0 font-black ${
              phase === 'ACT' ? 'text-accent' : 'text-paper'
            }`}
          >
            {phase}
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md w-full">
            {tasks.map((task, i) => (
              <div
                key={task}
                ref={(el) => { taskRefs.current[i] = el; }}
                className="flex items-center gap-4 py-3 border-b border-dark-gray/30 opacity-0 will-transform"
              >
                <div className="task-check w-5 h-5 border border-neutral/30 flex items-center justify-center flex-shrink-0 opacity-0 scale-0">
                  <Check size={12} className="text-accent" />
                </div>
                <span className="task-text font-mono text-sm tracking-widest uppercase text-paper">
                  <span className="text-neutral/40 mr-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {task}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div ref={doneRef} className="absolute text-display text-paper opacity-0 will-transform font-black">
          DONE
        </div>

        <div ref={takenRef} className="absolute text-center opacity-0 will-transform font-black">
          <p className="text-section text-paper">ACTION</p>
          <p className="text-section text-accent">TAKEN.</p>
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Action Pipeline</p>
        </div>
      </div>
    </section>
  );
}
