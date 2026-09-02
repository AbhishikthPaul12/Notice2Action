import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const notices = [
  { id: '01', title: 'SCHOLARSHIP APPLICATION', urgency: 'HIGH', days: '2 DAYS', urgencyColor: '#5B6CFF' },
  { id: '02', title: 'INTERNSHIP CIRCULAR', urgency: 'MEDIUM', days: '12 DAYS', urgencyColor: '#F4F2EC' },
  { id: '03', title: 'EXAMINATION NOTICE', urgency: 'LOW', days: '31 DAYS', urgencyColor: '#A8A8A0' },
];

export default function NoticeHistory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
          },
        }
      );

      itemRefs.current.forEach((ref, i) => {
        if (!ref) return;
        gsap.fromTo(ref,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: ref,
              start: 'top 85%',
            },
          }
        );
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scene="notice-history"
      className="relative w-full min-h-screen bg-ink py-24 md:py-32 px-6 md:px-16 text-paper"
      aria-label="My Notices"
    >
      <div className="max-w-4xl mx-auto">
        <div ref={headingRef} className="mb-16 opacity-0">
          <p className="text-technical text-accent mb-3">Notice Archive</p>
          <h2 className="text-section text-paper font-bold">MY NOTICES</h2>
        </div>

        <div>
          {notices.map((notice, i) => (
            <motion.div
              key={notice.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="opacity-0 border-t border-neutral/15 py-6 md:py-8 cursor-pointer group"
              whileHover={{ x: 8 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                <div className="flex items-start gap-6">
                  <span className="font-mono text-3xl md:text-4xl font-light text-neutral/25 tabular-nums leading-none">
                    {notice.id}
                  </span>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-paper tracking-tight uppercase group-hover:text-accent transition-colors duration-300">
                      {notice.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6 ml-12 md:ml-0">
                  <span
                    className="text-xs font-mono tracking-widest uppercase font-bold"
                    style={{ color: notice.urgencyColor }}
                  >
                    {notice.urgency}
                  </span>
                  <span className="text-technical tabular-nums">{notice.days}</span>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="border-t border-neutral/15" />
        </div>
      </div>
    </section>
  );
}
