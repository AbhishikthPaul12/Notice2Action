import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const documentWords = [
  'APPLICATION', 'ELIGIBILITY', 'IMPORTANT', 'DOCUMENTS',
  'SUBMISSION', 'DEADLINE', 'REQUIRED', 'REGISTRATION',
];

const metadata = [
  'DOCUMENT INTELLIGENCE',
  'PDF / DOCX / TXT',
  'DEADLINES',
  'ELIGIBILITY',
  'TASKS',
  'ANSWERS',
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const twoRef = useRef<HTMLSpanElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Initial entrance animation
      const entrance = gsap.timeline({ delay: 1.4 });

      entrance
        .fromTo(noticeRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
        .fromTo(twoRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=0.4')
        .fromTo(actionRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=0.3')
        .fromTo(metaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2')
        .fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.1');

      // Scroll-triggered transformation: NOTICE letters scatter
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=250%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Fade out the "2" and "ACTION" text
      scrollTl
        .to(twoRef.current, { opacity: 0, y: -30, duration: 0.1 }, 0)
        .to(actionRef.current, { opacity: 0, y: -30, duration: 0.1 }, 0)
        .to(metaRef.current, { opacity: 0, duration: 0.05 }, 0)
        .to(scrollHintRef.current, { opacity: 0, duration: 0.05 }, 0);

      // Scatter NOTICE letters
      letterRefs.current.forEach((letter, i) => {
        if (!letter) return;
        const xOffset = (Math.random() - 0.5) * 600;
        const yOffset = (Math.random() - 0.5) * 400;
        const rotation = (Math.random() - 0.5) * 30;

        scrollTl.to(letter, {
          x: xOffset,
          y: yOffset,
          rotation,
          scale: 0.3 + Math.random() * 0.4,
          opacity: 0.15,
          duration: 0.3,
        }, 0.1 + i * 0.02);
      });

      // Fade in document words
      wordRefs.current.forEach((word, i) => {
        if (!word) return;
        scrollTl.fromTo(word, 
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.15 },
          0.3 + i * 0.05
        );
      });

      // Final zoom into the document
      scrollTl.to('.hero-inner', {
        scale: 1.3,
        opacity: 0.7,
        duration: 0.3,
      }, 0.7);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="hero"
      className="relative w-full min-h-screen bg-ink overflow-hidden text-paper"
      aria-label="Hero section"
    >
      <div className="hero-inner relative w-full h-screen flex flex-col items-center justify-center px-4">
        {/* NOTICE */}
        <div ref={noticeRef} className="relative opacity-0">
          <div className="text-hero text-paper flex" aria-label="Notice">
            {'NOTICE'.split('').map((char, i) => (
              <span
                key={i}
                ref={(el) => { letterRefs.current[i] = el; }}
                className="inline-block will-transform"
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* 2 */}
        <span
          ref={twoRef}
          className="text-display text-accent opacity-0 -mt-4 md:-mt-8"
          style={{ fontSize: 'clamp(4rem, 10vw, 14vw)' }}
        >
          2
        </span>

        {/* ACTION */}
        <div ref={actionRef} className="text-hero text-paper opacity-0 -mt-2 md:-mt-6" aria-label="Action">
          ACTION
        </div>

        {/* Technical metadata */}
        <div ref={metaRef} className="absolute top-8 right-6 md:right-10 text-right opacity-0">
          {metadata.map((item, i) => (
            <p key={i} className="text-technical leading-relaxed">{item}</p>
          ))}
        </div>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className="absolute bottom-8 right-6 md:right-10 opacity-0">
          <p className="text-technical">Scroll to process ↓</p>
        </div>

        {/* Document words (appear during scroll) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {documentWords.map((word, i) => (
            <div
              key={word}
              ref={(el) => { wordRefs.current[i] = el; }}
              className="text-subsection text-paper/80 opacity-0 my-1"
              style={{
                transform: `translateX(${(i % 2 === 0 ? -1 : 1) * (10 + i * 5)}%)`,
              }}
            >
              {word}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
