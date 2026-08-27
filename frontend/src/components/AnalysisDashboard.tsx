import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Loader2,
  Trash2,
  Bookmark,
  FileText
} from 'lucide-react';
import { NoticeAnalysis, SavedNotice, ActionItem } from '../types';
import { askQuestion } from '../services/api';

interface AnalysisDashboardProps {
  analysis: NoticeAnalysis | SavedNotice;
  onSave?: (updated: SavedNotice) => void;
  onDelete?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AnalysisDashboard({ analysis, onSave, onDelete }: AnalysisDashboardProps) {
  const [actions, setActions] = useState<ActionItem[]>(analysis.actions || []);
  const [isSourceCollapsed, setIsSourceCollapsed] = useState(true);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync actions state with props
  useEffect(() => {
    setActions(analysis.actions || []);
    setMessages([]);
    setAskError(null);
  }, [analysis]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const completedCount = actions.filter((a) => a.completed).length;
  const progressPercent = actions.length > 0 ? Math.round((completedCount / actions.length) * 150) : 0; // standard progress width

  const handleActionToggle = (index: number) => {
    const updated = actions.map((item, idx) => 
      idx === index ? { ...item, completed: !item.completed } : item
    );
    setActions(updated);

    if (onSave) {
      const savedNotice: SavedNotice = {
        ...analysis,
        id: (analysis as SavedNotice).id || 'current-notice',
        timestamp: (analysis as SavedNotice).timestamp || Date.now(),
        actions: updated
      };
      onSave(savedNotice);
    }
  };

  const handleAsk = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isAsking) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');
    setIsAsking(true);
    setAskError(null);

    try {
      const answerText = await askQuestion(
        analysis.extracted_text || `${analysis.title}\n\n${analysis.summary}`,
        trimmed
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: answerText }]);
    } catch (err: any) {
      setAskError(err.message || 'Could not connect to analysis engine.');
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    'What do I need to submit?',
    'When is the deadline?',
    'Who is eligible?',
    'What happens if I miss the deadline?'
  ];

  // Helper for rendering urgency badges
  const getUrgencyStyles = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-700',
          indicator: 'bg-rose-500',
          label: 'High Urgency'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-700',
          indicator: 'bg-amber-500',
          label: 'Medium Urgency'
        };
      case 'low':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-700',
          indicator: 'bg-emerald-500',
          label: 'Low Urgency'
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-200',
          text: 'text-slate-600',
          indicator: 'bg-slate-400',
          label: 'Unknown Urgency'
        };
    }
  };

  const urgencyInfo = getUrgencyStyles(analysis.deadline?.urgency);

  const downloadIcsFile = () => {
    const title = analysis.title || 'Notice Deadline';
    const description = analysis.summary || 'Notice2Action Reminder';
    const dateStr = analysis.deadline?.date || '';
    
    const now = new Date();
    const startDate = dateStr && !isNaN(Date.parse(dateStr)) ? new Date(dateStr) : new Date(now.getTime() + 86400000);
    const startIso = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';
    const endDate = new Date(startDate.getTime() + 3600000);
    const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Notice2Action//College Notice Assistant//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, ' ')}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Detail View Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-6 mb-8">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700">
              <CheckCircle2 size={12} />
              AI Notice Insights
            </span>
            {analysis.category && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                {analysis.category}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2 line-clamp-2 max-w-3xl leading-snug">
            {analysis.title}
          </h2>
        </div>
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-rose-600 border border-rose-200 hover:bg-rose-50/50 transition-colors self-start sm:self-center"
          >
            <Trash2 size={16} />
            Delete Notice
          </button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Summary & Actions Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Plain English Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3">
              What's this notice about?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Action Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Your Action Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete these steps before the deadline.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                  {completedCount} of {actions.length} completed
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {actions.length > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${(completedCount / actions.length) * 100}%` }}
                />
              </div>
            )}

            {/* Checklist */}
            {actions.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">No required actions detected.</p>
            ) : (
              <div className="space-y-3">
                {actions.map((item, idx) => (
                  <label
                    key={idx}
                    className={`
                      flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all duration-200
                      ${item.completed 
                        ? 'border-indigo-100 bg-indigo-50/20' 
                        : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/50'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleActionToggle(idx)}
                      className="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col text-left">
                      <span className={`text-sm font-medium leading-relaxed transition-all duration-250 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {item.task}
                      </span>
                      <span className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${item.completed ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {item.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Who is eligible?
              </h3>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={12} />
                YOU ARE ELIGIBLE
              </span>
            </div>
            {analysis.eligibility?.length === 0 ? (
              <p className="text-sm text-slate-500">No specific eligibility requirements detected.</p>
            ) : (
              <ul className="space-y-3">
                {analysis.eligibility.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs mt-0.5">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Important Points Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
              Important Points
            </h3>
            {analysis.important_points?.length === 0 ? (
              <p className="text-sm text-slate-500">No additional important points detected.</p>
            ) : (
              <div className="space-y-3">
                {analysis.important_points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3.5 rounded-xl border border-slate-150 bg-slate-50/50 p-4">
                    <AlertTriangle size={18} className="text-amber-650 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-750 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Notice Source */}
          {analysis.extracted_text && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left">
              <button
                onClick={() => setIsSourceCollapsed(!isSourceCollapsed)}
                className="flex w-full items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-slate-500" />
                  View extracted notice source
                </span>
                {isSourceCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              
              {!isSourceCollapsed && (
                <div className="border-t border-slate-150 px-6 py-4 bg-slate-50/50">
                  <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {analysis.extracted_text}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Key Metadata and QA Panel */}
        <div className="space-y-6">
          
          {/* Key Insight Cards Summary */}
          <div className="grid grid-cols-2 gap-4">
            {/* Deadline status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                <Calendar size={16} />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Deadline</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block line-clamp-1">
                {analysis.deadline?.date || (analysis.deadline?.relative_days ? `Within ${analysis.deadline.relative_days} days` : 'Not specified')}
              </span>
            </div>

            {/* Urgency status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 mb-3">
                <AlertTriangle size={16} />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Urgency</span>
              <span className={`inline-flex items-center gap-1 text-sm font-bold mt-1 uppercase ${urgencyInfo.text}`}>
                <span className={`h-2 w-2 rounded-full ${urgencyInfo.indicator}`} />
                {analysis.deadline?.urgency || 'unknown'}
              </span>
            </div>

            {/* Actions Count */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Actions</span>
              <span className="text-sm font-bold text-slate-850 mt-1 block">
                {actions.length} items
              </span>
            </div>

            {/* Eligibility Count */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                <Users size={16} />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Eligibility</span>
              <span className="text-sm font-bold text-slate-850 mt-1 block">
                {analysis.eligibility?.length || 0} requirements
              </span>
            </div>
          </div>

          {/* Expanded Deadline Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Deadline Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium">Target Date & Time</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5">
                    {analysis.deadline?.date || 'Not specified'} 
                    {analysis.deadline?.time ? ` at ${analysis.deadline.time}` : ''}
                  </span>
                </div>
              </div>

              {analysis.deadline?.relative_days !== null && (
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600 font-bold text-[10px] shrink-0 mt-0.5">
                    R
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Relative Timeline</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5">
                      {analysis.deadline?.relative_days} days from publication
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                  ✏️
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium">Description</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {analysis.deadline?.description || 'No deadline details provided in the text.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={downloadIcsFile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs py-2.5 transition-colors border border-indigo-100"
                >
                  <Calendar size={14} />
                  Add to Calendar (.ics)
                </button>
              </div>
            </div>
          </div>

          {/* Ask Notice2Action Panel (Major Feature) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left flex flex-col h-[500px]">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-650" />
                Ask Notice2Action
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask anything about the uploaded notice.
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-3 mb-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs font-semibold text-slate-600 mt-2">I've parsed this notice.</span>
                  <span className="text-[10px] text-slate-400 mt-1">Ask questions or select a suggestion below.</span>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-auto rounded-tr-none text-right'
                      : 'bg-white text-slate-800 border border-slate-150 mr-auto rounded-tl-none text-left'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              ))}

              {isAsking && (
                <div className="bg-white text-slate-800 border border-slate-150 mr-auto rounded-2xl rounded-tl-none px-4 py-2.5 text-sm flex items-center gap-2 max-w-[80%]">
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                </div>
              )}

              {askError && (
                <div className="text-xs bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-800">
                  {askError}
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Suggested prompts list (only shown when conversation is fresh) */}
            {messages.length === 0 && (
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Suggested Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q)}
                      className="text-[11px] font-medium bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-100 rounded-lg px-2.5 py-1.5 transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(question);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="e.g. What documents do I need?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isAsking}
                className="flex-1 rounded-xl border border-slate-250 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
