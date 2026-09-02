import React from 'react';
import { Upload, HelpCircle, CheckSquare, Sparkles, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'UPLOAD NOTICE',
      description: 'Ingest complex college circulars, scholarships, or public announcements in PDF, DOCX, or TXT format.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'AI STRUCTURE SCAN',
      description: 'The intelligence engine extracts critical dates, eligibility rules, and important consequences in seconds.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'ACTION RESOLUTION',
      description: 'A prioritized checklist is assembled with required documents, verification steps, and calendar reminders.',
      icon: CheckSquare,
    },
    {
      step: '04',
      title: 'GROUNDED Q&A',
      description: 'Ask any specific question directly to the notice with source-verified contextual AI citations.',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10 text-paper text-left">
      {/* Page Header */}
      <div className="mb-12 border-b border-neutral/15 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-px bg-accent" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-accent uppercase font-semibold">
            METHODOLOGY // ARCHITECTURE
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-paper uppercase font-sans">
          HOW NOTICE2ACTION WORKS
        </h2>
        <p className="text-xs font-mono text-neutral/70 mt-2 max-w-xl leading-relaxed">
          Bridging the gap between passive, confusing circular documents and automated, prioritized action plans.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-14">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="relative rounded-xl border border-neutral/20 bg-dark-gray/60 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-accent border border-neutral/20">
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-2xl font-light text-neutral/30 select-none tabular-nums">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-mono font-bold text-paper tracking-wider uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-mono text-neutral/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before / After Showcase Section (Scene 13: The Transformation) */}
      <div className="rounded-xl border border-neutral/20 bg-dark-gray/40 p-6 md:p-10 shadow-2xl text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-[0.2em] text-accent uppercase font-semibold">
            TRANSFORMATION BENCHMARK
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-paper uppercase mb-2 font-sans">
          ONE NOTICE ──► ONE CLEAR PLAN
        </h3>
        <p className="text-xs font-mono text-neutral/70 mb-8">
          Comparing raw unstructured government circulars with the structured Notice2Action intelligence output.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Before Column */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-neutral/60 uppercase tracking-widest mb-2 block">
              [BEFORE] RAW UNSTRUCTURED NOTICE
            </span>
            <div className="flex-1 rounded-lg border border-neutral/20 bg-ink p-5 font-mono text-xs text-neutral/60 leading-relaxed">
              <p className="font-bold text-paper/80 uppercase mb-2">PUBLIC NOTICE NO. 47/2026</p>
              <p>
                Notice is hereby given that candidates currently enrolled in the final year of their undergraduate programme at any recognized institution are eligible to apply for the National Merit Scholarship for Academic Year 2026–27. Minimum CGPA of 7.5 is mandatory. Online applications must be submitted on or before 18 September 2026 along with ID proof, grade marksheets, and Form N2A-47. Incomplete submissions will be rejected without notification.
              </p>
            </div>
          </div>

          {/* After Column */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest mb-2 block font-semibold">
              [AFTER] RESOLVED ACTION PLAN
            </span>
            <div className="flex-1 rounded-lg border border-accent/30 bg-dark-gray/80 p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral/20 pb-2">
                <span className="font-bold text-paper">NATIONAL MERIT SCHOLARSHIP</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 font-bold uppercase">HIGH URGENCY</span>
              </div>
              
              <div>
                <span className="text-[10px] text-neutral/60 uppercase block">DEADLINE</span>
                <p className="text-sm font-bold text-paper">18 SEPTEMBER 2026</p>
              </div>

              <div>
                <span className="text-[10px] text-neutral/60 uppercase block mb-1.5">ACTION CHECKLIST</span>
                <div className="space-y-1.5 text-paper/90">
                  <div className="flex items-center gap-2">
                    <span className="text-accent">✓</span>
                    <span>Verify final-year CGPA ≥ 7.5 eligibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">✓</span>
                    <span>Upload ID proof + Academic mark sheets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">✓</span>
                    <span>Submit Form N2A-47 before 18 Sep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
