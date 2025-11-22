export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  dateCreated: string;
  lastResult?: number; // as a percentage
}

export interface User {
  name: string;
  email: string;
  profession?: string;
  age?: number;
}
