import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
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
        message: 'Make sure the FastAPI server is running on port 8000 and try again.',
      });
    } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
      setError({
        title: 'AI analysis limit reached.',
        message: 'AI analysis is temporarily unavailable. Please check the API configuration or quota.',
      });
    } else {
      setError({
        title: 'Analysis failed',
        message: err.message || 'An error occurred while processing the notice text.',
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
    <div className="w-full">
      {/* Hero section: only show when not displaying analysis results */}
      {!analysisResult && !isAnalyzing && (
        <div className="text-center py-12 px-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold gradient-badge shadow-sm">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            Empowered by Actionable AI
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-5 leading-tight">
            Never miss an important <span className="gradient-text">notice again.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3.5 max-w-2xl mx-auto leading-relaxed">
            Upload a document or paste text. Notice2Action extracts deadlines, eligibility, required actions, and critical information in under 30 seconds.
          </p>
        </div>
      )}

      {/* Main workspace container */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-12">
        {isAnalyzing && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <AnalysisLoader />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {error.title}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {error.message}
            </p>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
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
            <div className="flex justify-end px-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw size={14} />
                Analyze another notice
              </button>
            </div>
            
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
