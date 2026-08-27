import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function AnalysisLoader() {
  const steps = [
    'Reading your notice...',
    'Extracting important information...',
    'Identifying deadlines...',
    'Building your action plan...',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-8">
      {/* Dynamic pulsating indicator */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
        <Sparkles size={32} className="animate-pulse" />
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
        Analyzing Document
      </h3>
      
      {/* Animated text transition */}
      <p className="text-sm font-medium text-indigo-600 mt-2 h-6 animate-pulse">
        {steps[currentStepIndex]}
      </p>

      {/* Modern skeleton simulation */}
      <div className="w-full mt-8 space-y-3.5">
        <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-full w-5/6 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3 mx-auto animate-pulse" />
        
        <div className="pt-4 flex justify-center gap-3">
          <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
