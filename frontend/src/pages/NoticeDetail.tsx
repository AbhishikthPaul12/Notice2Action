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
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Notice Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <button
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          Back to My Notices
        </button>
      </div>
    );
  }

  if (!notice) return null;

  return (
    <div className="w-full">
      {/* Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to My Notices
        </button>
      </div>

      {/* Main Analysis Dashboard wrapper */}
      <AnalysisDashboard
        analysis={notice}
        onSave={handleUpdateNotice}
        onDelete={handleDelete}
      />
    </div>
  );
}
