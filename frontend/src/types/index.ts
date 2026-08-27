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
  category?: string;
  summary: string;
  deadline: Deadline;
  eligibility: string[];
  actions: ActionItem[];
  important_points: string[];
  extracted_text?: string | null;
}

export interface SavedNotice extends NoticeAnalysis {
  id: string;
  timestamp: number;
}
