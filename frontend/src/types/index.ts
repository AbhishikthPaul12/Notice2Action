export interface Deadline {
  date: string | null;
  time: string | null;
  relative_days: number | null;
  description: string | null;
  urgency: 'low' | 'medium' | 'high' | 'unknown';
}

export interface ActionItem {
  task: string;
  completed: boolean;
}

export interface NoticeAnalysis {
  title: string;
  notice_type?: string;
  category?: string;
  target_audience?: string;
  action_required?: string;
  deadline: Deadline;
  start_date?: string | null;
  penalty?: string | null;
  documents_required?: string[];
  where_to_act?: string | null;
  contact?: string | null;
  priority?: string;
  status?: string;
  summary: string;
  eligibility: string[];
  actions: ActionItem[];
  important_points: string[];
  extracted_text?: string | null;
}

export interface SavedNotice extends NoticeAnalysis {
  id: string;
  timestamp: number;
}
