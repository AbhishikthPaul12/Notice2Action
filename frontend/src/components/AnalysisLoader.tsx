import React, { useState, useEffect } from 'react';
import { FileText, Cpu } from 'lucide-react';

const steps = [
  { id: '01', title: 'READING DOCUMENT GEOMETRY', subtitle: 'Extracting raw paragraphs & structure' },
  { id: '02', title: 'SCANNING FOR TIME-CRITICAL DEADLINES', subtitle: 'Analyzing dates & countdown urgency' },
  { id: '03', title: 'PARSING ELIGIBILITY CRITERIA', subtitle: 'Evaluating conditions and prerequisites' },
  { id: '04', title: 'STRUCTURING ACTION CHECKLIST', subtitle: 'Formulating step-by-step resolution plan' },
];

export default function AnalysisLoader() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [counter, setCounter] = useState(18);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    const counterTimer = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 12) + 4;
      });
    }, 250);

    return () => {
      clearInterval(stepTimer);
      clearInterval(counterTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-14 text-center max-w-xl mx-auto my-6 bg-ink border border-neutral/20 rounded-xl text-paper relative overflow-hidden">
      {/* Animated subtle scanline */}
      <div className="absolute inset-x-0 h-px bg-accent/60 shadow-[0_0_12px_#5B6CFF] animate-pulse" style={{ top: `${(currentStepIndex + 1) * 20}%` }} />

      {/* Top technical tag */}
      <div className="flex items-center gap-2 mb-6">
        <Cpu size={14} className="text-accent animate-spin" />
        <span className="text-[10px] font-mono tracking-[0.25em] text-accent uppercase">
          INTELLIGENCE PIPELINE ENGAGED
        </span>
      </div>

      {/* Main Counter */}
      <div className="mb-6">
        <span className="font-mono text-5xl md:text-6xl font-black tracking-tight text-paper tabular-nums">
          {String(Math.min(counter, 99)).padStart(2, '0')}%
        </span>
      </div>

      {/* Active Step */}
      <div className="h-14 flex flex-col items-center justify-center">
        <p className="text-sm md:text-base font-mono font-bold tracking-wider text-paper uppercase">
          <span className="text-accent mr-2">{steps[currentStepIndex].id} //</span>
          {steps[currentStepIndex].title}
        </p>
        <p className="text-xs font-mono text-neutral/70 mt-1">
          {steps[currentStepIndex].subtitle}
        </p>
      </div>

      {/* Stepper lines */}
      <div className="grid grid-cols-4 gap-2 w-full mt-8 pt-6 border-t border-neutral/15">
        {steps.map((step, idx) => (
          <div key={step.id} className="text-left">
            <div className={`h-1 w-full rounded-full transition-colors duration-300 ${
              idx <= currentStepIndex ? 'bg-accent shadow-[0_0_6px_rgba(91,108,255,0.6)]' : 'bg-neutral/20'
            }`} />
            <span className="text-[9px] font-mono text-neutral/60 mt-1.5 block tabular-nums">
              STEP {step.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
