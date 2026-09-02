import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSceneOptions {
  scrub?: number;
  pin?: boolean;
  start?: string;
  end?: string;
  markers?: boolean;
  onUpdate?: (self: ScrollTrigger) => void;
}

export function useScrollScene(
  triggerRef: React.RefObject<HTMLElement | null>,
  buildTimeline: (tl: gsap.core.Timeline) => void,
  options: ScrollSceneOptions = {}
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          scrub: options.scrub ?? 0.8,
          pin: options.pin ?? true,
          start: options.start ?? 'top top',
          end: options.end ?? '+=300%',
          markers: options.markers ?? false,
          anticipatePin: 1,
          onUpdate: options.onUpdate,
        },
      });

      buildTimeline(tl);
      tlRef.current = tl;
    }, triggerRef.current);

    return () => {
      ctx.revert();
    };
  }, [triggerRef, buildTimeline, options]);

  return tlRef;
}
