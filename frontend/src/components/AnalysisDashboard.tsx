import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Loader2, 
  Trash2, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Building, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  MapPin 
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

// Client-side dynamic metadata parser to guarantee unique metrics per notice
function deriveDynamicMetrics(analysis: NoticeAnalysis | SavedNotice) {
  const rawText = (analysis.extracted_text || `${analysis.title}\n${analysis.summary}`).trim();
  const lower = rawText.lower ? rawText.lower() : rawText.toLowerCase();
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Notice Type
  let noticeType = analysis.notice_type || analysis.category;
  if (!noticeType || noticeType === 'General Notice' || noticeType === 'General Announcement') {
    if (/scholarship|fellowship|financial aid|grant/i.test(lower)) noticeType = 'Scholarship / Grant';
    else if (/registration|course registration|academic registration|enrollment/i.test(lower)) noticeType = 'Academic Registration';
    else if (/examination|exam timetable|exam schedule|hall ticket|admit card/i.test(lower)) noticeType = 'Examination Notice';
    else if (/admission|counseling|seat allotment/i.test(lower)) noticeType = 'Admission Notification';
    else if (/claim|property|title deed|court|legal|objection/i.test(lower)) noticeType = 'Legal Claim / Public Notice';
    else if (/recruitment|vacancy|walk-in interview|job post/i.test(lower)) noticeType = 'Recruitment Notification';
    else if (/tender|quotation|procurement|bid/i.test(lower)) noticeType = 'Tender / Procurement';
    else if (/fee|dues|payment/i.test(lower)) noticeType = 'Fee Payment Circular';
    else noticeType = 'Official Announcement';
  }

  // 2. Target Audience
  let targetAudience = analysis.target_audience;
  const branchRegex = /(?:cse|ece|it|eee|mech|mechanical|civil|aids|aiml|csbs|csd|iot|cyber\s*security|computer\s*science(?:\s*(?:and|&)\s*engineering)?|information\s*technology|b\.?tech|m\.?tech|mca|mba)/i;
  const yearRegex = /(?:[1-4](?:st|nd|rd|th)?\s*year|first\s*year|second\s*year|third\s*year|fourth\s*year|final\s*year)/i;

  if (!targetAudience || targetAudience === 'All Concerned Stakeholders' || targetAudience === 'Specified Candidates' || targetAudience === 'All Enrolled Students' || targetAudience === 'All Students') {
    // 1. Check Branch + Year (e.g. "CSE students 2nd year", "CSE 2nd year students")
    const bym = rawText.match(new RegExp(`\\b(${branchRegex.source}\\s*(?:students?|candidates?)?\\s*(?:of\\s+)?${yearRegex.source}(?:\\s*students?)?[^\\n\\r\\.;]{0,30})`, 'i'));
    // 2. Check Year + Branch (e.g. "2nd year CSE students", "2nd year CSE")
    const ybm = rawText.match(new RegExp(`\\b(${yearRegex.source}\\s*(?:of\\s+)?${branchRegex.source}(?:\\s*students?)?[^\\n\\r\\.;]{0,30})`, 'i'));
    // 3. Check Branch students
    const bsm = rawText.match(new RegExp(`\\b(${branchRegex.source}\\s+students?(?:\\s*only)?)\\b`, 'i'));

    if (bym) targetAudience = bym[1].trim();
    else if (ybm) targetAudience = ybm[1].trim();
    else if (bsm) targetAudience = bsm[1].trim();
    else if (/2nd year|second year/i.test(lower)) targetAudience = '2nd Year Students';
    else if (/final year|4th year/i.test(lower)) targetAudience = 'Final Year Students';
    else if (/3rd year|third year/i.test(lower)) targetAudience = '3rd Year Students';
    else if (/1st year|first year/i.test(lower)) targetAudience = '1st Year Students';
    else if (/all students|registered students/i.test(lower)) targetAudience = 'All Students';
    else if (/undergraduate/i.test(lower)) targetAudience = 'Undergraduate Students';
    else if (/postgraduate|m\.tech|ph\.d/i.test(lower)) targetAudience = 'Postgraduate / Research Scholars';
    else if (/faculty|staff/i.test(lower)) targetAudience = 'Faculty & Staff';
    else if (/claimant|property|public/i.test(lower)) targetAudience = 'General Public / Interested Claimants';
    else if (/bidder|contractor/i.test(lower)) targetAudience = 'Eligible Contractors & Bidders';
    else targetAudience = 'Concerned Stakeholders';
  }

  // 3. Action Required
  let actionRequired = analysis.action_required;
  if (!actionRequired || actionRequired.includes('Review notice and complete')) {
    if (/online registration|register online/i.test(lower)) actionRequired = 'Complete online registration on portal';
    else if (/submit application|apply online/i.test(lower)) actionRequired = 'Submit online application with documents';
    else if (/make claim|objection|claim in writing/i.test(lower)) actionRequired = 'Submit written objection/claim with documentary proof';
    else if (/fee payment|pay exam fee|deposit fee/i.test(lower)) actionRequired = 'Pay prescribed fee before closing date';
    else if (analysis.actions && analysis.actions.length > 0) actionRequired = analysis.actions[0].task;
    else actionRequired = 'Review terms and follow circular directives';
  }

  // 4. Start Date
  let startDate = analysis.start_date;
  if (!startDate) {
    const startMatch = rawText.match(/(?:opens?|starts?|from|commencing)\s*[:\-–]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
    if (startMatch) startDate = startMatch[1];
    else startDate = 'Not specified / Immediate';
  }

  // 5. Penalty
  let penalty = analysis.penalty;
  if (!penalty) {
    const penMatch = rawText.match(/(?:late registrations? will attract|late fee of|penalty of|fine of|late fee|penalty|fine|failing which|failure to|will not be entertained|rejected without)\s*[:\-–]?\s*([^\n\r\.;]{5,60})/i);
    if (penMatch) penalty = penMatch[0].trim();
    else penalty = 'None mentioned';
  }

  // 6. Where to Act
  let whereToAct = analysis.where_to_act;
  if (!whereToAct) {
    if (/national scholarship portal|nsp/i.test(lower)) whereToAct = 'National Scholarship Portal';
    else if (/student portal/i.test(lower)) whereToAct = 'Student Portal';
    else if (/college portal/i.test(lower)) whereToAct = 'College Portal';
    else if (/admission portal/i.test(lower)) whereToAct = 'Admission Portal';
    else if (/college office|admin office/i.test(lower)) whereToAct = 'Academic Administration Office';
    else {
      const whereMatch = rawText.match(/(?:where to apply|where to act|submit at|register at)\s*[:\-–]?\s*([A-Za-z0-9\.\-_/:\s]{4,40})/i);
      if (whereMatch) whereToAct = whereMatch[1].trim();
      else if (/portal|online/i.test(lower)) whereToAct = 'Official Online Portal';
      else whereToAct = 'Refer to official circular instructions';
    }
  }

  // 7. Contact
  let contact = analysis.contact;
  if (!contact) {
    const contactMatch = rawText.match(/(?:contact|office of|authority|inquiries|reach out to|issued by)\s*[:\-–]\s*([^\n\r\.;]{4,50})/i);
    if (contactMatch) contact = contactMatch[1].trim();
    else if (/student financial aid/i.test(lower)) contact = 'Student Financial Aid Cell';
    else if (/examination/i.test(lower)) contact = 'Controller of Examinations';
    else if (/head of department|hod/i.test(lower)) contact = 'Head of Department';
    else if (/advocate|legal/i.test(lower)) contact = 'Legal Counsel / Advocate Office';
    else contact = 'Issuing Department';
  }

  // 8. Eligibility Criteria
  let eligibility = analysis.eligibility || [];
  if (eligibility.length === 0) {
    const singleElig = rawText.match(/(?:eligibility criteria|eligibility|who is eligible|who can apply|eligible branches|eligible candidates?)\s*[:\-–]\s*([^\n\r]+)/i);
    if (singleElig) {
      const firstLine = singleElig[1].replace(/^\s*(?:\d+[\.\)]|\•|\-|\*)\s*/, '').trim();
      if (firstLine.length >= 4) {
        eligibility.push(firstLine);
        const afterIdx = singleElig.index! + singleElig[0].length;
        const remaining = rawText.slice(afterIdx).split('\n');
        for (let i = 1; i < Math.min(remaining.length, 6); i++) {
          const rline = remaining[i].trim();
          if (/^\s*(?:\d+[\.\)]|\•|\-|\*)/.test(rline)) {
            const cln = rline.replace(/^\s*(?:\d+[\.\)]|\•|\-|\*)\s*/, '').trim();
            if (cln.length >= 5) eligibility.push(cln);
          } else {
            break;
          }
        }
      }
    }
    
    if (eligibility.length === 0) {
      const specBranch = rawText.match(new RegExp(`\\b((?:only\\s+)?(?:${yearRegex.source}\\s*(?:of\\s+)?${branchRegex.source}|${branchRegex.source}\\s*(?:students?|candidates?)?\\s*(?:of\\s+)?${yearRegex.source})[^\\n\\r\\.;]{0,40}(?:only|eligible|invited)?)`, 'i'));
      if (specBranch) {
        eligibility.push(specBranch[1].trim());
      }
    }
    
    if (eligibility.length === 0 && targetAudience && targetAudience !== 'Concerned Stakeholders') {
      eligibility.push(`${targetAudience} only.`);
    }
  }

  // 9. Documents Required
  let docs = analysis.documents_required || [];
  if (docs.length === 0) {
    const docSection = rawText.match(/(?:documents? required|enclosures?|attachments?)\s*[:\-–]?\s*([^\n\r]+(?:\n[^\n\r]+){0,4})/i);
    if (docSection) {
      docs = docSection[1].split(/[,;\n•\d+\.]/).map(d => d.trim()).filter(d => d.length > 2 && !/contact|dates|deadline|where/i.test(d));
    }
    if (docs.length === 0 && analysis.important_points) {
      docs = analysis.important_points.filter(p => /id|mark|photo|certificate|proof|deed|receipt|form/i.test(p));
    }
  }

  // 10. Deadline Display
  let deadlineDisplay = analysis.deadline?.date;
  if (deadlineDisplay) {
    if (analysis.deadline?.time) deadlineDisplay += ` (${analysis.deadline.time})`;
  } else if (analysis.deadline?.description) {
    deadlineDisplay = analysis.deadline.description;
  } else {
    deadlineDisplay = 'No fixed deadline stated';
  }

  // 11. Priority
  const isHigh = /urgent|immediately|mandatory|penalty|failing which|last chance/i.test(lower);
  const priority = analysis.priority || (isHigh ? '🔴 High' : analysis.deadline?.date ? '🟡 Medium' : '🟢 Low');
  const status = analysis.status || (analysis.deadline?.date || actionRequired ? 'Action Required' : 'Information Only');

  return {
    noticeType,
    targetAudience,
    eligibility,
    actionRequired,
    deadlineDisplay,
    startDate,
    penalty,
    docs,
    whereToAct,
    contact,
    priority,
    status
  };
}

export default function AnalysisDashboard({ analysis, onSave, onDelete }: AnalysisDashboardProps) {
  const [actions, setActions] = useState<ActionItem[]>(analysis.actions || []);
  const [isSourceCollapsed, setIsSourceCollapsed] = useState(true);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Compute 100% dynamic notice metrics for this specific document
  const metrics = useMemo(() => deriveDynamicMetrics(analysis), [analysis]);

  useEffect(() => {
    setActions(analysis.actions || []);
    setMessages([]);
    setAskError(null);
  }, [analysis]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const completedCount = actions.filter((a) => a.completed).length;
  const progressPercent = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0;

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

  const handleCopyPlan = () => {
    const text = `📋 NOTICE2ACTION EXTRACTED INTELLIGENCE: ${analysis.title}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Notice Type: ${metrics.noticeType}\n` +
      `• Target Audience: ${metrics.targetAudience}\n` +
      `• Eligibility: ${metrics.eligibility.join('; ') || 'Open'}\n` +
      `• Action Required: ${metrics.actionRequired}\n` +
      `• Deadline: ${metrics.deadlineDisplay}\n` +
      `• Start Date: ${metrics.startDate}\n` +
      `• Penalty: ${metrics.penalty}\n` +
      `• Documents Required: ${metrics.docs.join(', ') || 'None specified'}\n` +
      `• Where to Act: ${metrics.whereToAct}\n` +
      `• Contact: ${metrics.contact}\n` +
      `• Priority: ${metrics.priority}\n` +
      `• Status: ${metrics.status}\n\n` +
      `✅ ACTION PLAN:\n` +
      actions.map((a, i) => `${i + 1}. [${a.completed ? 'X' : ' '}] ${a.task}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  const downloadIcsFile = () => {
    const title = analysis.title || 'Notice Deadline';
    const description = analysis.summary || 'Notice2Action Reminder';
    const dateStr = analysis.deadline?.date || '';
    
    let dtStart = '20260915T090000Z';
    if (dateStr) {
      const clean = dateStr.replace(/[^0-9]/g, '');
      if (clean.length === 8) dtStart = `${clean}T090000Z`;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Notice2Action//Document Intelligence//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Deadline: ${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtStart}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder for Notice Deadline',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.substring(0, 20).replace(/\s+/g, '_')}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suggestedQuestions = [
    'What is the last date mentioned in this notice?',
    'What documents are required to submit?',
    'Who is eligible to participate or respond?',
    'Where should I submit the application or response?'
  ];

  return (
    <div className="w-full bg-ink text-paper text-left p-6 md:p-10 space-y-8 font-sans">
      {/* Top Bar / Header */}
      <div className="border-b border-neutral/15 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-accent uppercase font-semibold">
              DOCUMENT INTELLIGENCE // PARSED
            </span>
            <span className="text-[10px] font-mono text-neutral/50 uppercase">
              • {metrics.noticeType}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent/15 text-accent border border-accent/30">
              {metrics.status}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-paper uppercase font-sans">
            {analysis.title || 'Official Notice'}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadIcsFile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dark-gray border border-neutral/20 hover:border-accent text-xs font-mono uppercase tracking-wider text-paper transition-all cursor-pointer"
            title="Download Calendar Reminder (.ics)"
          >
            <Calendar size={13} className="text-accent" />
            <span>Add to Calendar</span>
          </button>

          <button
            onClick={handleCopyPlan}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dark-gray border border-neutral/20 hover:border-paper text-xs font-mono uppercase tracking-wider text-paper transition-all cursor-pointer"
            title="Copy Structured Intelligence Matrix"
          >
            {copiedPlan ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedPlan ? 'Copied' : 'Copy All Data'}</span>
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral/20 hover:border-rose-500 text-neutral hover:text-rose-400 text-xs font-mono transition-all cursor-pointer"
              title="Delete this notice"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── MANDATORY STRUCTURED EXTRACTION MATRIX TABLE (100% DYNAMIC) ── */}
      <div className="border border-neutral/20 bg-dark-gray/70 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-dark-gray px-6 py-3.5 border-b border-neutral/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-paper">
              EXTRACTED NOTICE DATA MATRIX
            </h3>
          </div>
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/25">
            DYNAMIC METRICS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral/15 bg-ink/40 text-neutral/70">
                <th className="py-3 px-5 font-bold uppercase tracking-wider w-1/3">Field</th>
                <th className="py-3 px-5 font-bold uppercase tracking-wider w-2/3">Extracted Information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral/10">
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Notice Type</td>
                <td className="py-3 px-5 text-paper font-bold">{metrics.noticeType}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Target Audience</td>
                <td className="py-3 px-5 text-paper">{metrics.targetAudience}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Eligibility Criteria</td>
                <td className="py-3 px-5 text-paper">
                  {metrics.eligibility.length > 0 ? (
                    <div className="space-y-1">
                      {metrics.eligibility.map((crit, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-accent font-bold">✓</span>
                          <span>{crit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral/70">Open / No special prerequisites stated in notice</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors bg-accent/5">
                <td className="py-3 px-5 text-accent font-semibold">Action Required</td>
                <td className="py-3 px-5 text-paper font-bold">{metrics.actionRequired}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Deadline</td>
                <td className="py-3 px-5 text-paper font-bold text-accent">
                  {metrics.deadlineDisplay}
                </td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Start Date</td>
                <td className="py-3 px-5 text-paper">{metrics.startDate}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Penalty / Consequence</td>
                <td className={`py-3 px-5 font-bold ${metrics.penalty !== 'None mentioned' ? 'text-rose-300' : 'text-neutral/70'}`}>
                  {metrics.penalty}
                </td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Documents Required</td>
                <td className="py-3 px-5 text-paper">
                  {metrics.docs.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {metrics.docs.map((doc, idx) => (
                        <span key={idx} className="bg-ink px-2 py-0.5 rounded border border-neutral/20 text-[11px] text-paper">
                          {doc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral/70">No specific documents listed</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Where to Act</td>
                <td className="py-3 px-5 text-paper font-bold">{metrics.whereToAct}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Contact / Office</td>
                <td className="py-3 px-5 text-paper">{metrics.contact}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Priority</td>
                <td className="py-3 px-5 text-paper font-bold">{metrics.priority}</td>
              </tr>
              <tr className="hover:bg-dark-gray/50 transition-colors">
                <td className="py-3 px-5 text-neutral font-semibold">Status</td>
                <td className="py-3 px-5">
                  <span className="bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                    {metrics.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Analysis Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Executive Summary, Action Checklist & Eligibility */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Briefing */}
          <div className="border border-neutral/20 bg-dark-gray/60 p-6 md:p-8 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral/15 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px bg-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                  WHAT IS THIS NOTICE ABOUT? // EXECUTIVE BRIEF
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral/50 uppercase tracking-widest">
                VERIFIED PARSING
              </span>
            </div>
            
            <div className="font-mono text-xs md:text-sm leading-relaxed text-paper/95 whitespace-pre-line space-y-3">
              {analysis.summary || 'Summary not available.'}
            </div>
          </div>

          {/* Action Checklist */}
          <div className="border border-neutral/20 bg-dark-gray/40 p-6 md:p-8 rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral/15 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-5 h-px bg-accent" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                    ACTION CHECKLIST ({completedCount}/{actions.length})
                  </h3>
                </div>
                <p className="text-xs font-mono text-neutral/70">
                  Track your step-by-step progress towards completion
                </p>
              </div>

              <span className="text-sm font-mono font-bold text-accent tabular-nums">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-1 bg-neutral/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 shadow-[0_0_8px_#5B6CFF]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div
                  key={idx}
                  onClick={() => handleActionToggle(idx)}
                  className={`flex items-start gap-4 p-3.5 rounded-lg border transition-all cursor-pointer select-none ${
                    action.completed
                      ? 'border-neutral/15 bg-ink/50 opacity-50'
                      : 'border-neutral/20 bg-dark-gray/80 hover:border-accent'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0 mt-0.5 ${
                    action.completed
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-neutral/40 text-transparent'
                  }`}>
                    {action.completed && <Check size={12} />}
                  </div>

                  <span className={`text-xs md:text-sm font-mono tracking-wide ${
                    action.completed ? 'line-through text-neutral' : 'text-paper'
                  }`}>
                    <span className="text-neutral/40 mr-2 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                    {action.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Eligibility Criteria Card */}
          <div className="border border-neutral/20 bg-dark-gray/40 p-6 md:p-8 rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral/15 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px bg-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                  ELIGIBILITY CRITERIA & QUALIFICATIONS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral/50 uppercase">
                {metrics.eligibility.length} CRITERIA DETECTED
              </span>
            </div>

            <div className="space-y-2.5">
              {metrics.eligibility.length > 0 ? (
                metrics.eligibility.map((crit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral/15 bg-ink/60 font-mono text-xs text-paper/90 leading-relaxed">
                    <span className="text-accent font-bold mt-0.5">✓</span>
                    <span>{crit}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border border-neutral/15 bg-ink/60 font-mono text-xs text-neutral/70">
                  Open to all candidates meeting baseline eligibility requirements.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): AI Assistant */}
        <div className="space-y-8">
          <div className="border border-neutral/20 bg-dark-gray/60 p-6 rounded-xl flex flex-col h-[520px]">
            <div className="border-b border-neutral/15 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-paper">
                  ASK THIS NOTICE
                </h3>
              </div>
              <p className="text-[10px] font-mono text-neutral/70 mt-1">
                Contextual AI grounded in notice details
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-neutral/60 font-mono space-y-3">
                  <p className="text-[11px]">Have a question about this notice? Ask below:</p>
                  <div className="flex flex-col gap-2 pt-2">
                    {suggestedQuestions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleAsk(sq)}
                        className="text-left text-[11px] font-mono text-paper/80 bg-ink p-2 rounded border border-neutral/20 hover:border-accent hover:text-accent transition-all cursor-pointer"
                      >
                        • {sq}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg font-mono text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent/15 border border-accent/30 text-paper ml-4'
                        : 'bg-ink border border-neutral/20 text-paper/90 mr-2'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-neutral/50 uppercase block mb-1">
                      {msg.role === 'user' ? 'YOU' : 'AI RESPONSE // NOTICE2ACTION'}
                    </span>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                ))
              )}
              {isAsking && (
                <div className="p-3 rounded-lg bg-ink border border-neutral/20 text-accent font-mono text-xs flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Searching document text...</span>
                </div>
              )}
              {askError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-[11px]">
                  {askError}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleAsk(question); }}
              className="pt-3 border-t border-neutral/15 mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about dates, penalty, portal..."
                disabled={isAsking}
                className="flex-1 bg-ink border border-neutral/20 rounded-lg px-3 py-2 text-xs font-mono text-paper placeholder-neutral/40 focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="p-2 rounded-lg bg-paper text-ink hover:bg-accent hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Raw Extracted Text Drawer */}
      {analysis.extracted_text && (
        <div className="border border-neutral/20 bg-dark-gray/30 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsSourceCollapsed(!isSourceCollapsed)}
            className="w-full flex items-center justify-between p-4 bg-dark-gray/60 text-xs font-mono tracking-wider uppercase text-neutral hover:text-paper transition-colors text-left cursor-pointer"
          >
            <span>RAW DOCUMENT TEXT SOURCE</span>
            {isSourceCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {!isSourceCollapsed && (
            <div className="p-6 bg-ink border-t border-neutral/15 font-mono text-xs text-neutral/70 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {analysis.extracted_text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
