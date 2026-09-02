import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPContext(containerRef: React.RefObject<HTMLElement | null>) {
  const ctx = useRef<gsap.Context | null>(null);

  const createContext = useCallback(
    (callback: (self: gsap.Context) => void) => {
      if (!containerRef.current) return;
      ctx.current = gsap.context(callback, containerRef.current);
    },
    [containerRef]
  );

  useEffect(() => {
    return () => {
      ctx.current?.revert();
    };
  }, []);

  return { createContext, ctx };
}
