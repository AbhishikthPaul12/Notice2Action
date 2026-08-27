import { NoticeAnalysis, SavedNotice } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const LOCAL_STORAGE_KEY = 'notice2action_notices';

export async function analyzeNoticeFile(file: File): Promise<NoticeAnalysis> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze/file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to analyze the notice.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function analyzeNoticeText(text: string): Promise<NoticeAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to analyze the text snippet.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function loginUser(email: string, password: string): Promise<{ name: string; email: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (e) {
    console.warn('Backend auth offline, using client session fallback:', e);
  }
  // Client fallback
  const rawName = email.split('@')[0] || email;
  return { name: rawName.charAt(0).toUpperCase() + rawName.slice(1), email };
}

export async function registerUser(name: string, email: string, password: string): Promise<{ name: string; email: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (e) {
    console.warn('Backend auth offline, using client session fallback:', e);
  }
  return { name: name.trim() || email.split('@')[0], email };
}

export async function askQuestion(noticeText: string, question: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notice_text: noticeText,
      question: question,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to get an answer from the assistant.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.answer;
}

export function getSavedNotices(): SavedNotice[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse saved notices:', error);
    return [];
  }
}

export function saveNotice(notice: SavedNotice): void {
  try {
    const notices = getSavedNotices();
    const index = notices.findIndex((n) => n.id === notice.id);
    if (index >= 0) {
      notices[index] = notice;
    } else {
      notices.unshift(notice);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notices));
  } catch (error) {
    console.error('Failed to save notice:', error);
  }
}

export function deleteNotice(id: string): void {
  try {
    const notices = getSavedNotices();
    const filtered = notices.filter((n) => n.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete notice:', error);
  }
}
