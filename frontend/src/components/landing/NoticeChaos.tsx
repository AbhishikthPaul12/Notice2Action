import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const noticeContent = {
  header: 'NOTICE NO. 47/2026',
  title: 'APPLICATION FOR NATIONAL MERIT SCHOLARSHIP',
  sections: [
    {
      heading: 'ELIGIBILITY',
      lines: [
        'Candidates currently enrolled in the final year of their undergraduate programme at any recognized institution are eligible to apply for the National Merit Scholarship for Academic Year 2026–27.',
        'Applicants must have obtained a minimum cumulative grade point average of 7.5 on a 10-point scale or equivalent percentage in their most recent semester examination.',
        'Students who have previously received any other government scholarship during the current academic year shall not be eligible.',
      ],
    },
    {
      heading: 'IMPORTANT INFORMATION',
      lines: [
        'Applicants must submit their completed application through the official online portal. Physical submissions shall not be accepted under any circumstances.',
        'All supporting documents must be self-attested and uploaded in PDF format. Each document must not exceed 2 MB in file size.',
        'Incomplete applications or those received after the deadline will be automatically rejected without further notification.',
      ],
    },
    {
      heading: 'DOCUMENTS REQUIRED',
      lines: [
        '1. Valid government-issued photo identity proof (Aadhaar Card / Passport / Voter ID)',
        '2. Academic mark sheets and grade cards for all completed semesters',
        '3. Recent passport-size photograph (taken within the last 3 months)',
        '4. Income certificate issued by competent authority (if applicable)',
        '5. Caste/category certificate (if claiming reservation benefits)',
        '6. Completed and signed application form (Form N2A-47)',
      ],
    },
    {
      heading: 'SUBMISSION PROCEDURE',
      lines: [
        'Step 1: Register on the National Scholarship Portal using a valid email address and mobile number.',
        'Step 2: Complete the online application form with accurate personal and academic details.',
        'Step 3: Upload all required documents in the prescribed format.',
        'Step 4: Review the application summary and submit.',
        'Step 5: Take a printout of the acknowledgement receipt for your records.',
      ],
    },
    {
      heading: 'IMPORTANT DATES',
      lines: [
        'Portal Opens: 01 August 2026',
        'Last Date for Submission: 18 September 2026',
        'Deficiency Correction Window: 19 September – 25 September 2026',
        'Result Declaration: 15 October 2026',
      ],
    },
  ],
  footer: 'Issued by the Office of the Director of Scholarships\nMinistry of Education (Fictional)\nDate of Issue: 15 July 2026',
};

export default function NoticeChaos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !docRef.current) return;

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

      tl.fromTo(docRef.current, 
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2 }
      );

      const lines = lineRefs.current.filter(Boolean);
      
      lines.forEach((line, i) => {
        if (!line) return;
        tl.to(line, {
          y: (i % 3 === 0) ? -8 : (i % 3 === 1) ? 12 : 0,
          opacity: (i % 4 === 0) ? 1 : 0.4,
          scale: (i % 5 === 0) ? 1.05 : 0.95,
          duration: 0.3,
        }, 0.25 + i * 0.005);
      });

      const importantIndices = [0, 3, 7, 15, 22, 28];
      lines.forEach((line, i) => {
        if (!line) return;
        const isImportant = importantIndices.includes(i);
        tl.to(line, {
          opacity: isImportant ? 1 : 0.12,
          scale: isImportant ? 1.02 : 0.9,
          y: isImportant ? 0 : (Math.random() - 0.5) * 30,
          color: isImportant ? '#080808' : undefined,
          duration: 0.3,
        }, 0.55 + i * 0.003);
      });

      tl.to(docRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.15,
      }, 0.85);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  const addLineRef = (el: HTMLElement | null) => {
    if (el && !lineRefs.current.includes(el)) {
      lineRefs.current.push(el);
    }
  };

  return (
    <section
      ref={containerRef}
      data-scene="notice-chaos"
      className="relative w-full min-h-screen overflow-hidden"
      style={{ backgroundColor: '#F4F2EC' }}
      aria-label="The Problem — a dense notice"
    >
      <div className="w-full h-screen flex items-center justify-center px-4 md:px-16">
        <div
          ref={docRef}
          className="max-w-3xl w-full opacity-0"
          style={{ maxHeight: '85vh', overflow: 'hidden' }}
        >
          <div className="text-center mb-8">
            <p ref={addLineRef} className="doc-heading text-[0.65rem] text-neutral mb-1">
              {noticeContent.header}
            </p>
            <h2 ref={addLineRef} className="doc-heading text-base md:text-lg text-ink font-bold">
              {noticeContent.title}
            </h2>
            <div ref={addLineRef} className="w-16 h-px bg-ink/30 mx-auto mt-4" />
          </div>

          {noticeContent.sections.map((section, si) => (
            <div key={si} className="mb-5">
              <h3 ref={addLineRef} className="doc-heading text-xs mb-2 mt-4 font-bold">{section.heading}</h3>
              {section.lines.map((line, li) => (
                <p
                  key={li}
                  ref={addLineRef}
                  className="doc-text mb-1.5 will-transform"
                >
                  {line}
                </p>
              ))}
            </div>
          ))}

          <div ref={addLineRef} className="mt-6 pt-4 border-t border-ink/10">
            <p className="doc-text text-neutral whitespace-pre-line text-[0.6rem]">
              {noticeContent.footer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
