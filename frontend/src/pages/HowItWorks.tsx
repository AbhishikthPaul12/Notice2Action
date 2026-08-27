import React from 'react';
import { Upload, HelpCircle, CheckSquare, Sparkles, Calendar, AlertTriangle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload Notice',
      description: 'Upload any notice, circular, public notice or PDF announcement up to 10MB in size.',
      icon: Upload,
      color: 'bg-indigo-50 text-indigo-650',
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'The AI extracts critical dates, eligibility rules, and important consequences instantly.',
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-650',
    },
    {
      step: '03',
      title: 'Action Checklist',
      description: 'A structured checklist is generated so you know exactly what tasks you need to complete.',
      icon: CheckSquare,
      color: 'bg-indigo-50 text-indigo-650',
    },
    {
      step: '04',
      title: 'Stay on Track',
      description: 'Monitor your progress, save to history, and ask the AI follow-up questions directly.',
      icon: HelpCircle,
      color: 'bg-indigo-50 text-indigo-650',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-905">
          How Notice2Action Works
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Notice2Action bridges the gap between passive reading and taking proactive actions on unstructured notices.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16 text-left">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="relative rounded-2xl border border-slate-205 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-2xl font-black text-slate-100 select-none">
                  {item.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Before / After Showcase Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-left">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
          The Transformation
        </h3>
        <p className="text-xs text-slate-500 mb-8">
          See how unstructured circulars are converted into actionable milestones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Visual separator on desktops */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-slate-200" />

          {/* Before Column */}
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              🔴 Unstructured Input (Before)
            </span>
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 select-none">PUBLIC NOTICE SAMPLE</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                Notice is hereby given to the public that our client intends to purchase the property described below. 
                Any person having any claim, right, title or interest in the said property must make the same known in 
                writing along with documentary proof within fourteen days from the date of publication of this notice, 
                failing which the transaction will be completed without any reference to such claims and the claims, 
                if any, shall be deemed to have been waived.
              </p>
            </div>
          </div>

          {/* After Column */}
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-650 uppercase tracking-wider mb-3">
              🟢 Actionable Dashboard (After)
            </span>
            <div className="flex-1 rounded-xl border border-indigo-100 bg-indigo-50/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">Public Claim regarding Property Sale</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-bold uppercase">High</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} />
                  Deadline
                </span>
                <p className="text-[11px] font-semibold text-slate-700 leading-none">Within 14 days from date of publication</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare size={10} />
                  Action Plan
                </span>
                <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                  <div className="flex items-start gap-1.5">
                    <input type="checkbox" readOnly checked={false} className="mt-0.5 h-3 w-3 rounded text-indigo-600" />
                    <span>Make claim known in writing</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <input type="checkbox" readOnly checked={false} className="mt-0.5 h-3 w-3 rounded text-indigo-600" />
                    <span>Provide documentary proof supporting claim</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <input type="checkbox" readOnly checked={false} className="mt-0.5 h-3 w-3 rounded text-indigo-600" />
                    <span>Submit within 14 days from publication</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Consequence Warning
                </span>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Failure to claim may result in the transaction proceeding without reference to your claim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
