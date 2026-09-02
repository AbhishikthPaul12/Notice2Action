import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Clock, 
  Inbox,
  ArrowRight,
  Plus,
  FileText
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

  useEffect(() => {
    setNotices(getSavedNotices());
  }, []);

  const handleCardClick = (id: string) => {
    setCurrentPage(`notices/${id}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'deadline') {
        const aUrgency = a.deadline?.urgency === 'high' ? 3 : a.deadline?.urgency === 'medium' ? 2 : 1;
        const bUrgency = b.deadline?.urgency === 'high' ? 3 : b.deadline?.urgency === 'medium' ? 2 : 1;
        if (bUrgency !== aUrgency) return bUrgency - aUrgency;
        const aDays = a.deadline?.relative_days ?? 999;
        const bDays = b.deadline?.relative_days ?? 999;
        return aDays - bDays;
      }
      return 0;
    });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return '#5B6CFF';
      case 'medium':
        return '#F4F2EC';
      case 'low':
        return '#A8A8A0';
      default:
        return '#A8A8A0';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 text-paper text-left">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral/15 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-[0.2em] text-accent uppercase font-semibold">
              DOCUMENT ARCHIVE // SAVED
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-paper uppercase font-sans">
            MY NOTICES ({notices.length})
          </h2>
          <p className="text-xs font-mono text-neutral/70 mt-1">
            Browse and query all previously analyzed documents stored in local session.
          </p>
        </div>
        
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center justify-center gap-2 rounded-lg bg-paper text-ink hover:bg-accent hover:text-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors self-start sm:self-center cursor-pointer shadow-lg"
        >
          <Plus size={14} />
          <span>Analyze New Notice</span>
        </button>
      </div>

      {/* Controls: Search, filter & sort */}
      {notices.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral/50" />
            <input
              type="text"
              placeholder="Search by title, subject, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral/20 bg-dark-gray/60 pl-10 pr-4 py-2.5 text-xs font-mono text-paper placeholder-neutral/40 focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-neutral/50" />
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as FilterOption)}
              className="w-full appearance-none rounded-lg border border-neutral/20 bg-dark-gray/60 pl-10 pr-8 py-2.5 text-xs font-mono text-paper focus:border-accent focus:outline-none transition-colors cursor-pointer uppercase"
            >
              <option value="all" className="bg-ink">ALL URGENCIES</option>
              <option value="high" className="bg-ink">HIGH URGENCY</option>
              <option value="medium" className="bg-ink">MEDIUM URGENCY</option>
              <option value="low" className="bg-ink">LOW URGENCY</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-3 h-4 w-4 text-neutral/50" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none rounded-lg border border-neutral/20 bg-dark-gray/60 pl-10 pr-8 py-2.5 text-xs font-mono text-paper focus:border-accent focus:outline-none transition-colors cursor-pointer uppercase"
            >
              <option value="newest" className="bg-ink">SORT: NEWEST FIRST</option>
              <option value="oldest" className="bg-ink">SORT: OLDEST FIRST</option>
              <option value="deadline" className="bg-ink">SORT: BY DEADLINE</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {notices.length === 0 ? (
        <div className="rounded-xl border border-neutral/20 bg-dark-gray/40 p-12 text-center shadow-2xl max-w-lg mx-auto my-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink text-neutral mx-auto mb-5 border border-neutral/20">
            <Inbox size={24} className="text-accent" />
          </div>
          <h3 className="text-base font-mono font-bold text-paper tracking-wider uppercase">
            NO NOTICES IN ARCHIVE
          </h3>
          <p className="text-xs font-mono text-neutral/70 mt-2 max-w-sm mx-auto leading-relaxed">
            Upload your first notice to build an automated action plan, extract deadlines, and track your checklist.
          </p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-paper text-ink hover:bg-accent hover:text-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors mx-auto cursor-pointer"
          >
            <span>Upload Notice Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-16 border border-neutral/20 rounded-xl bg-dark-gray/30">
          <p className="text-xs font-mono text-neutral">No notices match your current filters.</p>
          <button
            onClick={() => { setSearch(''); setFilterUrgency('all'); }}
            className="text-xs font-mono text-accent hover:underline mt-2 uppercase tracking-wider cursor-pointer"
          >
            Clear Search Filters
          </button>
        </div>
      ) : (
        /* Editorial Index Layout matching Scene 12 */
        <div className="border-t border-neutral/15">
          {filteredNotices.map((notice, i) => {
            const completedCount = notice.actions?.filter((a) => a.completed).length || 0;
            const totalCount = notice.actions?.length || 0;
            const urgencyColor = getUrgencyColor(notice.deadline?.urgency || 'medium');
            
            return (
              <div
                key={notice.id}
                onClick={() => handleCardClick(notice.id)}
                className="group border-b border-neutral/15 py-6 md:py-8 cursor-pointer transition-all hover:pl-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-6">
                  <span className="font-mono text-2xl md:text-3xl font-light text-neutral/30 tabular-nums leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-paper uppercase tracking-tight group-hover:text-accent transition-colors font-mono">
                      {notice.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral/60 line-clamp-2 mt-1 max-w-2xl">
                      {notice.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 ml-12 md:ml-0 flex-shrink-0">
                  <span
                    className="text-xs font-mono font-bold tracking-widest uppercase"
                    style={{ color: urgencyColor }}
                  >
                    {notice.deadline?.urgency || 'MEDIUM'}
                  </span>

                  <span className="text-[11px] font-mono text-neutral/60 tabular-nums">
                    {notice.deadline?.date || formatDate(notice.timestamp)}
                  </span>

                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">
                    {completedCount}/{totalCount} DONE
                  </span>

                  <ArrowRight size={14} className="text-neutral/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
