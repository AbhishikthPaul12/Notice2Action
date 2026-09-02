import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';
import { SavedNotice } from '../types';
import { getSavedNotices, saveNotice, deleteNotice } from '../services/api';
import AnalysisDashboard from '../components/AnalysisDashboard';

interface NoticeDetailProps {
  noticeId: string;
  setCurrentPage: (page: string) => void;
}

export default function NoticeDetail({ noticeId, setCurrentPage }: NoticeDetailProps) {
  const [notice, setNotice] = useState<SavedNotice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedNotices();
    const found = saved.find((n) => n.id === noticeId);
    if (found) {
      setNotice(found);
      setError(null);
    } else {
      setError('Notice not found. The notice might have been deleted or does not exist.');
    }
  }, [noticeId]);

  const handleBack = () => {
    setCurrentPage('notices');
  };

  const handleUpdateNotice = (updated: SavedNotice) => {
    saveNotice(updated);
    setNotice(updated);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this notice analysis from history?')) {
      deleteNotice(noticeId);
      setCurrentPage('notices');
    }
  };

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center bg-ink text-paper">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-950/50 text-rose-400 mx-auto mb-4 border border-rose-800/40">
          <AlertCircle size={22} />
        </div>
        <h3 className="text-base font-mono font-bold uppercase tracking-wider">Notice Not Found</h3>
        <p className="text-xs font-mono text-neutral/70 mt-2">{error}</p>
        <button
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-paper text-ink hover:bg-accent hover:text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Archive</span>
        </button>
      </div>
    );
  }

  if (!notice) return null;

  return (
    <div className="w-full bg-ink min-h-full pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral hover:text-paper transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>← Back to Notices Archive</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
        <AnalysisDashboard
          analysis={notice}
          onSave={handleUpdateNotice}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
