import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import AnalysisLoader from '../components/AnalysisLoader';
import AnalysisDashboard from '../components/AnalysisDashboard';
import { analyzeNoticeFile, analyzeNoticeText, saveNotice } from '../services/api';
import { NoticeAnalysis, SavedNotice } from '../types';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  onNoticeAnalyzed?: (title: string) => void;
}

export default function Dashboard({ setCurrentPage, onNoticeAnalyzed }: DashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SavedNotice | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const processAnalysisResponse = (data: NoticeAnalysis) => {
    const saved: SavedNotice = {
      ...data,
      id: `notice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    };
    saveNotice(saved);
    setAnalysisResult(saved);
    if (onNoticeAnalyzed) {
      onNoticeAnalyzed(saved.title);
    }
  };

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const data = await analyzeNoticeFile(file);
      processAnalysisResponse(data);
    } catch (err: any) {
      console.error(err);
      handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeText = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const data = await analyzeNoticeText(text);
      processAnalysisResponse(data);
    } catch (err: any) {
      console.error(err);
      handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleError = (err: any) => {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      setError({
        title: 'Unable to connect to Notice2Action backend.',
        message: 'Ensure the FastAPI server is active on port 8000.',
      });
    } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
      setError({
        title: 'AI model rate limit reached.',
        message: 'AI quota is currently busy. Please wait a moment or try again.',
      });
    } else {
      setError({
        title: 'Document Analysis Failed',
        message: err.message || 'An error occurred while parsing the document structure.',
      });
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const handleUpdateNotice = (updated: SavedNotice) => {
    saveNotice(updated);
    setAnalysisResult(updated);
  };

  return (
    <div className="w-full min-h-full bg-ink text-paper p-4 md:p-8">
      {/* Editorial Headline: only show when not analyzing / displaying result */}
      {!analysisResult && !isAnalyzing && (
        <div className="text-center py-8 md:py-12 px-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-4 h-px bg-accent" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-accent uppercase font-semibold">
              DOCUMENT INTELLIGENCE WORKSTATION
            </span>
            <div className="w-4 h-px bg-accent" />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-paper uppercase leading-tight font-sans">
            STOP SEARCHING. <span className="text-accent">START ACTING.</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono text-neutral mt-3 max-w-xl mx-auto leading-relaxed">
            Upload complex college circulars, scholarship announcements, or policy PDFs. Notice2Action instantly resolves deadlines, eligibility, and verified action plans.
          </p>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="mx-auto w-full max-w-6xl pb-16">
        {isAnalyzing && (
          <div className="rounded-xl border border-neutral/20 bg-dark-gray/60 p-6 md:p-12 shadow-2xl">
            <AnalysisLoader />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto rounded-xl border border-rose-800/40 bg-rose-950/30 p-8 text-center shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-900/40 text-rose-400 mx-auto mb-4 border border-rose-700/40">
              <AlertCircle size={22} />
            </div>
            
            <h3 className="text-base font-mono font-bold text-paper uppercase tracking-wider">
              {error.title}
            </h3>
            <p className="text-xs font-mono text-neutral/80 mt-2 max-w-md mx-auto leading-relaxed">
              {error.message}
            </p>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-lg bg-paper text-ink hover:bg-accent hover:text-white px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!isAnalyzing && !error && !analysisResult && (
          <UploadZone onAnalyze={handleAnalyze} onAnalyzeText={handleAnalyzeText} isAnalyzing={isAnalyzing} />
        )}

        {analysisResult && (
          <div className="space-y-6">
            <div className="flex justify-end px-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-neutral/20 bg-dark-gray hover:border-accent hover:text-white px-4 py-2 text-xs font-mono uppercase tracking-wider text-neutral transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw size={13} className="text-accent" />
                <span>Process Another Notice</span>
              </button>
            </div>
            
            <div className="rounded-xl border border-neutral/20 bg-dark-gray/40 shadow-2xl overflow-hidden">
              <AnalysisDashboard 
                analysis={analysisResult} 
                onSave={handleUpdateNotice}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
