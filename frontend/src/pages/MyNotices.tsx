import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  Clock, 
  Inbox,
  ArrowRight,
  Plus
} from 'lucide-react';
import { SavedNotice } from '../types';
import { getSavedNotices } from '../services/api';

interface MyNoticesProps {
  setCurrentPage: (page: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'deadline';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

export default function MyNotices({ setCurrentPage }: MyNoticesProps) {
  const [notices, setNotices] = useState<SavedNotice[]>([]);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Load notices on mount
  useEffect(() => {
    setNotices(getSavedNotices());
  }, []);

  const handleCardClick = (id: string) => {
    setCurrentPage(`notices/${id}`);
  };

  // Helper for formatting date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filters & sorts
  const filteredNotices = notices
    .filter((notice) => {
      const matchSearch = 
        notice.title.toLowerCase().includes(search.toLowerCase()) ||
        notice.summary.toLowerCase().includes(search.toLowerCase());
      
      const matchFilter = 
        filterUrgency === 'all' || 
        notice.deadline?.urgency?.toLowerCase() === filterUrgency;

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      }
      if (sortBy === 'oldest') {
        return a.timestamp - b.timestamp;
      }
      if (sortBy === 'deadline') {
        // High urgency and defined deadlines first
        const aUrgency = a.deadline?.urgency === 'high' ? 3 : a.deadline?.urgency === 'medium' ? 2 : 1;
        const bUrgency = b.deadline?.urgency === 'high' ? 3 : b.deadline?.urgency === 'medium' ? 2 : 1;
        if (bUrgency !== aUrgency) return bUrgency - aUrgency;
        
        // Secondary sort on relative_days
        const aDays = a.deadline?.relative_days ?? 999;
        const bDays = b.deadline?.relative_days ?? 999;
        return aDays - bDays;
      }
      return 0;
    });

  // Get status color styling
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-705 border border-rose-100';
      case 'medium':
        return 'bg-amber-50 text-amber-705 border border-amber-100';
      case 'low':
        return 'bg-emerald-50 text-emerald-705 border border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-6 mb-8 text-left">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            My Notices Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse and query all analyzed notices stored in history.
          </p>
        </div>
        
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors self-start sm:self-center"
        >
          <Plus size={16} />
          Analyze New Notice
        </button>
      </div>

      {/* Controls: Search, filter & sort */}
      {notices.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-250 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-805 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Urgency Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as FilterOption)}
              className="w-full appearance-none rounded-xl border border-slate-250 bg-white pl-10 pr-8 py-2.5 text-xs text-slate-805 placeholder-slate-405 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Urgencies</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Low Urgency</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none rounded-xl border border-slate-250 bg-white pl-10 pr-8 py-2.5 text-xs text-slate-805 placeholder-slate-405 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="deadline">Sort: By Deadline</option>
            </select>
          </div>
        </div>
      )}

      {/* Main content Area */}
      {notices.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-xl mx-auto my-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-450 mx-auto mb-5 border border-slate-100">
            <Inbox size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            No notices yet
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Upload your first notice to build your action dashboard, extract deadlines and get a structured checklist.
          </p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-650 px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors mx-auto"
          >
            Upload Notice Now
            <ArrowRight size={14} />
          </button>
        </div>
      ) : filteredNotices.length === 0 ? (
        /* No results empty state */
        <div className="text-center py-12">
          <p className="text-sm font-semibold text-slate-500">No notices match your criteria.</p>
          <button
            onClick={() => { setSearch(''); setFilterUrgency('all'); }}
            className="text-xs text-indigo-600 font-bold hover:underline mt-2"
          >
            Clear Search Filters
          </button>
        </div>
      ) : (
        /* List of Notices */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.map((notice) => {
            const completedCount = notice.actions?.filter((a) => a.completed).length || 0;
            const totalCount = notice.actions?.length || 0;
            
            return (
              <div
                key={notice.id}
                onClick={() => handleCardClick(notice.id)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 text-left relative overflow-hidden hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Header metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(notice.timestamp)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full uppercase ${getUrgencyBadge(notice.deadline?.urgency)}`}>
                      {notice.deadline?.urgency || 'unknown'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                    {notice.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-3 mb-5 leading-relaxed">
                    {notice.summary}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    {/* Action plan checklist status */}
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-slate-400" />
                      {completedCount}/{totalCount} Checklist items
                    </span>

                    {/* Deadline target */}
                    {notice.deadline?.date && (
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                        <Calendar size={12} />
                        {notice.deadline.date}
                      </span>
                    )}
                  </div>
                  
                  {/* Subtle checklist completion bar */}
                  {totalCount > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-3 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
