export interface HistoryItem {
  action: string;
  points: number;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  points: number;
  badges: string[];
  history: HistoryItem[];
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  title: string;
  type: string;
  description: string;
  content: string;
  status: 'Đã chấm' | 'Chờ chấm';
  score: number | null;
  feedback: string;
  badgeAwarded: string;
  date: string;
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

export interface Scenario {
  id: string;
  grade: string;
  category: string;
  title: string;
  scenario: string;
  choices: Choice[];
}
