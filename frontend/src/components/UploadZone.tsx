import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, AlertCircle, Type, Sparkles, ArrowRight, Check } from 'lucide-react';

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  onAnalyzeText?: (text: string) => void;
  isAnalyzing: boolean;
}

const SAMPLE_NOTICE = `NOTICE NO. 47/2026
APPLICATION FOR NATIONAL MERIT SCHOLARSHIP 2026-27

ELIGIBILITY:
1. Candidates currently enrolled in the final year of their undergraduate programme at any recognized university or institution are eligible to apply.
2. Applicants must have obtained a minimum cumulative grade point average of 7.5 on a 10-point scale or 75% equivalent in their most recent semester examination.
3. Students who have previously received any other government scholarship during the current academic year shall not be eligible.

IMPORTANT DATES:
- Portal Opens: 01 August 2026
- Last Date for Online Submission: 18 September 2026 (11:59 PM IST)
- Deficiency Correction Window: 19 September – 25 September 2026
- Declaration of Merit List: 15 October 2026

DOCUMENTS REQUIRED:
1. Valid government-issued photo identity proof (Aadhaar Card / Passport / Voter ID)
2. Academic mark sheets and grade cards for all completed semesters
3. Recent passport-size photograph (taken within the last 3 months)
4. Completed and signed application form (Form N2A-47)

ACTION ITEMS:
- Complete online registration before 18 September 2026.
- Upload self-attested copies of all mark sheets and identity proof.
- Retain a printed copy of the final submitted application form for institutional verification.`;

export default function UploadZone({ onAnalyze, onAnalyzeText, isAnalyzing }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const maxSizeBytes = 10 * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    setError(null);
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setError(`Unsupported file format. Please upload PDF, DOCX, or TXT.`);
      return false;
    }
    
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is 10 MB.`);
      return false;
    }
    
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyzeClick = () => {
    if (activeTab === 'file' && selectedFile) {
      onAnalyze(selectedFile);
    } else if (activeTab === 'text' && pastedText.trim().length >= 10 && onAnalyzeText) {
      onAnalyzeText(pastedText.trim());
    }
  };

  const handleLoadSample = () => {
    setActiveTab('text');
    setPastedText(SAMPLE_NOTICE);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-paper">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center bg-dark-gray p-1 rounded-lg border border-neutral/20">
          <button
            onClick={() => { setActiveTab('file'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              activeTab === 'file'
                ? 'bg-paper text-ink font-bold shadow-sm'
                : 'text-neutral hover:text-paper'
            }`}
          >
            <Upload size={13} />
            <span>Document Upload</span>
          </button>
          <button
            onClick={() => { setActiveTab('text'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              activeTab === 'text'
                ? 'bg-paper text-ink font-bold shadow-sm'
                : 'text-neutral hover:text-paper'
            }`}
          >
            <Type size={13} />
            <span>Paste Text</span>
          </button>
        </div>

        {/* Quick Sample Button */}
        <button
          onClick={handleLoadSample}
          className="text-[11px] font-mono text-accent hover:text-paper border border-accent/30 hover:border-accent bg-accent/5 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
        >
          <Sparkles size={12} />
          <span>Load Sample Notice</span>
        </button>
      </div>

      {activeTab === 'file' ? (
        !selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 md:p-16 text-center cursor-pointer transition-all duration-300
              ${dragActive 
                ? 'border-accent bg-accent/10 scale-[1.01]' 
                : 'border-neutral/25 hover:border-paper/60 bg-dark-gray/60 hover:bg-dark-gray'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleChange}
              disabled={isAnalyzing}
            />
            
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral/20 bg-ink text-neutral mb-5 group-hover:text-accent transition-colors">
              <Upload size={24} className="text-accent" />
            </div>
            
            <p className="text-base md:text-lg font-bold text-paper uppercase tracking-wider font-mono">
              DROP YOUR NOTICE HERE
            </p>
            <p className="text-xs font-mono text-neutral mt-2 uppercase tracking-widest">
              or click to browse local files
            </p>
            
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral/15 text-[10px] font-mono text-neutral/60 uppercase tracking-widest">
              <span>PDF</span>
              <span>•</span>
              <span>DOCX</span>
              <span>•</span>
              <span>TXT</span>
              <span>•</span>
              <span>UP TO 10MB</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral/20 bg-dark-gray p-6 md:p-8 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral/15 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink border border-neutral/20 text-accent">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-mono font-bold text-paper uppercase truncate max-w-sm sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs font-mono text-neutral/70 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toUpperCase().substring(1)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral/20 hover:border-rose-500 text-neutral hover:text-rose-400 transition-colors"
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-paper hover:bg-accent text-ink hover:text-white py-3.5 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <span>{isAnalyzing ? 'Analyzing Notice...' : 'Process & Extract Action Plan'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )
      ) : (
        /* Text Snippet Mode */
        <div className="rounded-xl border border-neutral/20 bg-dark-gray p-6 md:p-8 text-left shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-paper">
              Paste Raw Notice or Circular Text
            </label>
            <span className="text-[10px] font-mono text-neutral/60">
              {pastedText.trim().length} characters
            </span>
          </div>
          
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Paste circular announcement, scholarship requirements, or exam schedule here..."
            className="w-full h-52 rounded-lg border border-neutral/20 bg-ink p-4 font-mono text-xs text-paper placeholder-neutral/40 focus:border-accent focus:outline-none resize-none leading-relaxed"
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-[11px] font-mono text-neutral/60">
              Minimum 10 characters required
            </span>
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing || pastedText.trim().length < 10}
              className="flex items-center gap-2 rounded-lg bg-paper hover:bg-accent text-ink hover:text-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Text'}</span>
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-rose-950/40 p-4 text-left border border-rose-800/40 text-rose-300 font-mono text-xs">
          <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block mb-0.5">Upload Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
