import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, AlertCircle, Type, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  onAnalyzeText?: (text: string) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({ onAnalyze, onAnalyzeText, isAnalyzing }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

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

  const handleButtonClick = () => {
    inputRef.current?.click();
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl max-w-xs mx-auto border border-slate-200">
        <button
          onClick={() => { setActiveTab('file'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload size={14} />
          Upload Document
        </button>
        <button
          onClick={() => { setActiveTab('text'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type size={14} />
          Paste Text
        </button>
      </div>

      {activeTab === 'file' ? (
        !selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
            className={`
              relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200
              ${dragActive 
                ? 'border-indigo-500 bg-indigo-50/50' 
                : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50'}
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
            
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4 transition-transform group-hover:scale-110">
              <Upload size={24} />
            </div>
            
            <p className="text-base font-semibold text-slate-800">
              Drop your notice here
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Supports PDF, DOCX, TXT up to 10MB
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-sm sm:max-w-md">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {formatFileSize(selectedFile.size)} • {selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toUpperCase().substring(1)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing Notice...' : 'Analyze Document'}
            </button>
          </div>
        )
      ) : (
        /* Text Snippet Tab */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Paste Notice Text Snippet
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Paste raw notice text, announcement email, or circular text here..."
            className="w-full h-44 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">
              {pastedText.trim().length} characters (minimum 10)
            </span>
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing || pastedText.trim().length < 10}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={14} />
              {isAnalyzing ? 'Analyzing Text...' : 'Analyze Text'}
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 p-4 text-left text-sm text-rose-800 border border-rose-100">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-semibold">Upload Error</span>
            <span className="mt-0.5">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
