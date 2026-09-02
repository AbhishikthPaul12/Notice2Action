import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const conversation = [
  {
    type: 'Q',
    text: 'Can final-year students apply?',
  },
  {
    type: 'A',
    text: 'Yes.',
    detail: 'The notice states that candidates currently enrolled in the final year of their undergraduate programme are eligible.',
  },
  {
    type: 'Q',
    text: 'What documents do I need?',
  },
  {
    type: 'A',
    text: '',
    list: ['ID proof (Aadhaar / Passport / Voter ID)', 'Academic mark sheets', 'Passport-size photograph', 'Application form N2A-47'],
  },
];

export default function AskNotice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      tl.fromTo(headingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.1 }
      );

      tl.fromTo(subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.08 },
        0.08
      );

      tl.to(headingRef.current, { y: -120, opacity: 0.05, scale: 0.7, duration: 0.12 }, 0.18);
      tl.to(subRef.current, { y: -80, opacity: 0.05, scale: 0.7, duration: 0.12 }, 0.18);

      msgRefs.current.forEach((ref, i) => {
        if (!ref) return;
        tl.fromTo(ref,
          { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.1 },
          0.28 + i * 0.12
        );
      });

      tl.to('.ask-inner', {
        opacity: 0,
        duration: 0.1,
      }, 0.9);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="ask-notice"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Ask the Notice — AI Q&A"
    >
      <div className="ask-inner relative w-full h-screen flex items-center justify-center px-6">
        <div ref={headingRef} className="absolute text-section text-paper opacity-0 will-transform font-bold">
          HAVE A QUESTION?
        </div>
        <div ref={subRef} className="absolute text-section text-accent opacity-0 will-transform font-bold" style={{ marginTop: '12vh' }}>
          ASK THE NOTICE.
        </div>

        <div className="max-w-lg w-full flex flex-col gap-6">
          {conversation.map((msg, i) => (
            <div
              key={i}
              ref={(el) => { msgRefs.current[i] = el; }}
              className={`opacity-0 will-transform ${
                msg.type === 'Q' ? 'self-end text-right' : 'self-start'
              }`}
            >
              <span className={`text-technical mb-2 block ${
                msg.type === 'Q' ? 'text-neutral' : 'text-accent'
              }`}>
                {msg.type === 'Q' ? 'Q' : 'A'}
              </span>

              {msg.type === 'Q' ? (
                <p className="text-lg md:text-xl text-paper/80 font-light italic">
                  {msg.text}
                </p>
              ) : (
                <div>
                  {msg.text && (
                    <p className="text-lg md:text-xl font-semibold text-paper mb-2">
                      {msg.text}
                    </p>
                  )}
                  {msg.detail && (
                    <p className="text-sm text-neutral leading-relaxed">
                      {msg.detail}
                    </p>
                  )}
                  {msg.list && (
                    <div className="mt-2">
                      {msg.list.map((item, li) => (
                        <p key={li} className="text-sm text-paper/70 py-1 font-mono">
                          <span className="text-accent mr-2 tabular-nums">{String(li + 1).padStart(2, '0')}</span>
                          {item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.type === 'A' && (
                <p className="text-[0.6rem] text-neutral/50 mt-2 font-mono uppercase tracking-widest">
                  Source: Notice No. 47/2026
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-6 md:left-10">
          <p className="text-technical">Contextual Q&A</p>
        </div>
      </div>
    </section>
  );
}
